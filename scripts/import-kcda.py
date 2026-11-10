"""Convert the local KCDA workbook using only the Python standard library.

Run from the repository root: python scripts/import-kcda.py
The workbook is the source of truth. Missing markers and suspect counts stay raw.
"""

import hashlib
import json
import math
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/Data KCDA 2026.xlsx"
OUTPUT = ROOT / "src/constants/kcda"
NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
DISTRICTS = dict(zip(
    ["010", "020", "021", "022", "023", "030", "031", "040", "041", "090", "091", "092", "100", "101", "102"],
    ["sanga-desa", "babat-toman", "batanghari-leko", "plakat-tinggi", "lawang-wetan", "sungai-keruh", "jirak-jaya", "sekayu", "lais", "sungai-lilin", "keluang", "babat-supat", "bayung-lencir", "lalan", "tungkal-jaya"],
))
NAMES = {slug.replace("-", ""): slug for slug in DISTRICTS.values()}

# Short titles retain the scope of the workbook's original table titles.
SPECS = {
    "1.1": ("Luas wilayah", "geografi", "km²"),
    "1.2": ("Ketinggian dan jarak wilayah", "geografi", "km"),
    "1.3": ("Kepala desa dan alamat kantor", "pemerintahan", "desa/kelurahan"),
    "2.1.1": ("Satuan lingkungan setempat", "pemerintahan", "SLS"),
    "2.2.1": ("Kelengkapan aparatur desa", "pemerintahan", "desa/kelurahan"),
    "2.2.2": ("Jumlah aparatur desa", "pemerintahan", "orang"),
    "2.2.3": ("Status dan klasifikasi desa", "pemerintahan", "desa/kelurahan"),
    "3.1": ("Penduduk menurut desa/kelurahan", "penduduk", "jiwa"),
    "3.2": ("Penduduk menurut kelompok umur", "penduduk", "jiwa"),
    "4.1.1": ("Desa dengan fasilitas sekolah", "sosial", "desa/kelurahan"),
    "4.1.2": ("Satuan pendidikan", "sosial", "sekolah"),
    "4.1.3": ("Kepala sekolah dan pendidik", "sosial", "orang"),
    "4.1.4": ("Peserta didik", "sosial", "orang"),
    "4.1.5": ("Perguruan tinggi per desa", "sosial", "perguruan tinggi"),
    "4.1.6": ("Akses ke sarana pendidikan", "sosial", "desa/kelurahan"),
    "4.2.1": ("Desa dengan sarana kesehatan", "sosial", "desa/kelurahan"),
    "4.3.1": ("Penerangan jalan utama desa", "sosial", "desa/kelurahan"),
    "4.3.2": ("Bahan bakar memasak keluarga", "sosial", "desa/kelurahan"),
    "4.4.1": ("Desa terdampak bencana alam", "sosial", "desa/kelurahan"),
    "4.4.2": ("Desa dengan korban jiwa bencana", "sosial", "desa/kelurahan"),
    "4.4.3": ("Fasilitas mitigasi bencana", "sosial", "desa/kelurahan"),
    "5.1": ("Luas panen sayuran dan buah semusim", "pertanian", "ha"),
    "5.2": ("Produksi sayuran dan buah semusim", "pertanian", "kuintal"),
    "5.3": ("Luas panen tanaman biofarmaka", "pertanian", "m²"),
    "5.4": ("Produksi tanaman biofarmaka", "pertanian", "kg"),
    "5.5": ("Luas panen tanaman hias", "pertanian", "m²"),
    "5.6": ("Produksi tanaman hias", "pertanian", "tangkai/pohon"),
    "5.7": ("Produksi buah dan sayuran tahunan", "pertanian", "kuintal"),
    "5.8": ("Lahan sawah menurut pengairan", "pertanian", "ha"),
    "5.9": ("Lahan bukan sawah menurut penggunaan", "pertanian", "ha"),
    "6.1.1": ("Desa dengan sarana akomodasi", "infrastruktur", "desa/kelurahan"),
    "6.2.1": ("Transportasi antardesa", "infrastruktur", "desa/kelurahan"),
    "6.3.1": ("Desa dengan sarana komunikasi", "infrastruktur", "desa/kelurahan"),
    "7.1": ("Desa dengan layanan perbankan", "ekonomi", "desa/kelurahan"),
    "7.2": ("Desa dengan koperasi aktif", "ekonomi", "desa/kelurahan"),
    "7.3": ("Desa dengan sarana perdagangan", "ekonomi", "desa/kelurahan"),
}


def clean(value):
    return re.sub(r"\s+", " ", str(value or "")).strip()


def number(value):
    if isinstance(value, (int, float)) or value is None:
        return value
    value = clean(value)
    if not re.fullmatch(r"-?[\d.,]+", value) or not re.search(r"\d", value):
        return value or None
    # Text numbers use Indonesian separators; Excel numeric cells are left intact.
    return float(value.replace(".", "").replace(",", "."))


def column_index(letters):
    result = 0
    for char in letters:
        result = result * 26 + ord(char) - 64
    return result


def district_at(table, row):
    name = re.sub(r"[^a-z]", "", table.text(row, 2).lower())
    return NAMES.get(name) or DISTRICTS.get(table.text(row, 1))


class Sheet:
    def __init__(self, archive, path, strings):
        root = ET.fromstring(archive.read(path))
        self.cells, self.styles, self.merges = {}, {}, {}
        for cell in root.findall("s:sheetData/s:row/s:c", NS):
            col, row = re.fullmatch(r"([A-Z]+)(\d+)", cell.attrib["r"]).groups()
            key = (int(row), column_index(col))
            value = cell.find("s:v", NS)
            text = value.text if value is not None else "".join(t.text or "" for t in cell.findall(".//s:t", NS))
            kind = cell.attrib.get("t")
            if kind == "s":
                text = strings[int(text)]
            elif kind not in ("inlineStr", "str", "e", "b") and text:
                text = float(text)
                if text.is_integer():
                    text = int(text)
            self.cells[key] = text if text != "" else None
            self.styles[key] = int(cell.attrib.get("s", 0))
        self.height = max(row for row, _ in self.cells)
        self.width = max(col for _, col in self.cells)
        for merge in root.findall("s:mergeCells/s:mergeCell", NS):
            a, b, c, d = re.fullmatch(r"([A-Z]+)(\d+):([A-Z]+)(\d+)", merge.attrib["ref"]).groups()
            for row in range(int(b), int(d) + 1):
                for col in range(column_index(a), column_index(c) + 1):
                    self.merges[row, col] = (int(b), column_index(a))

    def get(self, row, col, merged=False):
        key = (row, col)
        return self.cells.get(self.merges.get(key, key) if merged else key)

    def text(self, row, col, merged=False):
        return clean(self.get(row, col, merged))


def extract(archive):
    strings = ["".join(t.text or "" for t in si.findall(".//s:t", NS))
               for si in ET.fromstring(archive.read("xl/sharedStrings.xml")).findall("s:si", NS)]
    relations = {r.attrib["Id"]: r.attrib["Target"] for r in ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))}
    styles = ET.fromstring(archive.read("xl/styles.xml"))
    fills = styles.find("s:fills", NS)
    yellow_fills = {i for i, fill in enumerate(fills) if any(c.attrib.get("rgb", "").endswith("FFFF00") or c.attrib.get("indexed") == "6" for c in fill.findall(".//s:fgColor", NS))}
    yellow_styles = {i for i, style in enumerate(styles.find("s:cellXfs", NS)) if int(style.attrib.get("fillId", 0)) in yellow_fills}
    sheets = []
    comparison_area = None
    for entry in ET.fromstring(archive.read("xl/workbook.xml")).findall("s:sheets/s:sheet", NS):
        sheet_id = entry.attrib["name"]
        target = relations[entry.attrib["{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"]]
        table = Sheet(archive, target.lstrip("/") if target.startswith("/") else "xl/" + target, strings)
        glossary = sheet_id.startswith("Daftar Singkatan")
        title, topic, unit = (sheet_id, "referensi", "") if glossary else SPECS[sheet_id]
        years = re.findall(r"20\d{2}(?:/20\d{2})?", table.text(1, 1).split("\n")[0])
        period = years[-1] if years else "Referensi"
        sheet = dict(id=sheet_id, title=title, topic=topic, kind="numeric", unit=unit,
                     columns=[], rows=[], sources=[], notes=[])
        for row in range(1, table.height + 1):
            line = " ".join(table.text(row, col) for col in range(1, min(table.width, 4) + 1)).strip()
            if re.match(r"Sumber\s*[/:]", line, re.I):
                sheet["sources"].append(line)
        if not sheet["sources"]:
            sheet["sources"] = ["Daftar singkatan dalam workbook Data KCDA 2026.xlsx."] if glossary else ["Sumber rinci belum tercantum pada sheet."]

        def add(district, label, row_period, values, group="Utama", row_unit=None):
            record = dict(district=district, label=clean(label), period=str(row_period), group=group,
                          values=[number(v) for v in values])
            if row_unit:
                record["unit"] = row_unit
            sheet["rows"].append(record)

        def columns(labels, units=None):
            sheet["columns"] = [dict(label=clean(label), unit=(units[i] if units else unit)) for i, label in enumerate(labels)]

        if glossary:
            sheet["kind"] = "glossary"
            columns(["Arti", "Istilah bahasa Inggris"])
            for row in range(1, table.height + 1):
                if table.get(row, 1):
                    add("*", table.get(row, 1), "Referensi", [table.get(row, 2 if "Baru" in sheet_id else 3), table.get(row, 3) if "Baru" in sheet_id else None])
        elif sheet_id in ("1.1", "1.2"):
            sheet["kind"] = "withheld"
            sheet["notes"] = [table.text(2, 1), "Angka pada sheet ini tidak digrafikkan karena workbook menyatakan data tidak digunakan. Data pengganti belum disertakan."]
            if sheet_id == "1.1":
                # General comparisons retain the marked figures at the user's request.
                comparison_area = dict(period=period, values={
                    DISTRICTS[table.text(row, 8)]: number(table.get(row, 10))
                    for row in range(5, table.height + 1) if table.text(row, 8) in DISTRICTS
                }, warning=table.text(2, 1))
        elif sheet_id == "3.2":
            columns(["Laki-laki", "Perempuan", "Jumlah"])
            sheet["notes"] = ["Proyeksi penduduk BPS 2020–2035. Berbeda basis dengan data administrasi Dukcapil pada sheet 3.1; jangan dijumlahkan atau dipakai sebagai tren yang sama."]
            for row in range(5, table.height + 1):
                district = district_at(table, row)
                if district:
                    for i, age in enumerate(["0–14 tahun", "15–64 tahun", "65 tahun ke atas"]):
                        add(district, age, period, [table.get(row, col) for col in range(3 + i * 3, 6 + i * 3)])
        elif sheet_id in ("4.1.2", "4.1.3", "4.1.4"):
            columns(["Negeri", "Swasta", "Jumlah"])
            header = 0
            records = {}
            for row in range(2, table.height + 1):
                if table.text(row, 1).lower() == "kode kecamatan":
                    header = row
                district = district_at(table, row)
                if not district or not header:
                    continue
                group = "Tabel utama" if header < 10 else "Rincian madrasah" if header < 40 else "Riwayat pendidikan"
                ownership = ""
                for col in range(3, table.width + 1):
                    ownership = table.text(header, col, True) or ownership
                    row_period = table.text(header + 2, col)
                    if not re.fullmatch(r"20\d{2}/20\d{2}", row_period):
                        continue
                    level = re.sub(r"[\d,]+$", "", table.text(header + 1, col, True))
                    if ownership not in ("Negeri", "Swasta", "Jumlah") or not level:
                        continue
                    key = (district, level, row_period, group)
                    values = records.setdefault(key, [None, None, None])
                    values[["Negeri", "Swasta", "Jumlah"].index(ownership)] = table.get(row, col)
            for (district, level, row_period, group), values in records.items():
                add(district, level, row_period, values, group)
            sheet["notes"] = ["Tabel utama, rincian madrasah, dan riwayat pendidikan ditampilkan terpisah agar angka yang berulang tidak dijumlahkan."]
            if sheet_id != "4.1.2":
                sheet["notes"].append("Sebagian jumlah orang tersimpan sebagai angka pecahan di Excel. Nilai tersebut perlu verifikasi, tetap terlihat di tabel, dan tidak dipakai pada grafik. Pemisah ribuan tidak diasumsikan.")
        elif sheet_id.startswith("5.") and int(sheet_id.split(".")[1]) <= 7:
            columns(["Nilai"])
            header = 4
            for row in range(3, table.height + 1):
                marker = re.fullmatch(r"TAHUN (20\d{2})", table.text(row, 1), re.I)
                if marker:
                    period, header = marker[1], row + 1
                district = NAMES.get(re.sub(r"[^a-z]", "", table.text(row, 1).lower()))
                if not district:
                    continue
                for col in range(2, table.width + 1):
                    label = table.text(header, col)
                    if not label:
                        continue
                    crop = re.sub(r"(?<=[A-Za-z])\d+$", "", label.split("/")[0].split("(")[0].strip())
                    row_unit = "m²" if sheet_id == "5.1" and "(m2/" in label.lower().replace(" ", "") else "pohon" if "(pohon/" in label.lower().replace(" ", "") else "tangkai" if sheet_id == "5.6" else unit
                    group = f"Produksi ({row_unit})" if sheet_id == "5.6" else f"Satuan ({row_unit})" if sheet_id in ("5.1", "5.3") else "Utama"
                    add(district, crop, period, [table.get(row, col)], group, row_unit)
            sheet["notes"] = ["Periode mengikuti setiap blok tahun pada sheet, termasuk tahun 2021 yang tersedia di luar rentang pada judul."]
            if sheet_id in ("5.3", "5.6"):
                sheet["notes"].append("Jenis tanaman dengan satuan berbeda dipisahkan ke pilihan tabel tersendiri; angka antarsatuan tidak dijumlahkan.")
            if sheet_id == "5.1":
                sheet["notes"].append("Luas panen jamur memakai m² sesuai kolom sumber; tanaman lainnya memakai ha. Kedua satuan ditampilkan terpisah.")
        elif sheet_id in ("1.3", "2.1.1", "2.2.1", "2.2.2", "2.2.3", "3.1", "4.1.5", "4.1.6"):
            header = 4 if sheet_id in ("1.3", "4.1.6") else 2
            count = {"1.3": 2, "2.1.1": 4, "2.2.1": 3, "2.2.2": 4, "2.2.3": 4, "3.1": 6, "4.1.5": 3, "4.1.6": 10}[sheet_id]
            labels = [table.text(header, col) for col in range(5, 5 + count)]
            if sheet_id in ("2.1.1", "2.2.3"):
                labels = [re.sub(r"\s*20\d{2}", "", value) for value in labels[:2]]
            columns(labels)
            if sheet_id == "2.1.1":
                sheet["columns"][0]["unit"] = "jenjang"
            if sheet_id == "3.1":
                columns(["Laki-laki", "Perempuan", "Jumlah penduduk", "Distribusi penduduk", "Kepadatan penduduk", "Rasio jenis kelamin"], ["jiwa", "jiwa", "jiwa", "%", "jiwa/km²", "laki-laki per 100 perempuan"])
                sheet["notes"] = ["Data administrasi Dukcapil: Data Konsolidasi Bersih (DKB) Semester I 2026, bukan proyeksi penduduk BPS."]
            if sheet_id in ("2.2.1", "2.2.3", "4.1.6"):
                sheet["kind"] = "categorical"
            if sheet_id == "1.3":
                sheet["kind"] = "directory"
                sheet["notes"] = ["Nama dan alamat mengikuti data tahun 2025. Nama yang diberi sorotan kuning pada sumber dikecualikan sesuai catatan PJ/PLT dalam workbook."]
            if sheet_id == "4.1.6":
                sheet["notes"] = ["Judul asli menyebut Sekayu, tetapi isi mencakup seluruh kecamatan. Pemilahan mengikuti kode kecamatan pada setiap baris."]
            for row in range(header + 1, table.height + 1):
                district = NAMES.get(re.sub(r"[^a-z]", "", table.text(row, 3).lower()))
                if not district:
                    continue
                if sheet_id in ("2.1.1", "2.2.3"):
                    for start, year in [(5, "2024"), (7, "2025")]:
                        add(district, table.get(row, 4), year, [table.get(row, start), table.get(row, start + 1)])
                    continue
                if sheet_id == "4.1.6":
                    period = "2025" if row < 249 else "2024"
                values = [table.get(row, col) for col in range(5, 5 + count)]
                if sheet_id == "1.3" and table.styles.get((row, 5)) in yellow_styles:
                    values[0] = "Dikecualikan (PJ/PLT)"
                add(district, table.get(row, 4), period, values)
        else:
            columns(["Nilai"])
            header = 0
            for row in range(2, table.height + 1):
                marker = re.fullmatch(r"(?:TAHUN )?(20\d{2})", table.text(row, 1), re.I)
                if marker:
                    period = marker[1]
                if "kode kec" in table.text(row, 1).lower():
                    header = row
                district = district_at(table, row)
                if not district or not header:
                    continue
                for col in range(3, table.width + 1):
                    label = table.text(header, col)
                    row_period, group = period, "Utama"
                    if sheet_id == "4.1.1":
                        if header == 4:
                            row_period = table.text(3, col, True)
                            group = "Format baru"
                        else:
                            group = "Rincian jenjang"
                    if sheet_id in ("5.8", "5.9"):
                        label = table.text(header + 1, col)
                    if label:
                        add(district, label, row_period, [table.get(row, col)], group)
            if sheet_id == "5.8":
                sheet["notes"] = ["Sawah nonirigasi mencakup rincian tadah hujan, pasang surut, dan rawa lebak. Kategori induk dan rinciannya tidak dijumlahkan."]
            if sheet_id == "5.9":
                sheet["notes"] = ["Sheet berjudul lahan bukan sawah juga memuat kolom sawah. Label sumber dipertahankan; kategori tidak dijumlahkan sebagai satu total."]
            if sheet_id == "4.1.1":
                sheet["notes"] = ["Format baru menggabungkan TK/RA, SD/MI, dan jenjang sejenis. Rincian jenjang lama disajikan terpisah karena tidak boleh dijumlahkan dengan format baru."]
        sheet["periods"] = sorted({r["period"] for r in sheet["rows"]}, reverse=True) or [period]
        sheets.append(sheet)
    return dict(workbook=SOURCE.name, sha256=hashlib.sha256(SOURCE.read_bytes()).hexdigest(), sheets=sheets), comparison_area


def general_comparisons(data, area):
    districts = list(DISTRICTS.values())
    result = dict(workbook=data["workbook"], sha256=data["sha256"], districts=districts, sheets=[])

    def valid(value, unit):
        return (isinstance(value, (int, float)) and math.isfinite(value) and value >= 0 and
                (unit not in ("jiwa", "SLS", "desa/kelurahan") or float(value).is_integer()))

    def complete_total(rows, column, unit):
        values = [row["values"][column] for row in rows]
        return sum(values) if values and all(valid(value, unit) for value in values) else None

    for sheet in data["sheets"]:
        if not sheet["id"].endswith(".1"):
            continue
        comparison = {key: sheet[key] for key in ("id", "title", "topic", "sources", "notes")}
        comparison["metrics"] = []

        def metric(metric_id, label, unit, periods, value_at, note=None):
            item = dict(id=metric_id, label=label, unit=unit, periods=periods,
                        values={period: [value_at(district, period) for district in districts] for period in periods})
            if note:
                item["note"] = note
            comparison["metrics"].append(item)

        if sheet["id"] == "1.1":
            assert area and set(area["values"]) == set(districts), "Area comparison must cover all districts."
            comparison["notes"] = [area["warning"], "Angka tetap ditampilkan untuk perbandingan sesuai isian workbook, dengan status ditandai tidak digunakan pada sumber."]
            metric("area", "Luas wilayah", "km²", [area["period"]],
                   lambda district, period: area["values"][district],
                   "Ditandai tidak digunakan pada sumber karena selisih dengan tahun lalu. Angka ini bukan luas pengganti yang telah diverifikasi.")
        elif sheet["id"] in ("2.1.1", "2.2.1", "3.1"):
            columns = {"2.1.1": [1], "2.2.1": [0, 1, 2], "3.1": [2, 0, 1]}[sheet["id"]]
            for column in columns:
                unit = sheet["columns"][column]["unit"]
                label = sheet["columns"][column]["label"]
                if sheet["id"] == "2.2.1":
                    label = f"Desa/kelurahan dengan {label.lower()}"

                def aggregate(district, period):
                    rows = [row for row in sheet["rows"] if row["district"] == district and row["period"] == period]
                    if sheet["id"] != "2.2.1":
                        return complete_total(rows, column, unit)
                    values = [clean(row["values"][column]).upper() for row in rows]
                    return values.count("ADA") if values and all(v in ("ADA", "TIDAK ADA") for v in values) else None

                metric(f"column-{column}", label, unit, sheet["periods"], aggregate)
            if sheet["id"] == "2.1.1":
                comparison["notes"] = [*sheet["notes"], "Jumlah SLS terkecil dijumlahkan per kecamatan. Banyak jenjang SLS tidak dijumlahkan."]
            if sheet["id"] == "3.1":
                def density(district, period):
                    rows = [row for row in sheet["rows"] if row["district"] == district and row["period"] == period]
                    population = complete_total(rows, 2, "jiwa")
                    size = area["values"].get(district)
                    return population / size if population is not None and valid(size, "km²") and size > 0 else None

                metric("density", "Kepadatan penduduk (perhitungan)", "jiwa/km²", sheet["periods"], density,
                       f"Perhitungan: penduduk administrasi DKB Semester I 2026 ÷ luas wilayah {area['period']} (sheet 1.1). Tahun berbeda; luas ditandai tidak digunakan pada sumber. Bukan angka kepadatan resmi yang telah diverifikasi. Kepadatan desa tidak dijumlahkan atau dirata-ratakan.")
        else:
            for group, label in dict.fromkeys((row["group"], row["label"]) for row in sheet["rows"]):
                rows = [row for row in sheet["rows"] if row["group"] == group and row["label"] == label]
                unit = rows[0].get("unit", sheet["unit"])
                periods = sorted({row["period"] for row in rows}, reverse=True)

                def value_at(district, period):
                    row = next((row for row in rows if row["district"] == district and row["period"] == period), None)
                    value = row["values"][0] if row else None
                    return value if valid(value, unit) else None

                metric(f"{group}|{label}", label if group == "Utama" or group.startswith("Satuan (") else f"{label} ({group.lower()})",
                       unit, periods, value_at)
            if sheet["unit"] == "desa/kelurahan":
                comparison["notes"] = [*sheet["notes"], "Nilai menunjukkan jumlah desa/kelurahan pada kategori terpilih, bukan jumlah fasilitas. Satu desa dapat tercatat dalam beberapa kategori; kategori tidak dijumlahkan."]
        result["sheets"].append(comparison)
    return result


if __name__ == "__main__":
    with ZipFile(SOURCE) as archive:
        data, comparison_area = extract(archive)
    assert len(data["sheets"]) == 38, "Workbook sheet coverage changed; review the importer."
    for sheet in data["sheets"]:
        if sheet["kind"] not in ("withheld", "glossary"):
            assert {r["district"] for r in sheet["rows"]} == set(DISTRICTS.values()), sheet["id"]
        keys = [(r["district"], r["label"], r["period"], r["group"]) for r in sheet["rows"]]
        assert len(keys) == len(set(keys)), f"Duplicate rows in {sheet['id']}"
        assert all(len(r["values"]) == len(sheet["columns"]) for r in sheet["rows"]), sheet["id"]
    OUTPUT.mkdir(exist_ok=True)
    overview = {"workbook": data["workbook"], "sha256": data["sha256"],
                "periods": {"population": "2026", "villages": "2025", "sls": "2025"},
                "sources": {sheet["id"]: sheet["sources"] for sheet in data["sheets"]
                            if sheet["id"] in ("3.1", "2.2.3", "2.1.1")}, "districts": []}
    for district in DISTRICTS.values():
        local = {**data, "district": district, "sheets": [
            {**sheet, "rows": [{k: v for k, v in row.items() if k != "district"}
                              for row in sheet["rows"] if row["district"] in (district, "*")]}
            for sheet in data["sheets"]
        ]}
        (OUTPUT / f"{district}.json").write_text(json.dumps(local, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
        def rows_for(sheet_id, metric):
            return [row for sheet in local["sheets"] if sheet["id"] == sheet_id
                    for row in sheet["rows"] if row["period"] == overview["periods"][metric]]

        def total(sheet_id, metric, column):
            values = [row["values"][column] for row in rows_for(sheet_id, metric)]
            return sum(values) if values and all(isinstance(value, (int, float)) and
                                                value >= 0 and float(value).is_integer() for value in values) else None

        villages = rows_for("2.2.3", "villages")
        overview["districts"].append(dict(slug=district, population=total("3.1", "population", 2),
                                         villages=len(villages) if villages else None,
                                         sls=total("2.1.1", "sls", 1)))
    (OUTPUT.parent / "kcda-overview.json").write_text(json.dumps(overview, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    comparisons = general_comparisons(data, comparison_area)
    (OUTPUT.parent / "kcda-general.json").write_text(json.dumps(comparisons, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Imported {len(data['sheets'])} sheets, {sum(len(s['rows']) for s in data['sheets'])} rows for {len(DISTRICTS)} districts to {OUTPUT.relative_to(ROOT)}")

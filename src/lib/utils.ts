import { isKecamatanStatisticsPath } from "../constants/maps";
import { loginRoute, navItems } from "../constants/navigation";

export { cn } from "cn";
export type WithoutChild<T> = T extends { child?: unknown } ? Omit<T, "child"> : T;
export type WithoutChildren<T> = T extends { children?: unknown } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

  const validPaths = new Set([...navItems.map((item) => item.path), "/admin-dashboard", loginRoute.path]);


export  function normalizePath(path: string) {
    const cleaned = path.replace(/\/+$/, "") || "/";
    return validPaths.has(cleaned) || isKecamatanStatisticsPath(cleaned) ? cleaned : "/";
  }

export  function formatCurrentDate() {
    return `${new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta"
    }).format(new Date())} - WIB`;
  }

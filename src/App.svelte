<script lang="ts">
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { Toaster } from "$lib/components/ui/sonner/index.js";
  import SearchDialog from "./components/common/search-dialog.svelte";
  import Footer from "./components/layout/footer.svelte";
  import Navbar from "./components/layout/navbar.svelte";
  import { loginRoute, navItems } from "./constants/navigation";
  import NavBottom from "./components/layout/nav-bottom.svelte";
  import { formatCurrentDate, normalizePath } from "./lib/utils";

  let currentPath = $state(
    normalizePath(
      typeof window === "undefined" ? "/" : window.location.pathname,
    ),
  );
  let isNavbarScrolled = $state(false);
  let searchDialogOpen = $state(false);
  const isLoginPage = $derived(currentPath === loginRoute.path);

  const activePage = $derived(
    navItems.find(
      (item) =>
        currentPath === item.path ||
        (item.path !== "/" && currentPath.startsWith(`${item.path}/`)),
    ) ?? navItems[0],
  );
  const currentDate = formatCurrentDate();

  function navigate(path: string) {
    const nextPath = normalizePath(path);
    if (nextPath !== currentPath) {
      history.pushState({}, "", nextPath);
      currentPath = nextPath;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showToast(message: string) {
    toast(message, { id: "app-notification" });
  }

  onMount(() => {
    const handleScroll = () => {
      isNavbarScrolled = window.scrollY > 16;
    };

    const handlePopState = () => {
      currentPath = normalizePath(window.location.pathname);
      window.scrollTo({ top: 0 });
    };

    const handleShortcut = (event: KeyboardEvent) => {
      const isSearchShortcut =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
      if (isLoginPage || !isSearchShortcut) return;
      event.preventDefault();
      searchDialogOpen = true;
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("keydown", handleShortcut);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("keydown", handleShortcut);
    };
  });
</script>

<svelte:head>
  <title
    >{isLoginPage ? "Masuk admin" : currentPath === "/admin-dashboard" ? "Dashboard Admin" : activePage.label}
    - Pojok BPS Muba</title
  >
  <meta
    name="description"
    content="Pojok BPS Muba: informasi statistik Kabupaten Musi Banyuasin, publikasi BPS, kegiatan, dan kanal pelayanan statistik."
  />
</svelte:head>
<Toaster
  position="bottom-right"
  duration={4500}
  closeButton
  containerAriaLabel="Notifikasi"
  closeButtonAriaLabel="Tutup notifikasi"
/>

{#if !isLoginPage}
  <Navbar
    {currentPath}
    {currentDate}
    {isNavbarScrolled}
    bind:searchDialogOpen
    {navigate}
    {showToast}
  />
{/if}

<NavBottom {currentPath} {navigate} {showToast} />

{#if !isLoginPage}
  <Footer {navigate} />
  <SearchDialog bind:open={searchDialogOpen} {navigate} />
{/if}

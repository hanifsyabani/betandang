<script lang="ts">
  import { navItems } from "../../constants/navigation";
  import type { NavbarProps } from "../../types/components";
  import { interactive, menuTransition } from "../../lib/motion.svelte";

  let {
    currentPath,
    currentDate,
    isNavbarScrolled = false,
    searchDialogOpen = $bindable(false),
    navigate,
    showToast,
  }: NavbarProps = $props();

  let mobileMenuOpen = $state(false);
  let menuButton: HTMLButtonElement;

  function handleNavClick(path: string) {
    navigate(path);
    mobileMenuOpen = false;
  }

  function isActivePath(path: string) {
    return (
      currentPath === path ||
      (path !== "/" && currentPath.startsWith(`${path}/`))
    );
  }
</script>

<svelte:window onkeydown={(event) => {
  if (event.key === "Escape" && mobileMenuOpen) {
    mobileMenuOpen = false;
    menuButton.focus();
  }
}} />

<nav
  class={[
    "sticky top-0 z-50 border-b py-2  border-ink-line bg-ink text-portal-body transition-shadow",
    isNavbarScrolled && "shadow-md",
  ]}
>
  <div class="max-w-7xl mx-auto">
    <div class=" flex min-h-17 items-center justify-between gap-4 md:min-h-16 px-4 lg:px-0">
      <button
        type="button"
        onclick={() => handleNavClick("/")}
      >
        <img
          src="/logo.png"
          alt="Logo BPS"
          class="w-40 rounded-md object-contain"
        />
        
      </button>

      <div class="flex shrink-0 items-center gap-2.5">
        <button
          {@attach interactive()}
          type="button"
          class="hidden min-h-10 min-w-62.5 items-center justify-between gap-3 rounded-lg border border-ink-line bg-ink-soft px-3 text-sm text-portal-body md:inline-flex"
          onclick={() => (searchDialogOpen = true)}
          aria-label="Buka pencarian"
        >
          <span>Cari topik data</span>
          <kbd
            class="min-w-13.5 rounded-md border border-inverse/15 px-1.5 py-0.5 text-[0.7rem] font-bold text-portal-text"
            >Ctrl K</kbd
          >
        </button>
        <div
          class="hidden items-center rounded-lg border border-ink-line bg-ink-soft p-0.5 md:inline-flex"
          aria-label="Pilihan bahasa"
        >
          <button
            type="button"
            class="min-h-8 min-w-9 rounded-md bg-bps-sky/20 text-xs font-bold text-portal-text"
            onclick={() => showToast("Bahasa Indonesia aktif.")}>ID</button
          >
          <button
            type="button"
            class="min-h-8 min-w-9 rounded-md text-xs font-bold text-portal-muted hover:text-portal-text"
            onclick={() => showToast("Versi bahasa Inggris belum tersedia.")}
            >EN</button
          >
        </div>

        <button
          {@attach interactive()}
          bind:this={menuButton}
          type="button"
          class="grid size-11 place-items-center rounded-lg hover:bg-ink-soft xl:hidden"
          onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            class="size-6"
            ><title>menu-3-line</title><path
              fill="currentColor"
              d={mobileMenuOpen ? "M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4Z" : "M3 4h18v2H3zm6 7h12v2H9zm-6 7h18v2H3z"}
            /></svg
          >
        </button>
      </div>
    </div>

    <div class="hidden border-t border-ink-line xl:block">
      <nav
        class=" flex min-h-11.5 items-center justify-between gap-4"
        aria-label="Navigasi utama"
      >
        <ul class="flex items-center gap-1">
          {#each navItems as item}
            <li>
              <a
                href={item.path}
                class="inline-flex min-h-9.5 items-center border-b-2 border-transparent px-3 text-sm font-bold whitespace-nowrap text-portal-muted transition-colors hover:border-bps-sky hover:text-portal-text aria-[current=page]:border-bps-sky aria-[current=page]:text-portal-text"
                aria-current={isActivePath(item.path) ? "page" : undefined}
                onclick={(event) => {
                  event.preventDefault();
                  handleNavClick(item.path);
                }}
              >
                {item.label}
              </a>
            </li>
          {/each}
        </ul>
        <span class="text-xs text-portal-muted">{currentDate}</span>
      </nav>
    </div>
  </div>

  {#if mobileMenuOpen}
    <nav
      id="mobile-navigation"
      transition:menuTransition
      class="grid gap-1 border-t border-ink-line bg-ink px-4 pt-3.5 pb-4 xl:hidden"
      aria-label="Navigasi seluler"
    >
      {#each navItems as item}
        <a
          href={item.path}
          class="inline-flex min-h-11 w-full items-center rounded-lg border border-transparent px-3 text-sm font-bold text-portal-muted hover:text-portal-text aria-[current=page]:border-ink-line aria-[current=page]:bg-ink-soft aria-[current=page]:text-portal-text"
          aria-current={isActivePath(item.path) ? "page" : undefined}
          onclick={(event) => {
            event.preventDefault();
            handleNavClick(item.path);
          }}
        >
          {item.label}
        </a>
      {/each}
    </nav>
  {/if}
</nav>

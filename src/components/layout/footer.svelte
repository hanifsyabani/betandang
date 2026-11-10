<script lang="ts">
  import { ArrowUpRightIcon, LogInIcon } from "lucide-svelte";
  import { footerExternalLinks, footerServiceLinks, loginRoute, navItems } from "../../constants/navigation";
  import {  footerContactInformation } from "../../constants/prototype";
  import type { NavigationProps } from "../../types/components";

  let { navigate }: NavigationProps = $props();
</script>

<footer class="bg-ink text-portal-body">
  <div class="border-b border-inverse/15" aria-hidden="true">
    <div class="page-container flex items-center justify-center gap-5 py-10 opacity-20 sm:gap-7 md:py-12 lg:gap-10 lg:py-16">
      <img src="/logo.png" alt="" class="w-16 shrink-0 brightness-0 invert sm:w-24 lg:w-36" width="661" height="512" />
      <p class="min-w-0 text-[2rem] leading-[1.1] font-bold text-inverse sm:text-5xl lg:text-[4.5rem] xl:text-[5.25rem]">
        Betandang
      </p>
    </div>
  </div>

  <div
    class="px-10 grid gap-x-8 gap-y-10 py-10 md:grid-cols-2 md:py-14 xl:grid-cols-[1.45fr_0.8fr_1fr_1.1fr] xl:gap-x-10 xl:py-16"
  >
    <div>
      <h2 class="text-xl leading-snug font-semibold text-inverse">Terhubung dengan BPS Muba</h2>
      <p class="mt-4 max-w-[38ch] text-sm leading-7">
        Temukan data, publikasi, statistik  di Musi Banyuasin.
      </p>
      
    </div>

    <nav aria-label="Navigasi footer">
      <h2 class="mb-4 text-base font-semibold ">Navigasi</h2>
      <ul class="grid gap-1 text-sm">
        {#each navItems as item}
          <li>
            <a
              href={item.path}
              class="inline-flex min-h-11 items-center py-2 transition-colors hover:text-inverse focus-visible:outline-inverse"
              onclick={(event) => {
                event.preventDefault();
                navigate(item.path);
              }}
            >
              {item.label}
            </a>
          </li>
        {/each}
      </ul>
    </nav>

    <nav class="border-t border-inverse/15 pt-8 md:border-t-0 md:border-l md:pt-0 md:pl-8 xl:pl-10" aria-label="Layanan footer">
      <h2 class="mb-4 text-base font-semibold ">Layanan</h2>
      <ul class="grid gap-1 text-sm">
        {#each footerExternalLinks as item}
          <li>
            <a
              href={item.path}
              class="inline-flex min-h-11 items-center gap-2 py-2 transition-colors hover:text-inverse focus-visible:outline-inverse"
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.label}
            </a>
          </li>
        {/each}
        {#each footerServiceLinks as item}
          <li>
            <a
              href={item.path}
              class="inline-flex min-h-11 items-center py-2 transition-colors hover:text-inverse focus-visible:outline-inverse"
              onclick={(event) => {
                event.preventDefault();
                navigate(item.path);
              }}
            >
              {item.label}
            </a>
          </li>
        {/each}
      </ul>
    </nav>

    <div class="border-t border-inverse/15 pt-8 md:border-t-0 md:border-l md:pt-0 md:pl-8 xl:pl-10">
      <h2 class="mb-5 text-base font-semibold ">Kantor BPS Muba</h2>
      <address class="space-y-4 text-sm leading-7 not-italic">
        {#each footerContactInformation as information}
          <p>{information}</p>
        {/each}
      </address>
    </div>
  </div>

  <div class="border-t border-inverse/15">
    <div class="page-container text-center gap-2 py-5 text-xs sm:flex-row sm:items-center sm:gap-6">
      <span>&copy; {new Date().getFullYear()} Badan Pusat Statistik Musi Banyuasin</span>
      
    </div>
  </div>
</footer>

<script lang="ts">
  import type { LoadingIndicatorProps } from "../../types/components";

  let { label }: LoadingIndicatorProps = $props();
</script>

<div class="grid justify-items-center" role="status" aria-live="polite" aria-atomic="true">
  <span class="loader" aria-hidden="true"></span>
  <span class="sr-only">{label}</span>
</div>

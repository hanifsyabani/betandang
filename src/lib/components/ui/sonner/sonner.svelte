<script lang="ts">
	import { Toaster as Sonner, type ToasterProps as SonnerProps } from "svelte-sonner";
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import CircleCheckIcon from '@lucide/svelte/icons/circle-check';
	import OctagonXIcon from '@lucide/svelte/icons/octagon-x';
	import InfoIcon from '@lucide/svelte/icons/info';
	import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';
	import XIcon from '@lucide/svelte/icons/x';

	let { theme = "light", ...restProps }: SonnerProps = $props();
</script>

<Sonner
	{theme}
	class="toaster group"
	style="--normal-bg: var(--color-surface); --normal-text: var(--color-ink); --normal-border: var(--color-border-default);"
	toastOptions={{
		classes: {
			toast: "font-sans! rounded-lg! pr-14! text-sm!",
			description: "text-muted!",
			closeButton: "top-0! right-0! left-auto! size-11! transform-none! rounded-md! border-0! bg-transparent! text-ink!",
		},
	}}
	{...restProps}
>
	{#snippet loadingIcon()}
		<Loader2Icon class="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
	{/snippet}
	{#snippet successIcon()}
		<CircleCheckIcon class="size-4 text-bps-green-text" aria-hidden="true" />
	{/snippet}
	{#snippet errorIcon()}
		<OctagonXIcon class="size-4 text-danger-text" aria-hidden="true" />
	{/snippet}
	{#snippet infoIcon()}
		<InfoIcon class="size-4 text-bps-sky-text" aria-hidden="true" />
	{/snippet}
	{#snippet warningIcon()}
		<TriangleAlertIcon class="size-4 text-bps-orange-text" aria-hidden="true" />
	{/snippet}
	{#snippet closeIcon()}
		<XIcon class="size-4" aria-hidden="true" />
	{/snippet}
</Sonner>

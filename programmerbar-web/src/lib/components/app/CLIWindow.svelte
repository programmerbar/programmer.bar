<script lang="ts">
	import { X } from '@lucide/svelte';
	type Props = {
		title: string;
		children?: import('svelte').Snippet;
		class?: string;
	};

	let { title, children, class: className = '' }: Props = $props();
</script>

<div class="border-border bg-card flex flex-col border-2 font-mono {className}">
	<!-- Window Title Bar -->
	<div class="border-border bg-card-muted flex items-center justify-between border-b px-3 py-1.5">
		<div class="flex items-center gap-2">
			<div class="flex shrink-0 gap-1.5">
				<button
					onclick={() => window.history.back()}
					class="bg-accent-error flex h-3 w-3 items-center justify-center rounded-full transition-opacity
  hover:opacity-80"
					aria-label="Close"
				>
					<X class="h-2 w-2 text-black" strokeWidth={3} />
				</button>
				<div class="bg-accent-warning h-3 w-3 rounded-full"></div>
				<div class="bg-accent-success h-3 w-3 rounded-full"></div>
			</div>
			<h1 class="text-foreground-secondary ml-2 line-clamp-1 min-w-0 flex-1 text-xs font-medium">
				<span class="text-foreground-muted">$</span>
				<span class="ml-1">{title}</span>
			</h1>
		</div>
	</div>

	<!-- Window Content -->
	<div class="flex min-h-0 flex-1 flex-col">
		{@render children?.()}
	</div>
</div>

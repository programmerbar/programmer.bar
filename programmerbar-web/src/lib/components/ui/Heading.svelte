<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = HTMLAttributes<HTMLHeadingElement> & {
		level?: 1 | 2 | 3 | 4 | 5 | 6;
	};

	let { level = 1, class: className, children, ...props }: Props = $props();

	const tag = $derived(`h${level}` as const);
</script>

<svelte:element
	this={tag}
	class={cn(
		'text-lg font-medium text-gray-900 dark:text-gray-100',
		{
			'text-2xl': level === 1,
			'text-xl': level === 2
		},
		className
	)}
	{...props}
>
	{@render children?.()}
</svelte:element>

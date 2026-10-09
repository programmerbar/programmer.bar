<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils/cn';
	import { checkboxClass } from '$lib/components/styles/checkbox';

	type Props = HTMLInputAttributes & {
		checked?: boolean;
		label?: string;
	};

	let { class: className, checked = $bindable(false), label, id, ...props }: Props = $props();
</script>

<div class="flex items-center justify-between py-2">
	{#if label}
		<label for={id} class="text-sm font-semibold dark:text-gray-200">{label}</label>
	{/if}
	<input {id} type="checkbox" bind:checked class={cn(checkboxClass, className)} {...props} />
</div>

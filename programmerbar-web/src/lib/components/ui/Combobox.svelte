<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Check } from '@lucide/svelte';
	import { Combobox, type WithoutChildrenOrChild, mergeProps } from 'bits-ui';
	import { getThemeContext } from '$lib/states/theme.svelte';

	type Props = Combobox.RootProps & {
		inputProps?: WithoutChildrenOrChild<Combobox.InputProps>;
		contentProps?: WithoutChildrenOrChild<Combobox.ContentProps>;
		name?: string;
		disabledOptions?: string[];
	};

	let {
		items = [],
		value = $bindable(),
		open = $bindable(false),
		inputProps,
		contentProps,
		type,
		disabledOptions,
		...restProps
	}: Props = $props();

	let searchValue = $state('');

	const filteredItems = $derived.by(() => {
		if (searchValue === '') return items;
		return items.filter((item) => item.label.toLowerCase().includes(searchValue.toLowerCase()));
	});

	function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
		searchValue = e.currentTarget.value;
	}

	function handleOpenChange(newOpen: boolean) {
		if (!newOpen) {
			searchValue = '';
		}
	}

	const mergedRootProps = $derived(mergeProps(restProps, { onOpenChange: handleOpenChange }));
	const mergedInputProps = $derived(mergeProps(inputProps, { oninput: handleInput }));

	const theme = getThemeContext();
</script>

<Combobox.Root {type} {items} bind:value={value as never} bind:open {...mergedRootProps}>
	<Combobox.Input
		{...mergedInputProps}
		class={cn(
			'placeholder:text-foreground-alt/50 border-input-border bg-input-background focus:border-border focus:outline-primary inline-flex h-10 w-full truncate rounded-lg border px-4 transition-colors focus:ring-0 dark:text-gray-100 dark:placeholder:text-gray-500',
			mergedInputProps.class
		)}
	/>

	<Combobox.Portal>
		<div class={theme.isDark ? 'dark' : ''}>
			<Combobox.Content
				class="border-portal-border dark:bg-portal-card max-h-52 w-(--bits-combobox-anchor-width) min-w-(--bits-combobox-anchor-width) overflow-y-auto rounded-xl border bg-white px-1 py-3 shadow outline-none"
				sideOffset={8}
				{...contentProps}
			>
				{#each filteredItems as option (option.value)}
					<Combobox.Item
						class="data-highlighted:bg-muted data-selected:bg-accent dark:data-highlighted:bg-portal-hover dark:data-selected:bg-portal-hover flex h-10 w-full items-center rounded-lg py-3 pr-1.5 pl-5 text-sm capitalize transition-all duration-75 outline-none select-none data-disabled:cursor-not-allowed data-disabled:opacity-50 dark:text-gray-100"
						value={option.value}
						label={option.label}
						disabled={disabledOptions?.includes(option.value)}
					>
						{#snippet children({ selected })}
							{option.label}
							{#if selected}
								<Check class="ml-auto h-4 w-4" />
							{/if}
						{/snippet}
					</Combobox.Item>
				{:else}
					<span class="text-muted-foreground block px-5 py-2 text-sm dark:text-gray-400"
						>No results found</span
					>
				{/each}
			</Combobox.Content>
		</div>
	</Combobox.Portal>
</Combobox.Root>

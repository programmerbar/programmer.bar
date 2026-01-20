<script lang="ts">
	import Input from '$lib/components/ui/Input.svelte';

	type Props = {
		min: number;
		max: number;
		value: { min: number; max: number };
		onUpdate: (value: { min: number; max: number }) => void;
		label?: string;
	};

	let { min, max, value, onUpdate, label = 'Prisområde' }: Props = $props();

	let minValue = $state(min);
	let maxValue = $state(max);

	// Update internal values when props change
	$effect(() => {
		minValue = value.min;
		maxValue = value.max;
	});

	// Handle min value changes
	$effect(() => {
		const newMin = Math.max(min, Math.min(max, Number(minValue)));
		onUpdate({ min: newMin, max: Math.max(newMin, maxValue) });
	});

	// Handle max value changes
	$effect(() => {
		const newMax = Math.max(min, Math.min(max, Number(maxValue)));
		onUpdate({ min: Math.min(minValue, newMax), max: newMax });
	});
</script>

<div class="flex flex-col gap-2">
	{#if label}
		<span class="text-sm font-semibold">{label}</span>
	{/if}

	<div class="grid grid-cols-2 gap-2">
		<div class="flex flex-col gap-1">
			<label for="price-min" class="text-xs text-gray-500">Fra</label>
			<div class="relative">
				<Input
					id="price-min"
					type="number"
					{min}
					{max}
					bind:value={minValue}
					class="h-8 pr-8 text-sm"
				/>
				<span class="absolute top-1/2 right-2 -translate-y-1/2 text-xs text-gray-500">kr</span>
			</div>
		</div>

		<div class="flex flex-col gap-1">
			<label for="price-max" class="text-xs text-gray-500">Til</label>
			<div class="relative">
				<Input
					id="price-max"
					type="number"
					{min}
					{max}
					bind:value={maxValue}
					class="h-8 pr-8 text-sm"
				/>
				<span class="absolute top-1/2 right-2 -translate-y-1/2 text-xs text-gray-500">kr</span>
			</div>
		</div>
	</div>
</div>

<script lang="ts">
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
		<label class="text-foreground-secondary text-xs font-medium">{label}</label>
	{/if}

	<div class="grid grid-cols-2 gap-2">
		<div class="flex flex-col gap-1">
			<label for="price-min" class="text-foreground-secondary text-xs font-medium">Fra</label>
			<div class="relative">
				<input
					id="price-min"
					type="number"
					{min}
					{max}
					bind:value={minValue}
					class="border-border bg-card-muted focus:border-primary h-8 w-full border px-2 py-1.5 pr-8 font-mono text-sm focus:ring-0 focus:outline-none"
				/>
				<span class="text-foreground-muted absolute top-1/2 right-2 -translate-y-1/2 text-xs"
					>kr</span
				>
			</div>
		</div>

		<div class="flex flex-col gap-1">
			<label for="price-max" class="text-foreground-secondary text-xs font-medium">Til</label>
			<div class="relative">
				<input
					id="price-max"
					type="number"
					{min}
					{max}
					bind:value={maxValue}
					class="border-border bg-card-muted focus:border-primary h-8 w-full border px-2 py-1.5 pr-8 font-mono text-sm focus:ring-0 focus:outline-none"
				/>
				<span class="text-foreground-muted absolute top-1/2 right-2 -translate-y-1/2 text-xs"
					>kr</span
				>
			</div>
		</div>
	</div>
</div>

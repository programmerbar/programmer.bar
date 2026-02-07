<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type Props = {
		status: {
			message: string;
			code: number;
		} | null;
	};

	let { status }: Props = $props();
</script>

{#if status}
	<div class="flex w-full justify-center py-3">
		<div
			class={cn(
				'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium shadow-sm transition-all duration-300',
				{
					'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300':
						status.code === 0,
					'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300':
						status.code === 1,
					'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300':
						status.code === 2
				}
			)}
		>
			<div
				class={cn('h-2 w-2 rounded-full', {
					'bg-red-600 dark:bg-red-400': status.code === 0,
					'bg-emerald-600 dark:bg-emerald-400': status.code === 1,
					'bg-amber-600 dark:bg-amber-400': status.code === 2
				})}
			></div>
			{status.message}
		</div>
	</div>
{/if}

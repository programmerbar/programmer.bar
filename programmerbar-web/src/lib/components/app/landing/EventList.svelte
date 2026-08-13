<script lang="ts">
	import type { Happening } from '$lib/api/sanity/echo-cms';
	import { time } from '$lib/utils/date';
	import { resolve } from '$app/paths';
	import CLIWindow from '$lib/components/app/CLIWindow.svelte';

	type EventWithTime = Happening & { startTime?: string | { hour: number; minute: number } };

	type Props = {
		events: Array<EventWithTime>;
	};

	let { events }: Props = $props();

	function formatTime(
		timeValue: string | { hour: number; minute: number } | undefined
	): string | null {
		if (!timeValue) return null;

		// If it's already a string, return it
		if (typeof timeValue === 'string') {
			return timeValue;
		}

		// If it's an object with hour and minute
		if (typeof timeValue === 'object' && 'hour' in timeValue) {
			const hour = timeValue.hour ?? 0;
			const minute = timeValue.minute ?? 0;
			return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
		}

		return null;
	}

	function getDayOfWeek(date: string): string {
		const d = new Date(date);
		const days = ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'];
		return days[d.getDay()];
	}

	function getDayNumber(date: string): string {
		const d = new Date(date);
		return d.getDate().toString();
	}

	function getMonth(date: string): string {
		const d = new Date(date);
		const months = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'Mai',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Okt',
			'Nov',
			'Des'
		];
		return months[d.getMonth()];
	}
</script>

<CLIWindow title="ls -la arrangementer/">
	<!-- Window Content -->
	<div class="flex-1 p-6 md:p-8">
		<ul class="flex flex-col gap-4 overflow-hidden">
			{#each events as event (`${event.slug}${event.date}`)}
				{@const { title, date, slug, startTime } = event}
				{@const eventTime = formatTime(startTime) || (time(date) !== '00:00' ? time(date) : null)}
				<li class="group">
					<a href={resolve('/(app)/arrangement/[slug]', { slug })} class="block">
						<div
							class="border-primary bg-card-muted hover:border-primary-dark hover:bg-card-hover border-l-4 p-4 font-mono transition-all duration-300"
						>
							<div class="flex items-center gap-4">
								<!-- Date Badge -->
								<div
									aria-hidden="true"
									class="border-primary bg-primary hidden h-16 w-16 shrink-0 flex-col items-center justify-center border-2 text-white sm:flex"
								>
									<span class="text-xs leading-tight font-medium uppercase"
										>{getDayOfWeek(date)}</span
									>
									<span class="text-xl leading-none font-bold">{getDayNumber(date)}</span>
									<span class="text-xs leading-tight font-medium">{getMonth(date)}</span>
								</div>

								<!-- Event Info -->
								<div class="min-w-0 flex-1">
									<h3
										class="text-foreground-primary group-hover:text-primary mb-2 line-clamp-2 text-base leading-tight font-medium transition-colors duration-200"
									>
										{title}
									</h3>
									{#if eventTime}
										<div class="text-foreground-secondary flex items-center gap-2 text-sm">
											<span class="text-foreground-muted">[</span>
											<span class="flex sm:hidden">{getDayNumber(date)}. {getMonth(date)}, </span>
											<span>kl {eventTime}</span>
											<span class="text-foreground-muted">]</span>
										</div>
									{/if}
								</div>

								<!-- Arrow -->
								<div class="text-foreground-muted shrink-0">
									<span class="text-sm">></span>
								</div>
							</div>
						</div>
					</a>
				</li>
			{:else}
				<li>
					<div class="border-border bg-card-muted border-l-4 px-4 py-12 text-center font-mono">
						<p class="text-foreground-muted">$ ls arrangementer/</p>
						<p class="text-foreground-secondary mt-2 text-sm">
							ls: cannot access 'arrangementer/': No such file or directory
						</p>
						<p class="text-foreground-muted mt-4 text-sm">
							<span class="text-foreground-subtle">#</span> Følg med på våre sosiale medier for oppdateringer
						</p>
					</div>
				</li>
			{/each}
		</ul>
	</div>
</CLIWindow>

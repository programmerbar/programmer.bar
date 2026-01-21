<script lang="ts">
	import CLIWindow from '$lib/components/app/CLIWindow.svelte';
	import { formatDate, time } from '$lib/utils/date.js';
	import { marked } from 'marked';
	import { toast } from 'svelte-sonner';
	import { Calendar, Clock, Share2, ExternalLink } from '@lucide/svelte';
	import SEO from '$lib/components/SEO.svelte';

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

	let { data } = $props();

	type EventWithTime = typeof data.event & {
		startTime?: string | { hour: number; minute: number };
	};
	const event = $derived(data.event as EventWithTime);

	let shareText = $state('Del arrangementet');

	const html = $derived(marked.parse(data.event.body ?? ''));

	function handleShare() {
		if (navigator.share) {
			navigator.share({ title: data.event.title, url: window.location.href });
		} else {
			navigator.clipboard.writeText(window.location.href);
			toast.success('Lenken er kopiert til utklippstavlen!');
			shareText = 'Lenken er kopiert!';
			setTimeout(() => {
				shareText = 'Del arrangementet';
			}, 2000);
		}
	}

	// SEO data
	const eventDescription = $derived(
		data.event.body?.slice(0, 160) ||
			`${data.event.title} - Arrangement hos Programmerbar den ${formatDate(data.event.date)}`
	);
</script>

<SEO
	title={data.event.title}
	description={eventDescription}
	keywords={`${data.event.title}, arrangement, event, programmerbar, ${formatDate(data.event.date)}`}
	canonical={`/arrangement/${data.event.slug}`}
	type="event"
	publishedTime={data.event._createdAt ?? undefined}
/>

<div class="grid gap-8 lg:grid-cols-3 lg:gap-12">
	<!-- Main Content Window -->
	<CLIWindow title="cat arrangement/{data.event.slug}.txt" class="lg:col-span-2">
		<!-- Window Content -->
		<div class="p-6 md:p-8">
			<h2 class="text-foreground-primary mb-6 text-2xl font-semibold md:text-3xl">
				<span class="text-foreground-muted">##</span>
				{data.event.title}
			</h2>

			<article class="bg-card overflow-hidden">
				<div class="py-6">
					<div class="markdown-content text-foreground-primary">{@html html}</div>
				</div>
			</article>
		</div>
	</CLIWindow>

	<!-- Metadata Window -->
	<CLIWindow title="cat metadata.txt" class="h-fit lg:sticky lg:top-6">
		<!-- Window Content -->
		<div class="p-6">
			<div class="space-y-6">
				<div class="flex items-center gap-4">
					<div
						class="border-border bg-card-muted flex h-10 w-10 shrink-0 items-center justify-center border-2"
					>
						<Calendar class="text-primary h-5 w-5" />
					</div>
					<div>
						<h3 class="text-foreground-secondary text-xs font-medium">Dato</h3>
						<p class="text-foreground-primary font-mono text-sm">{formatDate(data.event.date)}</p>
					</div>
				</div>

				{#if formatTime(event.startTime) || time(event.date) !== '00:00'}
					<div class="flex items-center gap-4">
						<div
							class="border-border bg-card-muted flex h-10 w-10 shrink-0 items-center justify-center border-2"
						>
							<Clock class="text-primary h-5 w-5" />
						</div>
						<div>
							<h3 class="text-foreground-secondary text-xs font-medium">Tid</h3>
							<p class="text-foreground-primary font-mono text-sm">
								kl {formatTime(event.startTime) || time(event.date)}
							</p>
						</div>
					</div>
				{/if}

				<div class="border-border flex flex-col gap-4 border-t pt-6">
					<a
						href={`https://echo.uib.no/arrangement/${data.event.slug}`}
						target="_blank"
						rel="noopener noreferrer"
						class="border-border bg-card-muted hover:bg-card-hover hover:border-primary text-foreground-primary flex w-full items-center justify-center gap-2 border-2 px-4 py-2 text-center font-mono text-sm font-semibold transition-all"
					>
						{#if data.event.registrationStart}
							Til påmelding
						{:else}
							Se på echo.uib.no
						{/if}
						<ExternalLink class="h-4 w-4" />
					</a>

					<button
						onclick={handleShare}
						class="border-border bg-card-muted hover:bg-card-hover hover:border-primary text-foreground-primary flex w-full items-center justify-center gap-2 border-2 px-4 py-2 text-center font-mono text-sm font-semibold transition-all"
					>
						<Share2 class="h-4 w-4" />
						{shareText}
					</button>
				</div>
			</div>
		</div>
	</CLIWindow>
</div>

<style>
	:global(.markdown-content) {
		font-family: 'IBM Plex Mono', monospace;
		line-height: 1.6;
	}

	:global(.markdown-content h1) {
		font-size: 1.5rem;
		font-weight: 600;
		margin-top: 1.5rem;
		margin-bottom: 1rem;
		color: var(--text-primary);
	}

	:global(.markdown-content h1:first-child) {
		margin-top: 0;
	}

	:global(.markdown-content h2) {
		font-size: 1.25rem;
		font-weight: 600;
		margin-top: 1.25rem;
		margin-bottom: 0.75rem;
		color: var(--text-primary);
	}

	:global(.markdown-content h3) {
		font-size: 1.125rem;
		font-weight: 600;
		margin-top: 1rem;
		margin-bottom: 0.5rem;
		color: var(--text-primary);
	}

	:global(.markdown-content p) {
		margin-bottom: 1rem;
		color: var(--text-primary);
	}

	:global(.markdown-content ul),
	:global(.markdown-content ol) {
		margin-bottom: 1rem;
		padding-left: 1.5rem;
	}

	:global(.markdown-content ul > li + li),
	:global(.markdown-content ol > li + li) {
		margin-top: 0.5rem;
	}

	:global(.markdown-content li) {
		color: var(--text-primary);
	}

	:global(.markdown-content ul li) {
		list-style-type: disc;
	}

	:global(.markdown-content ol li) {
		list-style-type: decimal;
	}

	:global(.markdown-content a) {
		color: var(--primary);
		text-decoration: underline;
	}

	:global(.markdown-content a:hover) {
		color: var(--primary-dark);
	}

	:global(.markdown-content code) {
		background-color: var(--card-muted);
		border: 1px solid var(--border);
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
		color: var(--text-primary);
	}

	:global(.markdown-content pre) {
		background-color: var(--card-muted);
		border: 1px solid var(--border);
		padding: 1rem;
		border-radius: 0.25rem;
		overflow-x: auto;
		margin-bottom: 1rem;
	}

	:global(.markdown-content pre code) {
		background-color: transparent;
		border: none;
		padding: 0;
	}

	:global(.markdown-content blockquote) {
		border-left: 4px solid var(--primary);
		padding-left: 1rem;
		margin-left: 0;
		margin-bottom: 1rem;
		color: var(--text-secondary);
	}

	:global(.markdown-content img) {
		max-width: 100%;
		height: auto;
		margin-bottom: 1rem;
	}
</style>

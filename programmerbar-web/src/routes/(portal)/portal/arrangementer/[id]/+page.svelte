<script lang="ts">
	import Heading from '$lib/components/ui/Heading.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Pill from '$lib/components/ui/Pill.svelte';
	import { formatDate, time } from '$lib/utils/date';
	import { enhance } from '$app/forms';
	import { getUser } from '$lib/states/user.svelte';
	import { X, Plus, Calendar, Clock, Users, ArrowLeft } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import { cn } from '$lib/utils/cn';

	let { data } = $props();
	let user = getUser();
	let activeTab = $state('details');
	let isPastEvent = $derived(new Date() > new Date(data.event.date));
	let totalResponsibles = $derived(
		data.event.shifts.reduce((acc, shift) => acc + shift.members.length, 0)
	);
</script>

<svelte:head>
	<title>{data.event.name}</title>
</svelte:head>

<section class="space-y-10">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="space-y-2">
			<ButtonLink
				type="button"
				intent="outline"
				size="sm"
				href={resolve('/portal/arrangementer')}
				class="inline-flex items-center gap-2"
			>
				<ArrowLeft class="h-4 w-4" />
				Til arrangementer
			</ButtonLink>

			<Heading level={1} class="wrap-break-words">{data.event.name}</Heading>
			<div class="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
				<span>{formatDate(data.event.date)}</span>
				<span aria-hidden="true">•</span>
				<span>
					{data.event.shifts.length}
					{data.event.shifts.length === 1 ? 'vakt' : 'vakter'}
				</span>
				<span aria-hidden="true">•</span>
				<span>
					{totalResponsibles} ansvarlig{totalResponsibles === 1 ? '' : 'e'}
				</span>
			</div>
		</div>

		{#if user.current?.role === 'board'}
			<ButtonLink
				intent="primary"
				class="w-full sm:w-auto"
				href={resolve('/(portal)/portal/arrangementer/[id]/rediger', { id: data.event.id })}
			>
				Rediger arrangement
			</ButtonLink>
		{/if}
	</div>

	<div class="bg-portal-card border-portal-border rounded-lg border border-gray-200">
		<div class="border-portal-border border-b border-gray-200 px-6 pt-4">
			<div class="flex flex-wrap gap-2">
				<button
					class={cn(
						'rounded-t-lg px-4 py-2 text-sm font-medium transition-colors',
						activeTab === 'details'
							? 'border-b-2 border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
							: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
					)}
					onclick={() => (activeTab = 'details')}
					type="button"
				>
					Detaljer
				</button>
				<button
					class={cn(
						'rounded-t-lg px-4 py-2 text-sm font-medium transition-colors',
						activeTab === 'shifts'
							? 'border-b-2 border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
							: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
					)}
					onclick={() => (activeTab = 'shifts')}
					type="button"
				>
					Vakter
				</button>
			</div>
		</div>

		<div class="p-6">
			{#if activeTab === 'details'}
				<div class="grid gap-6 md:grid-cols-3">
					<div
						class="border-portal-border dark:bg-portal-hover rounded-lg border border-gray-200 bg-gray-50 p-4"
					>
						<div class="flex items-center gap-3">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
							>
								<Calendar class="h-5 w-5" />
							</div>
							<div>
								<p class="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">Dato</p>
								<p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
									{formatDate(data.event.date)}
								</p>
							</div>
						</div>
					</div>

					<div
						class="border-portal-border dark:bg-portal-hover rounded-lg border border-gray-200 bg-gray-50 p-4"
					>
						<div class="flex items-center gap-3">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
							>
								<Clock class="h-5 w-5" />
							</div>
							<div>
								<p class="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
									Antall vakter
								</p>
								<p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
									{data.event.shifts.length}
									{data.event.shifts.length === 1 ? ' vakt' : ' vakter'}
								</p>
							</div>
						</div>
					</div>

					<div
						class="border-portal-border dark:bg-portal-hover rounded-lg border border-gray-200 bg-gray-50 p-4"
					>
						<div class="flex items-center gap-3">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
							>
								<Users class="h-5 w-5" />
							</div>
							<div>
								<p class="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
									Ansvarlige
								</p>
								<p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
									{totalResponsibles}
									{totalResponsibles === 1 ? ' person' : ' personer'}
								</p>
							</div>
						</div>
					</div>
					{#if data.event.slug}
						<p class="text-xs text-gray-700 dark:text-gray-300">Slug: "{data.event.slug}"</p>
					{/if}
				</div>
				<div class="mt-6 space-y-4">
					<h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Beskrivelse</h2>
					<p class="text-sm">
						<span class="text-gray-700 dark:text-gray-300"
							>{data.event.description || 'Ingen beskrivelse'}</span
						>
					</p>
				</div>

				<div class="mt-6 space-y-4">
					<h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Vaktoversikt</h2>
					<div class="space-y-3">
						{#each data.event.shifts as shift, i (shift.id)}
							<div
								class="border-portal-border dark:bg-portal-card rounded-lg border border-gray-200 bg-white p-4"
							>
								<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
									<div class="space-y-1">
										<p class="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
											Vakt {i + 1}
										</p>
										<div class="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-300">
											<span>{formatDate(shift.startAt)}</span>
											<span aria-hidden="true">•</span>
											<span>
												{time(shift.startAt)} – {time(shift.endAt)}
											</span>
										</div>
									</div>
									<Pill variant={isPastEvent && shift.members.length === 0 ? 'gray' : 'blue'}>
										{shift.members.length} ansvarlig{shift.members.length === 1 ? '' : 'e'}
									</Pill>
								</div>
								<div class="mt-4 text-sm text-gray-700 dark:text-gray-300">
									<p class="font-medium text-gray-900 dark:text-gray-100">Ansvarlige</p>
									<p>
										{shift.members.map((member) => member.user.name).join(', ') ||
											'Ingen registrerte ansvarlige'}
									</p>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{:else if activeTab === 'shifts'}
				{#if data.event.shifts.length === 0}
					<div
						class="border-portal-border dark:bg-portal-hover rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500 dark:text-gray-400"
					>
						Ingen vakter er opprettet for dette arrangementet ennå.
					</div>
				{:else}
					<div class="space-y-4">
						{#each data.event.shifts as shift, i (shift.id)}
							{@const isInShift = shift.members.some(
								(member) => member.userId === user.current?.id
							)}
							<div
								class="border-portal-border dark:bg-portal-card rounded-lg border border-gray-200 bg-white p-5"
							>
								<div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
									<div>
										<h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
											Vakt {i + 1}
										</h3>
										<div class="mt-1 flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-300">
											<span>{formatDate(shift.startAt)}</span>
											<span aria-hidden="true">•</span>
											<span>
												{time(shift.startAt)} – {time(shift.endAt)}
											</span>
										</div>
									</div>
									<Pill
										variant={isInShift ? 'green' : shift.members.length ? 'blue' : 'gray'}
										class="w-fit"
									>
										{isInShift
											? 'Du er ansvarlig'
											: `${shift.members.length} ansvarlig${shift.members.length === 1 ? '' : 'e'}`}
									</Pill>
								</div>

								<div class="mt-4 text-sm text-gray-700 dark:text-gray-300">
									<p class="font-medium text-gray-900 dark:text-gray-100">Ansvarlige</p>
									<p>
										{shift.members.map((member) => member.user.name).join(', ') ||
											'Ingen registrerte ansvarlige'}
									</p>
								</div>

								{#if !isPastEvent && (isInShift || user.current?.isActive)}
									<div class="mt-4 flex flex-wrap gap-2">
										{#if !isInShift}
											<form action="?/join" method="post" use:enhance>
												<input type="hidden" name="shiftId" value={shift.id} />
												<Button type="submit" intent="outline" size="sm" class="gap-2">
													<Plus class="h-4 w-4" />
													Bli med på vakten
												</Button>
											</form>
										{:else}
											<form action="?/leave" method="post" use:enhance>
												<input type="hidden" name="shiftId" value={shift.id} />
												<Button type="submit" intent="danger" size="sm" class="gap-2">
													<X class="h-4 w-4" />
													Forlat vakten
												</Button>
											</form>
										{/if}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			{/if}
		</div>
	</div>
</section>

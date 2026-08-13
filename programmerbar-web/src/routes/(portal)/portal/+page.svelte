<script lang="ts">
	import Heading from '$lib/components/ui/Heading.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Combobox from '$lib/components/ui/Combobox.svelte';
	import Pill from '$lib/components/ui/Pill.svelte';
	import { formatDate } from '$lib/utils/date.js';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import {
		CircleCheck,
		Beer,
		Users,
		UserCheck,
		Clock,
		Calendar,
		CircleAlert,
		TrendingUp
	} from '@lucide/svelte';

	let { data } = $props();
	let selectedReferrerId = $state('');
</script>

<svelte:head>
	<title>Hjem — Programmerbar Portal</title>
</svelte:head>

<div class="space-y-10">
	<!-- Welcome Header -->
	<div>
		<Heading>Portal Hjem</Heading>
		<p class="mt-2 text-gray-600 dark:text-gray-300">
			Oversikt over dine vakter, øl og referrerings-status
		</p>
	</div>

	<!-- Referral Form -->
	{#if data.canRefer}
		<div
			class="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950/50"
		>
			<div class="mb-4 flex items-start gap-3">
				<UserCheck class="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
				<div>
					<h3 class="text-lg font-semibold text-blue-900 dark:text-blue-200">
						Velkommen til Programmerbar!
					</h3>
					<p class="text-sm text-blue-700 dark:text-blue-300">
						Hvem referrerte deg til Programmerbar?
					</p>
				</div>
			</div>

			<form method="POST" action="?/refer" use:enhance>
				<div class="flex items-end gap-3">
					<div class="flex-1">
						<label
							for="referrer"
							class="mb-2 block text-sm font-medium text-blue-800 dark:text-blue-300"
						>
							Velg person
						</label>
						<Combobox
							type="single"
							name="referrer"
							bind:value={selectedReferrerId}
							items={data.users.filter((user) => user.value !== data.currentUserId)}
							inputProps={{ placeholder: 'Søk etter navn...', class: 'w-full', id: 'referrer' }}
						/>
					</div>
					<Button type="submit" intent="primary" disabled={!selectedReferrerId} class="shrink-0">
						Registrer referrer
					</Button>
				</div>
				<input type="hidden" name="referrerId" value={selectedReferrerId} />
			</form>
		</div>
	{/if}

	<!-- Stats Overview -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<!-- Personal Stats -->
		<div class="border-portal-border bg-portal-card rounded-lg border p-6">
			<h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Mine statistikker</h3>
			<div class="space-y-4">
				<div
					class="flex items-center gap-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/50"
				>
					<div
						class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
					>
						<CircleCheck class="h-5 w-5 text-green-600 dark:text-green-400" />
					</div>
					<div>
						<p class="text-sm font-medium text-green-800 dark:text-green-300">Vakter fullført</p>
						<p class="text-2xl font-bold text-green-900 dark:text-green-200">
							{data.shiftsCompleted}
						</p>
					</div>
				</div>

				<div
					class="flex items-center gap-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/50"
				>
					<div
						class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900"
					>
						<Beer class="h-5 w-5 text-amber-600 dark:text-amber-400" />
					</div>
					<div>
						<p class="text-sm font-medium text-amber-800 dark:text-amber-300">Gratis øl igjen</p>
						<p class="text-2xl font-bold text-amber-900 dark:text-amber-200">
							{data.unclaimedBeers}
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Referral Stats -->
		<div class="border-portal-border bg-portal-card rounded-lg border p-6">
			<div class="mb-4 flex items-center gap-2">
				<TrendingUp class="h-5 w-5 text-gray-600 dark:text-gray-400" />
				<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
					Referrerings-statistikk
				</h3>
			</div>
			<div class="space-y-4">
				<div
					class="dark:bg-portal-hover flex items-center justify-between rounded-lg bg-gray-50 p-3"
				>
					<div class="flex items-center gap-3">
						<Users class="h-4 w-4 text-gray-600 dark:text-gray-400" />
						<span class="text-sm font-medium text-gray-700 dark:text-gray-200"
							>Totale referreringer</span
						>
					</div>
					<span class="text-lg font-bold text-gray-900 dark:text-gray-100"
						>{data.referralStats.totalReferrals}</span
					>
				</div>

				<div
					class="dark:bg-portal-hover flex items-center justify-between rounded-lg bg-gray-50 p-3"
				>
					<div class="flex items-center gap-3">
						<CircleCheck class="h-4 w-4 text-green-600 dark:text-green-400" />
						<span class="text-sm font-medium text-gray-700 dark:text-gray-200">Fullført 1 vakt</span
						>
					</div>
					<span class="text-lg font-bold text-green-600 dark:text-green-400"
						>{data.referralStats.completedReferrals}</span
					>
				</div>

				<div
					class="dark:bg-portal-hover flex items-center justify-between rounded-lg bg-gray-50 p-3"
				>
					<div class="flex items-center gap-3">
						<Clock class="h-4 w-4 text-orange-600 dark:text-orange-400" />
						<span class="text-sm font-medium text-gray-700 dark:text-gray-200">Ventende</span>
					</div>
					<span class="text-lg font-bold text-orange-600 dark:text-orange-400"
						>{data.referralStats.pendingReferrals}</span
					>
				</div>
			</div>
		</div>
	</div>

	<!-- Upcoming Shifts -->
	<div class="bg-portal-card border-portal-border rounded-lg border">
		<div class="border-portal-border border-b p-6">
			<div class="flex items-center gap-2">
				<Calendar class="h-5 w-5 text-gray-600 dark:text-gray-400" />
				<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Kommende vakter</h3>
			</div>
		</div>

		<div class="divide-portal-border divide-y">
			{#each data.upcomingShifts as shift (shift.shift.id)}
				<!-- eslint-disable svelte/no-navigation-without-resolve -->
				<a
					href={shift.event?.id
						? resolve('/(portal)/portal/arrangementer/[id]', { id: shift.event.id })
						: resolve('/portal/arrangementer')}
					class="hover:bg-portal-hover block p-4 transition-colors"
				>
					<div class="flex items-center justify-between">
						<div>
							<h4
								class="font-medium text-gray-900 transition-colors hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
							>
								{shift.event?.name}
							</h4>
							<div class="mt-1 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
								<div class="flex items-center gap-1">
									<Clock class="h-3 w-3" />
									<span>{formatDate(shift.shift.startAt)}</span>
								</div>
								<span>-</span>
								<span>{formatDate(shift.shift.endAt)}</span>
							</div>
						</div>
						<Pill variant="blue">Påmeldt</Pill>
					</div>
				</a>
			{:else}
				<div class="p-8 text-center">
					<CircleAlert class="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
					<p class="text-lg font-medium text-gray-500 dark:text-gray-400">Ingen kommende vakter</p>
					<p class="mt-1 text-sm text-gray-400 dark:text-gray-500">
						Du har ingen vakter å jobbe. Sjekk
						<a
							href={resolve('/portal/arrangementer')}
							class="text-blue-600 hover:underline dark:text-blue-400">arrangementer</a
						>
						for å melde deg på nye vakter.
					</p>
				</div>
			{/each}
		</div>
	</div>
</div>

<script lang="ts">
	import UserBadge from '$lib/components/portal/UserBadge.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import Pill from '$lib/components/ui/Pill.svelte';
	import { initials } from '$lib/utils/strings.js';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import PushNotificationToggle from '$lib/components/portal/PushNotificationToggle.svelte';

	let { data } = $props();
	let user = $derived(data.user);
</script>

<svelte:head>
	<title>Min Profil</title>
</svelte:head>

<div class="space-y-10">
	<div class="bg-portal-card border-portal-border rounded-lg border p-4 sm:p-6">
		<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
			<div class="flex items-center gap-4">
				<div
					class="dark:bg-portal-hover flex h-16 w-16 items-center justify-center rounded-full bg-gray-300"
				>
					<span class="text-2xl font-semibold text-gray-700 dark:text-gray-300">
						{initials(data.user.name)}
					</span>
				</div>
				<div class="min-w-0 flex-1">
					<Heading class="mb-1 truncate">{user.name}</Heading>
					<div class="flex items-center gap-3">
						<UserBadge {user} />
					</div>
				</div>
			</div>
			<div class="flex flex-col gap-2 sm:flex-row sm:gap-2">
				<ButtonLink intent="primary" class="sm-auto w-full" href="/portal/profil/rediger">
					Rediger profil
				</ButtonLink>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<div class="space-y-6 lg:col-span-2">
			<div class="bg-portal-card border-portal-border overflow-auto rounded-lg border">
				<div class="px-6 py-4">
					<h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
						Brukerinformasjon
					</h3>
					<div class="space-y-4">
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div
								class="dark:border-portal-border dark:bg-portal-hover rounded-lg border border-gray-200 bg-gray-50 p-4"
							>
								<dt class="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Navn</dt>
								<dd class="text-sm text-gray-900 dark:text-gray-100">{user.name}</dd>
							</div>
							<div
								class="dark:border-portal-border dark:bg-portal-hover rounded-lg border border-gray-200 bg-gray-50 p-4"
							>
								<dt class="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
									Hovedepost
								</dt>
								<dd class="text-sm text-gray-900 dark:text-gray-100">{user.email}</dd>
							</div>
							<div
								class="dark:border-portal-border dark:bg-portal-hover rounded-lg border border-gray-200 bg-gray-50 p-4"
							>
								<dt class="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
									Alternativ e-post
								</dt>
								<dd class="text-sm text-gray-900 dark:text-gray-100">
									{user.altEmail || 'Ikke oppgitt'}
								</dd>
							</div>
							<div
								class="dark:border-portal-border dark:bg-portal-hover rounded-lg border border-gray-200 bg-gray-50 p-4"
							>
								<dt class="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Telefon</dt>
								<dd class="text-sm text-gray-900 dark:text-gray-100">
									{user.phone || 'Ikke oppgitt'}
								</dd>
							</div>
							<div
								class="dark:border-portal-border dark:bg-portal-hover rounded-lg border border-gray-200 bg-gray-50 p-4"
							>
								<dt class="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Rolle</dt>
								<dd>
									<UserBadge {user} />
								</dd>
							</div>
							<div
								class="dark:border-portal-border dark:bg-portal-hover rounded-lg border border-gray-200 bg-gray-50 p-4"
							>
								<dt class="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Opplæring</dt>
								<dd>
									<Pill variant={user.isTrained ? 'green' : 'yellow'}>
										{user.isTrained ? 'Fullført' : 'Ikke fullført'}
									</Pill>
								</dd>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="bg-portal-card border-portal-border overflow-auto rounded-lg border">
				<div class="px-6 py-4">
					<h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Verv stats</h3>
					<div class="space-y-3">
						<div
							class="dark:border-portal-border dark:bg-portal-hover flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
						>
							<div class="h-3 w-3 shrink-0 rounded-full bg-blue-400"></div>
							<div class="flex-1">
								<p class="text-sm font-medium text-gray-900 dark:text-gray-100">
									Totale referreringer
								</p>
								<p class="text-xs text-gray-500 dark:text-gray-400">
									{data.referrals.totalReferrals}
								</p>
							</div>
						</div>
						<div
							class="dark:border-portal-border dark:bg-portal-hover flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
						>
							<div class="h-3 w-3 shrink-0 rounded-full bg-green-400"></div>
							<div class="flex-1">
								<p class="text-sm font-medium text-gray-900 dark:text-gray-100">
									Godkjente referreringer
								</p>
								<p class="text-xs text-gray-500 dark:text-gray-400">
									{data.referrals.completedReferrals}
								</p>
							</div>
						</div>
						<div
							class="dark:border-portal-border dark:bg-portal-hover flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
						>
							<div class="h-3 w-3 shrink-0 rounded-full bg-yellow-400"></div>
							<div class="flex-1">
								<p class="text-sm font-medium text-gray-900 dark:text-gray-100">
									Ventende referreringer
								</p>
								<p class="text-xs text-gray-500 dark:text-gray-400">
									{data.referrals.pendingReferrals}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="space-y-6">
			<div class="bg-portal-card border-portal-border overflow-auto rounded-lg border">
				<div class="px-6 py-4">
					<h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Statistikk</h3>
					<div class="space-y-4">
						<div
							class="dark:border-portal-border dark:bg-portal-hover flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4"
						>
							<span class="text-sm font-medium text-gray-600 dark:text-gray-300"
								>Antall ganger stått (sem)</span
							>
							<span class="text-lg font-semibold text-gray-900 dark:text-gray-100"
								>{data.timesVolunteered || 0}</span
							>
						</div>
						<div
							class="dark:border-portal-border dark:bg-portal-hover flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4"
						>
							<span class="text-sm font-medium text-gray-600 dark:text-gray-300">Antall Bonger</span
							>
							<span class="text-lg font-semibold text-gray-900 dark:text-gray-100"
								>{data.unclaimedBeers || 0}</span
							>
						</div>
						<div
							class="dark:border-portal-border dark:bg-portal-hover flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4"
						>
							<span class="text-sm font-medium text-gray-600 dark:text-gray-300"
								>Kommende arrangement</span
							>
							<span class="text-sm font-semibold text-gray-900 dark:text-gray-100">
								{data.shifts?.length > 0 ? data.shifts[0].event?.name : 'Ingen'}
							</span>
						</div>
					</div>
				</div>
			</div>

			<PushNotificationToggle />
		</div>
	</div>
</div>

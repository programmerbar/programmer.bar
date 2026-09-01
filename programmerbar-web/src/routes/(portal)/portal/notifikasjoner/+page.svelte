<script lang="ts">
	import Heading from '$lib/components/ui/Heading.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { Bell, Check, CheckCheck, BellOff } from '@lucide/svelte';
	import { archiveAllNotificationsAction, archiveNotificationAction } from './data.remote';

	let { data } = $props();
</script>

<svelte:head>
	<title>Notifikasjoner</title>
</svelte:head>

<div class="space-y-10">
	<!-- Header -->
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div class="flex items-center gap-3">
			<Bell class="h-6 w-6 text-gray-600 dark:text-gray-300" />
			<div>
				<Heading>Notifikasjoner</Heading>
				<p class="mt-1 text-gray-600 dark:text-gray-300">
					{#if data.notifications.length > 0}
						Du har {data.notifications.length} uleste notifikasjoner
					{:else}
						Ingen nye notifikasjoner
					{/if}
				</p>
			</div>
		</div>

		{#if data.notifications.length > 0}
			<form {...archiveAllNotificationsAction}>
				<Button type="submit" intent="outline">
					<CheckCheck class="h-4 w-4" />
					Marker alle som lest
				</Button>
			</form>
		{/if}
	</div>

	<!-- Notifications List -->
	{#if data.notifications.length === 0}
		<div class="bg-portal-card border-portal-border rounded-lg border">
			<div class="p-12 text-center">
				<BellOff class="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
				<h3 class="mb-2 text-lg font-medium text-gray-500 dark:text-gray-400">
					Ingen notifikasjoner
				</h3>
				<p class="text-sm text-gray-400 dark:text-gray-500">
					Du har ingen uleste notifikasjoner akkurat nå
				</p>
			</div>
		</div>
	{:else}
		<div
			class="bg-portal-card divide-portal-border border-portal-border divide-y overflow-hidden rounded-lg border"
		>
			{#each data.notifications as notification (notification.id)}
				<div class="hover:bg-portal-hover p-4 transition-colors">
					<div class="flex items-start justify-between gap-4">
						<div class="min-w-0 flex-1">
							<div class="flex items-start gap-3">
								<div
									class="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30"
								>
									<Bell class="h-4 w-4 text-blue-600 dark:text-blue-400" />
								</div>
								<div class="flex-1">
									<h3 class="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
										{notification.title}
									</h3>
									<p class="leading-relaxed text-gray-700 dark:text-gray-300">
										{notification.body}
									</p>
								</div>
							</div>
						</div>

						<form {...archiveNotificationAction.for(notification.id)} class="shrink-0">
							<input
								{...archiveNotificationAction.fields.notificationId.as('hidden', notification.id)}
							/>
							<Button
								type="submit"
								size="square"
								intent="outline"
								class="text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-950/30 dark:hover:text-green-300"
							>
								<Check class="h-4 w-4" />
							</Button>
						</form>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

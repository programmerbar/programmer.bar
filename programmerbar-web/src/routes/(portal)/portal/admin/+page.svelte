<script lang="ts">
	import { USER_ROLE_FILTER_OPTIONS } from '$lib/utils/user-presentation';
	import UserBadge from '$lib/components/portal/UserBadge.svelte';
	import Training from '$lib/components/portal/Training.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Pill from '$lib/components/ui/Pill.svelte';
	import type { User } from '$lib/server/db/schemas/index.js';
	import { initials } from '$lib/utils/strings.js';
	import { Users, Search, ChevronUp, ChevronDown, Eye, UserCog, Check, X } from '@lucide/svelte';
	import { resolve } from '$app/paths';

	let { data } = $props();
	let search = $state('');
	let selectedDropdown: HTMLDetailsElement;
	let selectedIds = $state<string[]>([]);
	let trainingOpen = $state(false);
	let trainingFilter = $state('all');
	let successMessage = $state('');
	let selectedUsers = $derived(data.users.filter((user: User) => selectedIds.includes(user.id)));
	function toggleUser(id: string) {
		selectedIds = selectedIds.includes(id)
			? selectedIds.filter((value) => value !== id)
			: [...selectedIds, id];
	}

	let selectedRole = $state('all');
	let sortBy = $state('name');
	let sortOrder = $state<'asc' | 'desc'>('asc');

	let filteredUsers = $derived.by(() => {
		const searchTerm = search.toLowerCase();
		return data.users
			.filter((user: User) => {
				const matchesSearch =
					user.name.toLowerCase().includes(searchTerm) ||
					(user.altEmail ?? user.email).toLowerCase().includes(searchTerm);
				return (
					(selectedRole === 'all' || user.role === selectedRole) &&
					matchesSearch &&
					(trainingFilter === 'all' || user.isTrained === (trainingFilter === 'completed'))
				);
			})
			.sort((a, b) => {
				const getVal = (u: User) => (sortBy === 'name' ? u.name.toLowerCase() : u.role);
				const comp = getVal(a).localeCompare(getVal(b));
				return sortOrder === 'asc' ? comp : -comp;
			});
	});

	function handleSort(column: string) {
		sortOrder = sortBy === column ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc';
		sortBy = column;
	}
</script>

<svelte:window
	onclick={(event) => {
		if (
			selectedDropdown?.open &&
			event.target instanceof Node &&
			!selectedDropdown.contains(event.target)
		) {
			selectedDropdown.open = false;
		}
	}}
	onkeydown={(event) => {
		if (event.key === 'Escape' && selectedDropdown?.open) {
			selectedDropdown.open = false;
			selectedDropdown.querySelector('summary')?.focus();
		}
	}}
	onfocusin={(event) => {
		if (
			selectedDropdown?.open &&
			event.target instanceof Node &&
			!selectedDropdown.contains(event.target)
		) {
			selectedDropdown.open = false;
		}
	}}
/>

<svelte:head>
	<title>Admin</title>
</svelte:head>

<div class="space-y-10">
	<!-- Header -->
	<div class="flex items-center gap-3">
		<UserCog class="h-6 w-6 text-gray-600 dark:text-gray-300" />
		<div>
			<Heading>Brukerhåndtering</Heading>
			<p class="mt-1 text-gray-600 dark:text-gray-300">
				Administrer alle {data.users.length} registrerte brukere
			</p>
		</div>
		{#if filteredUsers.length !== data.users.length}
			<div class="ml-auto">
				<Pill variant="blue">{filteredUsers.length} av {data.users.length}</Pill>
			</div>
		{/if}
	</div>

	<!-- Search and Filters -->
	<div class="bg-portal-card border-portal-border rounded-lg border p-4">
		<div class="flex flex-col gap-3 sm:flex-row">
			<div class="flex-1">
				<div class="relative">
					<Search
						class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500"
					/>
					<Input
						class="w-full border pl-10"
						type="search"
						placeholder="Søk etter navn eller e-post..."
						bind:value={search}
					/>
				</div>
			</div>
			<div>
				<Select
					bind:value={selectedRole}
					options={[{ label: 'Alle roller', value: 'all' }, ...USER_ROLE_FILTER_OPTIONS]}
				/>
			</div>
		</div>
	</div>

	<div class="bg-portal-card border-portal-border space-y-3 rounded-lg border p-4">
		<div class="flex flex-wrap items-center gap-3">
			<Select
				bind:value={trainingFilter}
				options={[
					{ label: 'All opplæring', value: 'all' },
					{ label: 'Mangler opplæring', value: 'pending' },
					{ label: 'Opplæring fullført', value: 'completed' }
				]}
			/>
			<Button
				class="cursor-pointer disabled:cursor-not-allowed"
				intent="outline"
				onclick={() => {
					selectedIds = [
						...new Set([...selectedIds, ...filteredUsers.map((user: User) => user.id)])
					];
				}}>Velg alle viste</Button
			>
			<Button
				class="cursor-pointer disabled:cursor-not-allowed"
				intent="outline"
				disabled={!selectedIds.length}
				onclick={() => {
					selectedIds = [];
				}}>Tøm valg</Button
			>
			<Button
				class="w-56 shrink-0 cursor-pointer tabular-nums disabled:cursor-not-allowed"
				disabled={!selectedUsers.length}
				onclick={() => {
					successMessage = '';
					trainingOpen = true;
				}}>Start opplæring ({selectedUsers.length})</Button
			>
			<details bind:this={selectedDropdown} class="relative w-44 max-w-full shrink-0">
				<summary
					class="border-portal-border w-full cursor-pointer rounded-lg border px-3 py-2 text-sm tabular-nums"
				>
					Vis valgte ({selectedUsers.length})
				</summary>
				<div
					aria-label="Valgte deltakere"
					class="bg-portal-card border-portal-border absolute top-full left-0 z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-lg border p-3 shadow-lg"
				>
					{#if selectedUsers.length}
						<ul class="space-y-2 text-sm">
							{#each selectedUsers as user (user.id)}
								<li class="wrap-anywhere">{user.name}</li>
							{/each}
						</ul>
					{:else}
						<p class="text-sm text-gray-500 dark:text-gray-400">Ingen deltakere valgt</p>
					{/if}
				</div>
			</details>
		</div>
		{#if successMessage}<p role="status" class="text-sm text-green-700 dark:text-green-400">
				{successMessage}
			</p>{/if}
	</div>

	<!-- Mobile View -->
	<div class="block space-y-3 sm:hidden">
		{#each filteredUsers as user (user.id)}
			<div class="bg-portal-card border-portal-border rounded-lg border p-4">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						{@render trainingSelection(user)}
						<div class="h-10 w-10 shrink-0">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30"
							>
								<span class="text-sm font-medium text-blue-600 dark:text-blue-400">
									{initials(user.name)}
								</span>
							</div>
						</div>
						<div class="min-w-0 flex-1">
							<div class="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
								{user.name}
							</div>
							<div class="max-w-32 truncate text-xs text-gray-500 dark:text-gray-400">
								{user.altEmail || user.email}
							</div>
						</div>
					</div>
					<div class="flex flex-col items-end gap-2">
						{@render trainingStatus(user)}
						<UserBadge {user} />
						<a
							href={resolve('/(portal)/portal/admin/bruker/[id]', { id: user.id })}
							class="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
						>
							<Eye class="h-3 w-3" />
							Vis detaljer
						</a>
					</div>
				</div>
			</div>
		{/each}
		{#if filteredUsers.length === 0}
			<div class="bg-portal-card border-portal-border rounded-lg border p-8 text-center">
				<div class="flex flex-col items-center gap-2">
					<Users class="h-12 w-12 text-gray-300 dark:text-gray-600" />
					<div class="text-lg font-medium text-gray-500 dark:text-gray-400">
						Ingen brukere funnet
					</div>
					{#if search}
						<div class="text-sm text-gray-400 dark:text-gray-500">Prøv å endre søkekriteriene</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<!-- Desktop Table View -->
	<div
		class="bg-portal-card border-portal-border hidden overflow-hidden rounded-lg border sm:block"
	>
		<div class="@container overflow-x-auto">
			<table class="w-full">
				<thead class="border-portal-border dark:bg-portal-hover border-b bg-gray-50">
					<tr>
						<th class="px-3 py-3 text-left">
							<button
								class="flex cursor-pointer items-center gap-2 text-xs font-medium tracking-wider text-gray-500 uppercase transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
								onclick={() => handleSort('name')}
							>
								Navn
								{#if sortBy === 'name'}
									{#if sortOrder === 'asc'}
										<ChevronUp class="h-3 w-3" />
									{:else}
										<ChevronDown class="h-3 w-3" />
									{/if}
								{/if}
							</button>
						</th>
						<th
							class="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
						>
							E-post
						</th>
						<th class="px-3 py-3 text-left">
							<button
								class="flex cursor-pointer items-center gap-2 text-xs font-medium tracking-wider text-gray-500 uppercase transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
								onclick={() => handleSort('role')}
							>
								Rolle
								{#if sortBy === 'role'}
									{#if sortOrder === 'asc'}
										<ChevronUp class="h-3 w-3" />
									{:else}
										<ChevronDown class="h-3 w-3" />
									{/if}
								{/if}
							</button>
						</th>
						<th
							class="px-3 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
						>
							Opplæring
						</th>
						<th
							class="px-3 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
						>
							Handlinger
						</th>
					</tr>
				</thead>
				<tbody class="divide-portal-border divide-y divide-gray-200">
					{#each filteredUsers as user (user.id)}
						<tr class="hover:bg-portal-hover transition-colors">
							<td class="px-3 py-4 whitespace-nowrap">
								<div class="flex min-w-0 items-center gap-2">
									{@render trainingSelection(user)}
									<div class="h-10 w-10 shrink-0">
										<div
											class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30"
										>
											<span class="text-sm font-medium text-blue-600 dark:text-blue-400">
												{initials(user.name)}
											</span>
										</div>
									</div>
									<div class="min-w-0 flex-1">
										<div class="text-sm font-medium text-gray-900 dark:text-gray-100">
											{user.name}
										</div>
									</div>
								</div>
							</td>
							<td class="px-3 py-4 whitespace-nowrap">
								<div class="text-sm text-gray-600 dark:text-gray-300">
									{user.altEmail || user.email}
								</div>
							</td>
							<td class="px-3 py-4 whitespace-nowrap">
								<UserBadge {user} />
							</td>
							<td class="px-3 py-4 text-right text-sm whitespace-nowrap">
								<span class="hidden @min-[800px]:inline">{@render trainingStatus(user)}</span>
								<span
									class="inline-flex @min-[800px]:hidden"
									role="img"
									aria-label={user.isTrained ? 'Opplæring fullført' : 'Mangler opplæring'}
									title={user.isTrained ? 'Opplæring fullført' : 'Mangler opplæring'}
								>
									<Pill variant={user.isTrained ? 'green' : 'red'}>
										{#if user.isTrained}
											<Check class="h-4 w-4" />
										{:else}
											<X class="h-4 w-4" />
										{/if}
									</Pill>
								</span>
							</td>
							<td class="px-3 py-4 text-right text-sm whitespace-nowrap">
								<a
									aria-label={`Vis detaljer for ${user.name}`}
									title="Vis detaljer"
									href={resolve('/(portal)/portal/admin/bruker/[id]', { id: user.id })}
									class="inline-flex items-center gap-2 font-medium text-blue-600 transition-colors hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
								>
									<Eye class="h-4 w-4 shrink-0" />
									<span class="hidden @min-[800px]:inline">Vis detaljer</span>
								</a>
							</td>
						</tr>
					{/each}
					{#if filteredUsers.length === 0}
						<tr>
							<td colspan="5" class="px-3 py-12 text-center text-gray-500 dark:text-gray-400">
								<div class="flex flex-col items-center gap-4">
									<Users class="h-12 w-12 text-gray-300 dark:text-gray-600" />
									<div>
										<div class="text-lg font-medium text-gray-500 dark:text-gray-400">
											Ingen brukere funnet
										</div>
										{#if search}
											<div class="mt-1 text-sm text-gray-400 dark:text-gray-500">
												Prøv å endre søkekriteriene
											</div>
										{/if}
									</div>
								</div>
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

{#snippet trainingSelection(user: User)}
	<input
		type="checkbox"
		aria-label={`Velg ${user.name} til opplæring`}
		checked={selectedIds.includes(user.id)}
		onchange={() => toggleUser(user.id)}
		class="h-5 w-5 shrink-0 cursor-pointer rounded border-gray-300"
	/>
{/snippet}

{#snippet trainingStatus(user: User)}
	<Pill variant={user.isTrained ? 'green' : 'yellow'}
		>{user.isTrained ? 'Opplæring fullført' : 'Mangler opplæring'}</Pill
	>
{/snippet}

<Training
	isOpen={trainingOpen}
	userIds={selectedUsers.map((user: User) => user.id)}
	userName={selectedUsers.map((user: User) => user.name).join(', ')}
	onclose={() => {
		trainingOpen = false;
	}}
	onsave={() => {
		successMessage = `Opplæring registrert for ${selectedUsers.length} brukere.`;
		trainingOpen = false;
		selectedIds = [];
	}}
/>

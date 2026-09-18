<script lang="ts">
	import { getUserPresentation } from '$lib/utils/user-presentation';
	import logo from '$lib/assets/programmerbar-modern.svg';
	import {
		House,
		Calendar,
		Users,
		Settings,
		Bell,
		User,
		Beer,
		Menu,
		X,
		Shield,
		UserCheck,
		Moon,
		Sun
	} from '@lucide/svelte';
	import { page } from '$app/state';
	import { getThemeContext } from '$lib/states/theme.svelte';
	import { resolve } from '$app/paths';
	import type { Notification as DbNotification } from '$lib/server/db/schemas';
	import { cn } from '$lib/utils/cn';
	import { onNavigate } from '$app/navigation';
	import type { RouteId } from '$app/types';
	import { getUser } from '$lib/states/user.svelte';

	type NavRoute = {
		name: string;
		routeId: RouteId;
		icon: typeof House;
		count?: number;
	};

	type Props = {
		notifications: Array<DbNotification>;
		pendingApplicationsCount: number;
	};

	let { notifications, pendingApplicationsCount }: Props = $props();
	let user = getUser();
	let theme = getThemeContext();
	let isSidebarOpen = $state(false);
	let isMobile = $state(false);

	// Main portal navigation items
	const portalRoutes = [
		{
			name: 'Hjem',
			routeId: '/(portal)/portal',
			icon: House
		},
		{
			name: 'Arrangementer',
			routeId: '/(portal)/portal/arrangementer',
			icon: Calendar
		},
		{
			name: 'Frivillige',
			routeId: '/(portal)/portal/frivillige',
			icon: Users
		},
		{
			name: 'Min Profil',
			routeId: '/(portal)/portal/profil',
			icon: User
		}
	] satisfies Array<NavRoute>;

	// Admin routes (only visible to board members)
	const adminRoutes = $derived(
		user.current?.role === 'board'
			? ([
					{
						name: 'Status',
						routeId: '/(portal)/portal/status',
						icon: Settings
					},
					{
						name: 'Admin Panel',
						routeId: '/(portal)/portal/admin',
						icon: Shield
					},
					{
						name: 'Bonghistorikk',
						routeId: '/(portal)/portal/admin/historikk',
						icon: Beer
					},
					{
						name: 'Søknader',
						routeId: '/(portal)/portal/admin/soknader',
						icon: UserCheck,
						count: pendingApplicationsCount
					}
				] satisfies Array<NavRoute>)
			: []
	);

	const notificationsRoute = '/(portal)/portal/notifikasjoner';
	const notificationsHref = resolve(notificationsRoute);

	const handleResize = () => {
		if (typeof window === 'undefined') return;

		const wasDesktop = !isMobile;
		isMobile = window.innerWidth < 1024;

		// Only auto-open on desktop, keep closed on mobile
		if (!isMobile && wasDesktop !== !isMobile) {
			// Transitioning from mobile to desktop - open sidebar
			isSidebarOpen = true;
		} else if (isMobile) {
			// On mobile, keep sidebar closed by default
			isSidebarOpen = false;
		}
	};

	onNavigate(() => {
		if (isMobile) {
			isSidebarOpen = false;
		}
	});

	$effect(() => {
		// Initial setup
		if (typeof window !== 'undefined') {
			isMobile = window.innerWidth < 1024;
			isSidebarOpen = window.innerWidth >= 1024;
		}
	});

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}
</script>

<svelte:window onresize={handleResize} />

<!-- Mobile toggle button - floating action button -->
<div class="fixed right-6 bottom-6 z-60 lg:hidden">
	<button
		onclick={toggleSidebar}
		class="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-xl active:scale-95"
	>
		{#if isSidebarOpen}
			<X class="h-6 w-6" />
		{:else}
			<Menu class="h-6 w-6" />
		{/if}
	</button>
</div>

<!-- Overlay for mobile -->
{#if isSidebarOpen && isMobile}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs lg:hidden"
		onclick={toggleSidebar}
	></div>
{/if}

<!-- Sidebar -->
<aside
	class={cn(
		'border-portal-border bg-portal-card fixed top-0 left-0 z-50 h-svh transform overflow-hidden border-r transition-transform duration-300 ease-in-out lg:w-80',
		{
			'w-80': isSidebarOpen && isMobile, // Large width when opened on mobile
			'w-16 sm:w-20': !isSidebarOpen || !isMobile, // Narrow when closed or not mobile
			'translate-x-0': isSidebarOpen,
			'-translate-x-full lg:translate-x-0': !isSidebarOpen
		}
	)}
>
	<div class="flex h-full flex-col">
		<!-- Header -->
		<div class="border-portal-border flex items-center justify-start gap-3 border-b px-6 py-4">
			<img src={logo} alt="Programmerbar" class="h-8 w-8" />
			<div>
				<h1 class="font-bold text-gray-800 dark:text-gray-100">Portal</h1>
				<p class="text-xs text-gray-500 dark:text-gray-400">Programmerbar</p>
			</div>
		</div>

		<!-- Navigation -->
		<nav class="flex-1 space-y-8 overflow-y-auto px-4 py-6">
			<!-- Main Portal Section -->
			<div>
				<h2
					class="mb-3 px-2 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400"
				>
					Generelt
				</h2>
				<ul class="space-y-1">
					{#each portalRoutes as route (route.routeId)}
						{@const href = resolve(route.routeId)}
						{@const isActive = page.url.pathname === href}
						<li>
							<a
								{href}
								class={cn(
									'flex items-center justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
									{
										'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300': isActive,
										'hover:bg-portal-hover text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100':
											!isActive
									}
								)}
								title={route.name}
							>
								<route.icon class="size-5 shrink-0" />
								<span class="inline">{route.name}</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Admin Section (only for board members) -->
			{#if adminRoutes.length > 0}
				<div>
					<h2
						class="mb-3 px-2 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400"
					>
						Administrator
					</h2>
					<ul class="space-y-1">
						{#each adminRoutes as route (route.routeId)}
							{@const href = resolve(route.routeId)}
							{@const isActive = page.url.pathname === href}
							<li>
								<a
									{href}
									class={cn(
										'relative flex items-center justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
										{
											'bg-amber-50 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300':
												isActive,
											'hover:bg-portal-hover text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100':
												!isActive
										}
									)}
									title={route.name}
								>
									<route.icon class="size-5 shrink-0" />
									<span class="inline flex-1">{route.name}</span>
									{#if route.count && route.count > 0}
										<span
											class="static flex size-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white"
										>
											{route.count}
										</span>
									{/if}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			<!-- Notifications -->
			<div>
				<ul class="space-y-1">
					<li>
						<a
							href={notificationsHref}
							class={cn(
								'relative flex items-center justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
								{
									'dark:bg-portal-hover bg-gray-100 text-gray-900 dark:text-gray-100':
										page.url.pathname === notificationsHref,
									'hover:bg-portal-hover text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100':
										page.url.pathname !== notificationsHref
								}
							)}
							title="Notifikasjoner"
						>
							<Bell class="size-5 shrink-0" />
							<span class="inline flex-1">Notifikasjoner</span>
							{#if notifications.length > 0}
								<span
									class="static flex size-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white"
								>
									{notifications.length}
								</span>
							{/if}
						</a>
					</li>
				</ul>
			</div>
		</nav>

		<!-- User section -->
		<div class="border-portal-border border-t p-4">
			<div class="mb-3 flex items-center justify-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900"
				>
					<span class="text-sm font-medium text-blue-600 dark:text-blue-300">
						{user.current?.name?.charAt(0)?.toUpperCase() || 'U'}
					</span>
				</div>
				<div class="min-w-0 flex-1">
					<p class="truncate text-sm font-medium text-gray-700 dark:text-gray-200">
						{user.current?.name}
					</p>
					<p class="truncate text-xs text-gray-500 dark:text-gray-400">
						{user.current ? getUserPresentation(user.current).label : ''}
					</p>
				</div>
			</div>

			<div class="flex gap-2">
				<button
					onclick={() => theme.toggle()}
					class="hover:bg-portal-hover flex items-center justify-center gap-0 rounded-lg px-2 py-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
					title={theme.current === 'dark' ? 'Bytt til lyst tema' : 'Bytt til mørkt tema'}
				>
					{#if theme.current === 'dark'}
						<Sun class="size-5 shrink-0" />
					{:else}
						<Moon class="size-5 shrink-0" />
					{/if}
				</button>

				<a
					href={resolve('/')}
					class="hover:bg-portal-hover flex flex-1 items-center justify-start gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
					title="Hjem"
				>
					<House class="size-5 shrink-0" />
					<span class="inline">Til forsiden</span>
				</a>
			</div>
		</div>
	</div>
</aside>

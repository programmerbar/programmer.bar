<script lang="ts">
	import UserBadge from './UserBadge.svelte';
	import { initials, mailto } from '$lib/utils/strings';
	import type { User } from '$lib/server/db/schemas';
	import { cn } from '$lib/utils/cn';

	interface Props {
		user: User;
		onSelect?: (user: User) => void;
	}

	let { user, onSelect }: Props = $props();

	function handleClick() {
		onSelect?.(user);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			handleClick();
		}
	}
</script>

<div
	class={cn(
		'border-portal-border bg-portal-card relative block cursor-default rounded-lg border p-4 transition-colors',
		{
			'dark:hover:bg-portal-hover cursor-pointer hover:bg-gray-100 active:bg-gray-200/70 dark:active:bg-[#303030]':
				onSelect !== undefined
		}
	)}
	role="button"
	tabindex="0"
	onclick={handleClick}
	onkeydown={handleKeyDown}
	aria-label={`Click to view details of ${user.name}`}
>
	<div class="mb-2 flex justify-center">
		<div
			class="dark:border-portal-border dark:bg-portal-hover flex h-16 w-16 items-center justify-center rounded-full border border-gray-300 bg-gray-200"
		>
			<span class="text-lg font-medium text-gray-600 dark:text-gray-300">{initials(user.name)}</span
			>
		</div>
	</div>

	<div>
		<p class="text-center font-medium dark:text-gray-100">{user.name}</p>
		<p class="mt-1 text-center text-sm">
			<UserBadge {user} />
		</p>
		<p class="mt-1 text-center text-sm">
			<!-- eslint-disable svelte/no-navigation-without-resolve -->
			<a
				class="block max-w-full truncate hover:underline dark:text-gray-300"
				href={mailto(user.altEmail || user.email)}
			>
				{user.altEmail || user.email}
			</a>
		</p>
	</div>
</div>

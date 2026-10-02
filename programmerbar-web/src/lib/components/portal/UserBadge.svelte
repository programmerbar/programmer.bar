<script lang="ts">
	import Pill from '$lib/components/ui/Pill.svelte';
	import { getUserPresentation } from '$lib/utils/user-presentation';
	import type { User } from '$lib/server/db/schemas';

	let { user }: { user: Pick<User, 'role'> } = $props();
	const presentation = $derived(getUserPresentation(user));
</script>

<Pill variant={presentation.variant}>{presentation.label}</Pill>

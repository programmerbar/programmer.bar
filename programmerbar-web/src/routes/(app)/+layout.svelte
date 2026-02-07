<script lang="ts">
	import Footer from '$lib/components/app/Footer.svelte';
	import Header from '$lib/components/app/header/Header.svelte';
	import { createAppThemeContext } from '$lib/states/app-theme.svelte';

	let { children } = $props();

	// Initialize app theme context
	createAppThemeContext();
</script>

<div class="bg-background relative flex min-h-screen flex-col">
	<!-- Circuit board background pattern -->
	<div
		class="pointer-events-none absolute inset-0 bg-[url('/circuit-board.svg')] bg-size-[400px] bg-repeat opacity-100 dark:opacity-[0.02]"
		aria-hidden="true"
	></div>

	<div class="relative z-10 flex min-h-screen flex-col">
		<Header />

		<div class="mx-auto w-full max-w-7xl flex-1 px-4">
			{@render children()}
		</div>

		<Footer />
	</div>
</div>

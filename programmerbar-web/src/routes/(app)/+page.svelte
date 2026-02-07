<script lang="ts">
	import ContactForm from '$lib/components/app/landing/ContactForm.svelte';
	import EventList from '$lib/components/app/landing/EventList.svelte';
	import Hero from '$lib/components/app/landing/Hero.svelte';
	import Map from '$lib/components/app/landing/Map.svelte';
	import MenuList from '$lib/components/app/landing/MenuList.svelte';
	import StatusBanner from '$lib/components/app/landing/StatusBanner.svelte';
	import SEO from '$lib/components/SEO.svelte';

	let { data } = $props();
	let { products, events, status } = $derived(data);
</script>

<SEO
	title="Programmerbar"
	description="Programmerbar er en studentbar for informatikk studenter på Universitet i Bergen. Arrangementer, øl og koding i perfekt harmoni."
	keywords="studentbar, programmerbar, universitet i bergen, informatikk studenter, IT-studenter, bar, arrangementer"
	canonical="/"
	type="website"
/>

<StatusBanner {status} />

<!-- Hero Section -->
<Hero />

<!-- Main Content Sections -->
<div class="space-y-20 py-12 md:py-16 lg:py-20">
	<!-- Menu & Events Section -->
	<section class="space-y-12">
		<div class="mx-auto grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
			<MenuList {products} />
			<EventList {events} />
		</div>
	</section>

	<!-- Contact & Location Section -->
	<section class="mx-auto grid w-full grid-cols-1 gap-8 lg:grid-cols-2 lg:items-stretch">
		<ContactForm />
		<Map />
	</section>
</div>

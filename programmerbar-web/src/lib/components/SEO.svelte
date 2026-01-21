<script lang="ts">
	type Props = {
		title?: string;
		description?: string;
		keywords?: string;
		canonical?: string;
		image?: string;
		type?: 'website' | 'article' | 'product' | 'event';
		siteName?: string;
		author?: string;
		publishedTime?: string;
		modifiedTime?: string;
		noindex?: boolean;
		nofollow?: boolean;
	};

	let {
		title = 'Programmerbar',
		description = 'Norges beste studentbar for IT-studenter. Arrangementer, øl og koding i perfekt harmoni.',
		keywords = 'programmerbar, IT, studenter, bar, arrangementer, programmering, koding, øl, norge',
		canonical,
		image = '/og.png',
		type = 'website',
		siteName = 'Programmerbar',
		author = 'Programmerbar',
		publishedTime,
		modifiedTime,
		noindex = false,
		nofollow = false
	}: Props = $props();

	const baseUrl = 'https://programmer.bar';
	const fullImageUrl = $derived(image.startsWith('http') ? image : `${baseUrl}${image}`);
	const fullCanonicalUrl = $derived(
		canonical ? (canonical.startsWith('http') ? canonical : `${baseUrl}${canonical}`) : undefined
	);

	const pageTitle = $derived(title === 'Programmerbar' ? title : `${title} - Programmerbar`);
	const robotsContent = $derived(
		[noindex ? 'noindex' : 'index', nofollow ? 'nofollow' : 'follow'].join(', ')
	);
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{pageTitle}</title>
	<meta name="title" content={pageTitle} />
	<meta name="description" content={description} />
	<meta name="keywords" content={keywords} />
	<meta name="author" content={author} />
	<meta name="robots" content={robotsContent} />

	{#if fullCanonicalUrl}
		<link rel="canonical" href={fullCanonicalUrl} />
	{/if}

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={type} />
	<meta property="og:url" content={fullCanonicalUrl || baseUrl} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={fullImageUrl} />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:locale" content="nb_NO" />

	{#if publishedTime}
		<meta property="article:published_time" content={publishedTime} />
	{/if}
	{#if modifiedTime}
		<meta property="article:modified_time" content={modifiedTime} />
	{/if}

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={fullCanonicalUrl || baseUrl} />
	<meta property="twitter:title" content={pageTitle} />
	<meta property="twitter:description" content={description} />
	<meta property="twitter:image" content={fullImageUrl} />

	<!-- Additional SEO meta tags -->
	<meta name="theme-color" content="#1f2937" />
	<meta name="msapplication-TileColor" content="#1f2937" />
</svelte:head>

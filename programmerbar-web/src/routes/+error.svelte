<script lang="ts">
	import { page } from '$app/state';
	import {
		CircleAlert,
		Lock,
		ShieldAlert,
		FileQuestionMark,
		TriangleAlert,
		Wifi
	} from '@lucide/svelte';
	import { resolve } from '$app/paths';

	type Icon = typeof CircleAlert;

	const errors: Record<number, { title: string; message: string; icon: Icon }> = {
		400: {
			title: 'Dårlig forespørsel',
			message: 'Vi kunne ikke forstå forespørselen din. Prøv på nytt.',
			icon: CircleAlert
		},
		401: {
			title: 'Uautorisert',
			message: 'Du må være logget inn for å få tilgang til denne siden.',
			icon: Lock
		},
		403: {
			title: 'Forbidden',
			message: 'Du har ikke tillatelse til å få tilgang til denne siden.',
			icon: ShieldAlert
		},
		404: {
			title: 'Siden ble ikke funnet',
			message: 'Beklager, vi kunne ikke finne siden du leter etter.',
			icon: FileQuestionMark
		},
		500: {
			title: 'Serverfeil',
			message: 'Noe gikk galt på serveren vår. Vennligst prøv igjen senere.',
			icon: TriangleAlert
		},
		503: {
			title: 'Tjenesten er utilgjengelig',
			message: 'Serveren er for tiden utilgjengelig. Vennligst prøv igjen senere.',
			icon: Wifi
		}
	};

	const error = errors[page.status] || {
		title: 'Feil',
		message: 'Noe uventet skjedde. Vennligst prøv igjen.',
		icon: CircleAlert
	};
</script>

<div class="bg-background relative flex min-h-screen flex-col">
	<!-- Circuit board background pattern -->
	<div
		class="pointer-events-none absolute inset-0 bg-[url('/circuit-board.svg')] bg-size-[400px] bg-repeat opacity-100 dark:opacity-[0.02]"
		aria-hidden="true"
	></div>

	<div class="relative z-10 flex flex-1 items-center justify-center px-4">
		<div class="border-border bg-card w-full max-w-2xl border-2 p-8 text-center font-mono">
			<div class="mb-4 flex justify-center">
				<error.icon class="text-foreground-secondary h-12 w-12" />
			</div>
			<h1 class="text-foreground-primary mb-4 text-5xl font-bold">{page.status}</h1>
			<h2 class="text-foreground-primary mb-4 text-2xl font-semibold">{error.title}</h2>
			<p class="text-foreground-secondary mb-6">{error.message}</p>

			{#if page.status === 404}
				<div class="border-border bg-card-muted mb-8 border-l-4 p-4 text-left">
					<p class="text-foreground-muted mb-2 text-xs font-medium">Den forespurte URL-en var:</p>
					<p class="text-foreground-primary text-sm break-all">{page.url.pathname}</p>
				</div>
			{/if}

			<div class="flex flex-wrap justify-center gap-3">
				<a
					href={resolve('/')}
					class="border-border bg-card-muted hover:bg-card-hover hover:border-primary text-foreground-primary border-2 px-4 py-2 text-center font-mono text-sm font-semibold transition-all"
				>
					Til forsiden
				</a>
				<button
					onclick={() => window.history.back()}
					class="border-border bg-card-muted hover:bg-card-hover hover:border-primary text-foreground-primary border-2 px-4 py-2 text-center font-mono text-sm font-semibold transition-all"
				>
					Gå tilbake
				</button>
			</div>
		</div>
	</div>
</div>

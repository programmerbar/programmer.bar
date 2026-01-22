<script lang="ts">
	import lervigLogo from '$lib/assets/lervig-logo-black.png';
	import { getUser } from '$lib/states/user.svelte';
	import { resolve } from '$app/paths';
	import { PUBLIC_GITHUB_SHA } from '$env/static/public';

	let user = getUser();
</script>

<div class="border-footer-border bg-footer-background relative mt-32 border-t">
	<footer class="mx-auto max-w-6xl px-6 py-20 lg:px-8">
		<!-- Main Content -->
		<div
			class="mb-16 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8 lg:gap-12 [&>div]:mx-auto [&>div]:w-full [&>div]:max-w-xs"
		>
			<!-- Information Section -->
			<div class="space-y-4 text-center md:text-left">
				<h3 class="font-semibold tracking-wider uppercase opacity-70">Informasjon</h3>
				<div class="space-y-2 text-base">
					<p>echo Programmerbar</p>
					<p class="opacity-80">
						Org. nr.: <a
							class="transition-opacity hover:opacity-100"
							href="https://www.proff.no/selskap/echo-programmerbar/bergen/medlemsorganisasjoner/IFC3FCQ10PU/"
							>927 307 898</a
						>
					</p>
				</div>
			</div>

			<!-- Partner Section -->
			<div class="space-y-4 text-center">
				<h3 class="font-semibold tracking-wider uppercase opacity-70">Hovedsamarbeidspartner</h3>
				<a
					href="https://lervig.no"
					class="inline-block transition-opacity hover:opacity-80"
					aria-label="Lervig"
				>
					<img src={lervigLogo} alt="Lervig" class="mx-auto h-20 w-auto dark:invert" />
				</a>
			</div>

			<!-- Contact Section -->
			<div class="space-y-4 text-center md:text-right">
				<h3 class="font-semibold tracking-wider uppercase opacity-70">Kontakt oss</h3>
				<div class="space-y-2 text-base">
					<div>
						<a
							class="opacity-80 transition-opacity hover:opacity-100"
							href="https://www.instagram.com/echo_programmerbar"
						>
							@echo_programmerbar
						</a>
					</div>
					<div>
						<a
							class="opacity-80 transition-opacity hover:opacity-100"
							href="mailto:hei@programmerbar.no">hei@programmerbar.no</a
						>
					</div>
					<p class="opacity-80">
						Leder nr.:
						<a class="opacity-80 transition-opacity hover:opacity-100" href="tel:+4791992320"
							>919 92 320</a
						>
					</p>
				</div>
			</div>
		</div>

		<!-- Bottom Links -->
		<div class="border-footer-border space-y-6 border-t pt-12">
			<nav
				class="mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-medium"
			>
				<a
					class="opacity-70 transition-opacity hover:opacity-100"
					target="_blank"
					href="https://programmerbar.sanity.studio">Sanity</a
				>
				<a
					class="opacity-70 transition-opacity hover:opacity-100"
					target="_blank"
					href="https://github.com/programmerbar/mono">GitHub</a
				>
				<a class="opacity-70 transition-opacity hover:opacity-100" href={resolve('/beer-pong')}
					>Beer Pong</a
				>
				{#if user.current}
					<a class="opacity-70 transition-opacity hover:opacity-100" href={resolve('/portal')}
						>Portal</a
					>
				{/if}
				{#if user.current}
					<a class="opacity-70 transition-opacity hover:opacity-100" href={resolve('/emeritus')}
						>Emeritus</a
					>
				{/if}
				{#if !user.current}
					<a class="opacity-70 transition-opacity hover:opacity-100" href={resolve('/logg-inn')}
						>Logg inn</a
					>
				{/if}
			</nav>

			<!-- Version Info -->
			{#if PUBLIC_GITHUB_SHA}
				<div class="text-center text-xs opacity-50">
					<a
						class="transition-opacity hover:opacity-100"
						target="_blank"
						href="https://github.com/programmerbar/programmer.bar/commit/{PUBLIC_GITHUB_SHA}"
					>
						{PUBLIC_GITHUB_SHA.substring(0, 7)}
					</a>
				</div>
			{/if}
		</div>
	</footer>
</div>

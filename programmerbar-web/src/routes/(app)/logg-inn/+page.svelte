<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import { resolve } from '$app/paths';
	import CLIWindow from '$lib/components/app/CLIWindow.svelte';
	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: PageProps = $props();
</script>

<SEO title="Logg inn" description="Logg inn for å få tilgang til alle funksjoner" />

<CLIWindow title="cat logg-inn.txt" class="mx-auto max-w-md">
	<!-- Window Content -->
	<div class="p-6">
		<h2 class="text-foreground-primary mb-2 text-2xl font-semibold">
			<span class="text-foreground-muted">##</span> Logg inn
		</h2>
		<p class="text-foreground-muted mb-6 text-sm">
			Du må være en frivillig i Programmerbar for å logge inn.
		</p>
		{#if data.magicLinkInvalid}
			<p class="mb-4 text-sm text-red-500" role="alert">
				Innloggingslenken er ugyldig eller har utløpt. Be om en ny lenke.
			</p>
		{/if}
		<div class="flex flex-col gap-2">
			<a
				class="border-border bg-card-muted hover:bg-card-hover hover:border-primary text-foreground-primary border-2 px-4 py-3 text-center font-mono text-sm font-semibold transition-all"
				href={resolve('/auth/feide')}
			>
				Fortsett med Feide
			</a>

			<div class="text-foreground-muted my-3 flex items-center gap-3 text-xs">
				<div class="border-border flex-1 border-t"></div>
				<span>eller</span>
				<div class="border-border flex-1 border-t"></div>
			</div>

			<form use:enhance method="post" class="flex flex-col gap-2">
				<label for="email" class="text-foreground-muted font-mono text-sm">
					E-post{#if data.devLogins.length > 0}
						eller utviklerbruker{/if}
				</label>
				<input
					id="email"
					name="email"
					type={data.devLogins.length > 0 ? 'text' : 'email'}
					required
					autocomplete="email"
					placeholder={data.devLogins.length > 0
						? `E-post eller ${data.devLogins.join('/')}`
						: undefined}
					class="border-border bg-card text-foreground-primary focus:border-primary border-2 px-4 py-3 font-mono text-sm outline-none"
				/>
				{#if data.devLogins.length > 0}
					<p class="text-foreground-muted text-xs">
						Utviklerbrukere: {data.devLogins.join(', ')}
					</p>
				{/if}
				<button
					type="submit"
					class="border-border bg-card-muted hover:bg-card-hover hover:border-primary text-foreground-primary cursor-pointer border-2 px-4 py-3 text-center font-mono text-sm font-semibold transition-all"
				>
					Send innloggingslenke
				</button>
			</form>

			{#if form?.message}
				<p class="text-foreground-muted mt-2 text-sm" role="status">{form.message}</p>
			{:else if form?.error}
				<p class="mt-2 text-sm text-red-500" role="alert">{form.error}</p>
			{/if}
		</div>
	</div>
</CLIWindow>

<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { createContactSubmissionAction } from '../../../../routes/(app)/common.remote';
	import CLIWindow from '$lib/components/app/CLIWindow.svelte';
	import { Turnstile } from 'svelte-turnstile';
	import { env } from '$env/dynamic/public';
</script>

<CLIWindow title="nano kontakt.txt" class="h-full">
	<!-- Window Content -->
	<div class="flex flex-1 flex-col p-6">
		<form
			class="flex flex-1 flex-col space-y-4"
			{...createContactSubmissionAction.enhance(async ({ form, submit }) => {
				try {
					await submit();
					form.reset();

					toast.success('Takk for din henvendelse!');
				} catch {
					toast.error(
						'Noe gikk galt, prøv igjen senere. Hvis problemet vedvarer, kontakt oss på e-post, hei@programmerbar.no.'
					);
				}
			})}
		>
			<label class="flex flex-col gap-1">
				<span class="text-foreground-secondary text-xs font-medium">Navn</span>
				<input
					{...createContactSubmissionAction.fields.namekjkj.as('text')}
					placeholder="Kari Nordmann"
					required
					class="border-border bg-card-muted text-foreground-primary focus:border-primary h-10 border-2 px-3 py-2 font-mono text-sm focus:ring-0 focus:outline-none"
				/>
			</label>

			<label class="flex flex-col gap-1">
				<span class="text-foreground-secondary text-xs font-medium">E-post</span>
				<input
					{...createContactSubmissionAction.fields.emailkjkj.as('email')}
					placeholder="kari@norge.no"
					required
					class="border-border bg-card-muted text-foreground-primary focus:border-primary h-10 border-2 px-3 py-2 font-mono text-sm focus:ring-0 focus:outline-none"
				/>
			</label>

			<label class="flex flex-col gap-1">
				<span class="text-foreground-secondary text-xs font-medium">Melding</span>
				<textarea
					{...createContactSubmissionAction.fields.messagekjkj.as('text')}
					rows={5}
					placeholder="Din melding her..."
					required
					class="border-border bg-card-muted text-foreground-primary focus:border-primary min-h-20 w-full resize-none border-2 px-3 py-2 font-mono text-sm focus:ring-0 focus:outline-none"
				></textarea>
			</label>

			<Turnstile siteKey={env.PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY!} class="my-2" />

			<button
				type="submit"
				class="border-border bg-card-muted hover:bg-card-hover hover:border-primary focus:border-primary text-foreground-primary w-full border-2 px-4 py-2 text-center font-mono text-sm font-semibold transition-all focus:ring-0 focus:outline-none"
			>
				Send inn
			</button>
		</form>
	</div>
</CLIWindow>

<style>
	.field {
		opacity: 0;
		position: absolute;
		top: 0;
		left: 0;
		height: 0;
		width: 0;
		z-index: -1;
	}
</style>

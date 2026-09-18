<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import CLIWindow from '$lib/components/app/CLIWindow.svelte';

	const groupLogo = '/android-chrome-192x192.png';
	const groupName = 'Programmerbar';
	const estYear = '2020';
	const description = 'Tidligere og nåværende medlemmer av echo Programmerbar';

	const coFounders = [
		{ name: 'Brigt A.T Håvardstun', role: 'Co-founder' },
		{ name: 'Sandra Lekve', role: 'Co-founder' },
		{ name: 'Vegard Jensløkken', role: 'Co-founder' },
		{ name: 'Eivind D. Halderaker', role: 'Co-founder' }
	];

	type Member = { name: string; role?: string; start?: string; end?: string };

	const members: Member[] = [
		{ name: 'Erik Fjelltveit Nyhuus' },
		{ name: 'Steffen Andre Pettersen' },
		{ name: 'Siren Bjorøy' },
		{ name: 'Ole Straumland' },
		{ name: 'August Ebne Røeggen' },
		{ name: 'Sturla Rognskog Mella', start: 'Høst 2025' },
		{ name: 'Tord Vikøren Vikestad', start: 'Høst 2025' },
		{ name: 'Henrik Sætre Breivik', start: 'Høst 2025' },
		{ name: 'Anna Sviland', start: 'Høst 2026' },
		{ name: 'Anna Valencia Fari', start: 'Høst 2026' },
		{ name: 'Oddmund Gullbrå Steinsland', start: 'Høst 2026' },
		{ name: 'Maya Shantseva', start: 'Høst 2026' },
		{ name: 'Torjus Berntsen', start: 'Høst 2026' }
	];

	const pastMembers: Member[] = [
		{ name: 'Mina Tolfsen' },
		{ name: 'Ask Rud Persson' },
		{ name: 'Palma Rud Persson' },
		{ name: 'Sigurd Johnsen Setså' },
		{ name: 'Erlend Raa Vågset' },
		{ name: 'Sofia Hestenes Eika' },
		{ name: 'Kristoffer Borg Nilsen' },
		{ name: 'Lars Lismoen' },
		{ name: 'Yoeri Otten' },
		{ name: 'Eirik Øygard' },
		{ name: 'Arne Natskår' },
		{ name: 'Alexander Alf Iversen' },
		{ name: 'Henrik Trondseth' },
		{ name: 'Emil Johannessen' },
		{ name: 'Andre Normann' },
		{ name: 'Sofie Nhu Nguyen' },
		{ name: 'Simen Hauge Østbø' },
		{ name: 'Stian Munkejord' },
		{ name: 'Gard Heine Kalland' },
		{ name: 'Lars Bysheim' },
		{ name: 'Lars Haukland' },
		{ name: 'Eirik Rekve Thorsheim' },
		{ name: 'Tony Bao Lam', role: 'Innkjøp', end: 'Vår 2026' },
		{ name: 'Lene Soltveit', role: 'Økonomiansvarlig', end: 'Vår 2026' },
		{ name: 'Ole Magnus Fon Johnsen', role: 'Webansvarlig', end: 'Vår 2026' },
		{ name: 'Fredrik Hast Sørli', role: 'Økonomiassistent', start: 'Høst 2025', end: 'Vår 2026' }
	];
</script>

<SEO
	title="Tidligere Styremedlemmer"
	description="Lær mer om tidligere og nåværende styremedlemmer i Programmerbar."
	keywords="styremedlemmer, tidligere styremedlemmer, programmerbar, studentbar, informatikk studenter"
	canonical="/emeritus"
	type="website"
/>

<CLIWindow title="cat emeritus.txt" class="mx-auto max-w-xl">
	<!-- Window Content -->
	<div class="p-6 md:p-8">
		<div class="mx-auto max-w-xl space-y-8 text-center">
			<div>
				<img class="mx-auto h-32 w-auto" src={groupLogo} alt="Programmerbar logo" />
				<h1 class="text-foreground-primary mt-4 text-2xl font-semibold md:text-3xl">{groupName}</h1>
				<p class="text-foreground-muted mt-1 text-xs">
					<span class="text-foreground-subtle">#</span> EST. {estYear}
				</p>
				<p class="text-foreground-secondary mt-2 text-sm">{description}</p>
			</div>

			<div class="space-y-8 text-left">
				<!-- Co-founders -->
				<div>
					<h2 class="text-foreground-primary mb-4 text-lg font-semibold">
						<span class="text-foreground-muted">##</span> Co-founders
					</h2>
					<ul class="space-y-2">
						{#each coFounders as founder (founder.name)}
							<li class="border-primary border-l-4 pl-4">
								<span class="block">{founder.name}</span>
								<span class="text-foreground-muted mt-0.5 block text-sm">{founder.role}</span>
							</li>
						{/each}
					</ul>
				</div>

				<!-- Members -->
				<div>
					<h2 class="text-foreground-primary mb-4 text-lg font-semibold">
						<span class="text-foreground-muted">##</span> Styremedlemmer
					</h2>
					<ul class="space-y-2">
						{#each members as member (member.name)}
							<li class="border-primary border-l-4 pl-4">
								<span class="block">{member.name}</span>
								{#if member.start}
									<span class="text-foreground-muted mt-0.5 block text-sm">{member.start} – nå</span
									>
								{/if}
							</li>
						{/each}
					</ul>
				</div>

				<!-- Past Members -->
				<div>
					<h2 class="text-foreground-primary mt-12 mb-4 text-lg font-semibold">
						<span class="text-foreground-muted">##</span> Tidligere Styremedlemmer
					</h2>
					<ul class="space-y-2">
						{#each pastMembers as member (member.name)}
							<li class="border-primary border-l-4 pl-4">
								<span class="block">{member.name}</span>
								{#if member.role}
									<span class="text-foreground-muted mt-0.5 block text-sm">{member.role}</span>
								{/if}
								{#if member.end}
									<span class="text-foreground-muted mt-0.5 block text-xs">
										{#if member.start}
											{member.start} – {member.end.toLowerCase()}
										{:else}
											Til og med {member.end.toLowerCase()}
										{/if}
									</span>
								{/if}
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	</div>
</CLIWindow>

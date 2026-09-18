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

	type Semester = `Vår ${number}` | `Høst ${number}`;
	type Period = { start?: Semester; end?: Semester };
	type Role = {
		title: string;
		period?: Period;
	};
	type Member = {
		name: string;
		membership?: Period;
		roles: Role[];
	};

	const members: Member[] = [
		{ name: 'Erik Fjelltveit Nyhuus', roles: [{ title: 'Leder' }] },
		{ name: 'Steffen Andre Pettersen', roles: [{ title: 'Sosialansvarlig' }] },
		{ name: 'Siren Bjorøy', roles: [{ title: 'Bookingansvarlig' }] },
		{ name: 'Ole Straumland', roles: [{ title: 'Frivilligansvarlig' }] },
		{ name: 'August Ebne Røeggen', roles: [{ title: 'Nestleder' }] },
		{
			name: 'Sturla Rognskog Mella',
			membership: { start: 'Høst 2025' },
			roles: [
				{ title: 'Frivilligansvarlig og webansvarlig', period: { start: 'Vår 2026' } },
				{
					title: 'Assistent for frivilligansvarlig',
					period: { start: 'Høst 2025', end: 'Høst 2025' }
				}
			]
		},
		{
			name: 'Tord Vikøren Vikestad',
			membership: { start: 'Høst 2025' },
			roles: [{ title: 'Bygg/admin' }]
		},
		{
			name: 'Henrik Sætre Breivik',
			membership: { start: 'Høst 2025' },
			roles: [{ title: 'Quiz- og arrangementsansvarlig' }]
		},
		{ name: 'Anna Sviland', membership: { start: 'Høst 2026' }, roles: [] },
		{ name: 'Anna Valencia Fari', membership: { start: 'Høst 2026' }, roles: [] },
		{ name: 'Oddmund Gullbrå Steinsland', membership: { start: 'Høst 2026' }, roles: [] },
		{ name: 'Maya Shantseva', membership: { start: 'Høst 2026' }, roles: [] },
		{ name: 'Torjus Berntsen', membership: { start: 'Høst 2026' }, roles: [] }
	];

	const pastMembers: Member[] = [
		{ name: 'Mina Tolfsen', roles: [] },
		{ name: 'Ask Rud Persson', roles: [] },
		{ name: 'Palma Rud Persson', roles: [] },
		{ name: 'Sigurd Johnsen Setså', roles: [] },
		{ name: 'Erlend Raa Vågset', roles: [] },
		{ name: 'Sofia Hestenes Eika', roles: [] },
		{ name: 'Kristoffer Borg Nilsen', roles: [] },
		{ name: 'Lars Lismoen', roles: [] },
		{ name: 'Yoeri Otten', roles: [] },
		{ name: 'Eirik Øygard', roles: [] },
		{ name: 'Arne Natskår', roles: [] },
		{ name: 'Alexander Alf Iversen', roles: [] },
		{ name: 'Henrik Trondseth', roles: [] },
		{ name: 'Emil Johannessen', roles: [] },
		{ name: 'Andre Normann', roles: [] },
		{ name: 'Sofie Nhu Nguyen', roles: [] },
		{ name: 'Simen Hauge Østbø', roles: [] },
		{ name: 'Stian Munkejord', roles: [] },
		{ name: 'Gard Heine Kalland', roles: [] },
		{ name: 'Lars Bysheim', roles: [] },
		{ name: 'Lars Haukland', roles: [] },
		{ name: 'Eirik Rekve Thorsheim', roles: [] },
		{ name: 'Tony Bao Lam', membership: { end: 'Vår 2026' }, roles: [{ title: 'Innkjøp' }] },
		{
			name: 'Lene Soltveit',
			membership: { end: 'Vår 2026' },
			roles: [{ title: 'Økonomiansvarlig' }]
		},
		{
			name: 'Ole Magnus Fon Johnsen',
			membership: { end: 'Vår 2026' },
			roles: [{ title: 'Webansvarlig' }]
		},
		{
			name: 'Fredrik Hast Sørli',
			membership: { start: 'Høst 2025', end: 'Vår 2026' },
			roles: [{ title: 'Økonomiassistent' }]
		}
	];

	function formatPeriod(start?: string, end?: string, current = false): string {
		if (start && end) return start === end ? start : `${start} – ${end.toLowerCase()}`;
		if (end) return `Til og med ${end.toLowerCase()}`;
		if (start) return current ? `${start} – nå` : `Fra ${start.toLowerCase()}`;
		return '';
	}
</script>

{#snippet memberList(list: Member[], current: boolean)}
	<ul class="space-y-4">
		{#each list as member (member.name)}
			{@const membershipPeriod = formatPeriod(
				member.membership?.start,
				member.membership?.end,
				current
			)}
			<li class="border-primary border-l-4 pl-4">
				<span class="block">{member.name}</span>
				{#if membershipPeriod}
					<span class="text-foreground-muted mt-0.5 block text-xs"
						>I styret: {membershipPeriod}</span
					>
				{/if}
				{#if member.roles.length}
					<ul class="mt-1 space-y-2">
						{#each member.roles as entry}
							{@const period = formatPeriod(entry.period?.start, entry.period?.end, current)}
							<li>
								<span class="text-foreground-secondary block text-sm">{entry.title}</span>
								{#if period}
									<span class="text-foreground-muted mt-0.5 block text-xs">{period}</span>
								{/if}
							</li>
						{/each}
					</ul>
				{/if}
			</li>
		{/each}
	</ul>
{/snippet}

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

				<div>
					<h2 class="text-foreground-primary mb-4 text-lg font-semibold">
						<span class="text-foreground-muted">##</span> Styremedlemmer
					</h2>
					{@render memberList(members, true)}
				</div>

				<div>
					<h2 class="text-foreground-primary mb-4 text-lg font-semibold">
						<span class="text-foreground-muted">##</span> Tidligere Styremedlemmer
					</h2>
					{@render memberList(pastMembers, false)}
				</div>
			</div>
		</div>
	</div>
</CLIWindow>

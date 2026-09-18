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
			roles: [{ title: 'Bygg/admin', period: { start: 'Høst 2025' } }]
		},
		{
			name: 'Henrik Sætre Breivik',
			membership: { start: 'Høst 2025' },
			roles: [{ title: 'Quiz- og arrangementsansvarlig', period: { start: 'Høst 2025' } }]
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
		{
			name: 'Tony Bao Lam',
			membership: { end: 'Vår 2026' },
			roles: [{ title: 'Innkjøp', period: { end: 'Vår 2026' } }]
		},
		{
			name: 'Lene Soltveit',
			membership: { end: 'Vår 2026' },
			roles: [{ title: 'Økonomiansvarlig', period: { end: 'Vår 2026' } }]
		},
		{
			name: 'Ole Magnus Fon Johnsen',
			membership: { end: 'Vår 2026' },
			roles: [{ title: 'Webansvarlig', period: { end: 'Vår 2026' } }]
		},
		{
			name: 'Fredrik Hast Sørli',
			membership: { start: 'Høst 2025', end: 'Vår 2026' },
			roles: [{ title: 'Økonomiassistent', period: { start: 'Høst 2025', end: 'Vår 2026' } }]
		}
	];

	function formatPeriod(start?: string, end?: string, current = false): string {
		if (start && end) return start === end ? start : `${start} – ${end.toLowerCase()}`;
		if (end) return `Til og med ${end.toLowerCase()}`;
		if (start) return current ? `${start} – nå` : `Fra ${start.toLowerCase()}`;
		return '';
	}

	// Spring comes before autumn within a calendar year.
	function semesterIndex(semester: Semester): number {
		const [season, year] = semester.split(' ');
		return Number(year) * 2 + (season === 'Høst' ? 1 : 0);
	}

	function overlapsYear(period: Period | undefined, year: number, current: boolean): boolean {
		if (!period?.start && !period?.end) return false;
		// An unknown boundary must not imply membership in earlier/later years.
		const start = semesterIndex((period.start ?? period.end)!);
		const end = period.end ? semesterIndex(period.end) : current ? Infinity : start;
		return start <= (year + 1) * 2 && end >= year * 2 + 1;
	}

	const allMembers = [...members, ...pastMembers];
	const recordedYears = allMembers.flatMap((member) =>
		[member.membership, ...member.roles.map((role) => role.period)].flatMap((period) =>
			[period?.start, period?.end].flatMap((semester) =>
				semester ? [Math.floor((semesterIndex(semester) - 1) / 2)] : []
			)
		)
	);
	const boardYears = recordedYears.length
		? Array.from(
				{ length: Math.max(...recordedYears) - Math.min(...recordedYears) + 1 },
				(_, index) => Math.max(...recordedYears) - index
			)
		: [];
	let selectedYear = $state('all');
	const filteredMembers = $derived(
		allMembers.filter((member) => {
			const current = members.includes(member);
			return (
				overlapsYear(member.membership, Number(selectedYear), current) ||
				member.roles.some((role) => overlapsYear(role.period, Number(selectedYear), current))
			);
		})
	);
</script>

{#snippet memberList(list: Member[])}
	<ul class="space-y-4">
		{#each list as member (member.name)}
			{@const current = members.includes(member)}
			{@const roles = member.roles.filter(
				(role) => selectedYear === 'all' || overlapsYear(role.period, Number(selectedYear), current)
			)}
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
				{#if roles.length}
					<ul class="mt-1 space-y-2">
						{#each roles as entry}
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
				<div>
					<label for="board-year" class="text-foreground-primary mb-2 block text-sm font-medium"
						>Vis styre</label
					>
					<select
						id="board-year"
						bind:value={selectedYear}
						class="border-primary bg-background text-foreground-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-2"
						aria-describedby="board-history-note"
					>
						<option value="all">Hele listen</option>
						{#each boardYears as year (year)}
							<option value={String(year)}>Høst {year} – vår {year + 1}</option>
						{/each}
					</select>
					<p id="board-history-note" class="text-foreground-muted mt-3 text-sm">
						Historikken er ikke komplett. Flere kan ha sittet i styret i de ulike semestrene uten å
						være lagt til her ennå.
						{#if selectedYear !== 'all'}
							Utvalget viser medlemmer med registrert periode i dette styreåret. Medlemmer uten
							kjent periode finner du i hele listen.
						{/if}
					</p>
				</div>
				{#if selectedYear === 'all'}
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
						{@render memberList(members)}
					</div>

					<div>
						<h2 class="text-foreground-primary mb-4 text-lg font-semibold">
							<span class="text-foreground-muted">##</span> Tidligere Styremedlemmer
						</h2>
						{@render memberList(pastMembers)}
					</div>
				{:else}
					<div aria-live="polite">
						<h2 class="text-foreground-primary mb-2 text-lg font-semibold">
							<span class="text-foreground-muted">##</span> Høst {selectedYear} – vår {Number(
								selectedYear
							) + 1}
						</h2>
						<p class="text-foreground-muted mb-4 text-sm">
							{filteredMembers.length} registrerte medlemmer i løpet av styreåret
						</p>
						{#if filteredMembers.length}
							{@render memberList(filteredMembers)}
						{:else}
							<p class="text-foreground-secondary text-sm">
								Ingen medlemmer er registrert med periode i dette styreåret ennå.
							</p>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
</CLIWindow>

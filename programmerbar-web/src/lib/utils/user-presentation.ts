import type { ComponentProps } from 'svelte';
import type Pill from '$lib/components/ui/Pill.svelte';
import type { User } from '$lib/server/db/schemas';

type Presentation = {
	label: string;
	variant: NonNullable<ComponentProps<typeof Pill>['variant']>;
};

export const USER_ROLES = {
	normal: { label: 'Frivillig', pluralLabel: 'Frivillige', variant: 'blue' },
	board: { label: 'Styret', pluralLabel: 'Styret', variant: 'purple' },
	inactive: { label: 'Inaktiv', pluralLabel: 'Inaktive', variant: 'gray' }
} as const satisfies Record<User['role'], Presentation & { pluralLabel: string }>;

export const USER_ROLE_OPTIONS = Object.entries(USER_ROLES).map(([value, role]) => ({
	value: value as User['role'],
	label: role.label
}));

export const USER_ROLE_FILTER_OPTIONS = USER_ROLE_OPTIONS.map(({ value }) => ({
	value,
	label: USER_ROLES[value].pluralLabel
}));

export function getUserPresentation(user: Pick<User, 'role'>): Presentation {
	return USER_ROLES[user.role];
}

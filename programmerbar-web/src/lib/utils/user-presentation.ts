import type { ComponentProps } from 'svelte';
import type Pill from '$lib/components/ui/Pill.svelte';
import type { User } from '$lib/server/db/schemas';

type Presentation = {
	label: string;
	variant: NonNullable<ComponentProps<typeof Pill>['variant']>;
};

export const USER_ROLES = {
	normal: { label: 'Frivillig', pluralLabel: 'Frivillige', variant: 'blue' },
	board: { label: 'Styret', pluralLabel: 'Styret', variant: 'purple' }
} as const satisfies Record<User['role'], Presentation & { pluralLabel: string }>;

export const VOLUNTEER_STATUS = {
	active: { label: 'Aktiv frivillig', variant: 'green' },
	inactive: { label: 'Inaktiv', variant: 'gray' }
} as const satisfies Record<'active' | 'inactive', Presentation>;

export const USER_ROLE_OPTIONS = Object.entries(USER_ROLES).map(([value, role]) => ({
	value: value as User['role'],
	label: role.label
}));

export const USER_ROLE_FILTER_OPTIONS = USER_ROLE_OPTIONS.map(({ value }) => ({
	value,
	label: USER_ROLES[value].pluralLabel
}));

/** Inactive status takes precedence over the role in user summaries. */
export function getUserPresentation(user: Pick<User, 'role' | 'isActive'>): Presentation {
	return user.isActive ? USER_ROLES[user.role] : VOLUNTEER_STATUS.inactive;
}

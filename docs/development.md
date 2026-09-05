# Development guide

This guide covers the normal steps for making a code change.

## Before you start

Follow [Getting started](./getting-started.md) first. Make sure `pnpm dev` starts without an error.

Create a Git branch for your work:

```bash
git switch -c short-name-for-change
```

Use a short name that explains the change, such as `fix-menu-price` or `add-event-filter`.

## Setting up your user account

### With Feide

Before you can test features that require login, you need to add your account. This is done through
a small script that creates an invite for you email address, which allows you to log in through
Feide. Run the script with your email address:

```bash
pnpm run add-invitation "<your uib email>"
```

You can then navigate to the login page and log in with your Feide account.

> You UiB email address should be the one that ends with `@student.uib.no`. This is usally the email
> that we get from Feide when you authenticate.

## Becoming a board member

To become a board member and gain administrator privileges on the site after you have logged in, you
need to run the following script:

```bash
pnpm run add-board "<your uib email>"
```

## Finding the right place to work

Start from the page or feature you want to change:

- Page or form: look in `programmerbar-web/src/routes`.
- Reusable UI: look in `programmerbar-web/src/lib/components`.
- Database work: look in `programmerbar-web/src/lib/server/db`.
- Business rules and database queries: look in `programmerbar-web/src/lib/server/services`.
- Sanity content: look in `programmerbar-cms/schemaTypes` and `programmerbar-web/src/lib/api/sanity`.
- Email design: look in `programmerbar-email-templates/emails`.

It is usually easier to find a similar feature and follow its pattern than to start from an empty
file.

## Working with server code

Server routes receive shared services through `locals`. The services are created in
`src/hooks.server.ts` and live in `src/lib/server/services`.

Before adding a new query directly to a route, check whether the matching service already has the
method you need. If several routes will use the new logic, the service is normally the best place
for it.

## Forms and input

Treat all form values as untrusted. A user can change values before sending them to the server.
Validate input with Zod before saving or using it.

A common shape looks like this:

```typescript
const formSchema = z.object({
	name: z.string().min(1),
	email: z.email()
});

const result = formSchema.safeParse(values);

if (!result.success) {
	// Return a useful error to the form.
}
```

Look at existing `+page.server.ts` files for the full form pattern used in this project.

## Checking your work

Run these from the repository root:

```bash
pnpm check
pnpm lint
pnpm format:check
```

- `check` finds TypeScript and Svelte errors.
- `lint` finds unsafe or confusing code patterns.
- `format:check` checks spacing and formatting.

To let Prettier fix formatting, run:

```bash
pnpm format
```

Build the full project when your change affects setup, packages, or production code:

```bash
pnpm build
```

## Before opening a pull request

Check that:

- The feature works in the browser.
- Error cases show a useful message.
- `pnpm check`, `pnpm lint`, and `pnpm format:check` pass.
- You added or updated tests when it makes sense.
- You did not commit `.env` or any secret values.
- You updated the docs if setup or behavior changed.
- A database schema change includes a generated migration.

Keep pull requests focused on one change when possible. This makes them easier for another student
to read, test, and review.

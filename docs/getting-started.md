# Getting started

This guide takes you from a fresh download of the repository to a running local website.

## What you need

Install these tools first:

- [Node.js](https://nodejs.org/) for running JavaScript and TypeScript.
- Corepack, which comes with recent Node.js versions and installs the right version of pnpm.

The required pnpm version is stored in the root `package.json`. You normally do not need to choose
a version yourself.

## 1. Download the repository

If you have not downloaded it yet, clone it and enter the new folder:

```bash
git clone <repository-url>
cd programmer.bar
```

Replace `<repository-url>` with the URL from GitHub.

## 2. Turn on pnpm

```bash
corepack enable
corepack install
```

This will install the correct version of pnpm for this project. The `pnpm` command should now be
available in your terminal. Check that it works:

```bash
pnpm --version
```

## 3. Create your local environment file

The environment file stores settings and secret values that should not be committed to Git. You can
create it by copying the example file:

```bash
cp programmerbar-web/.env.example programmerbar-web/.env
```

Open `programmerbar-web/.env` and fill in the values you have received from the web team. The
example already contains test values for Cloudflare Turnstile.

Feide login needs these three values:

```sh
FEIDE_CLIENT_ID=
FEIDE_CLIENT_SECRET=
FEIDE_REDIRECT_URI="https://localhost:5173/auth/feide/callback"
```

Never commit real secrets. If you do not have the Feide values, ask on Slack. You should be able to
use the whole website without these values, except for login through Feide.

## 4. Install packages

From the repository root, run:

```bash
pnpm install
```

This installs packages for all three projects in the monorepo.

## 5. Set up the local database

Apply the existing database migrations. This should be done every time you pull new code and the
first time you set up the project:

```bash
pnpm db:migrate:local
```

## 6. Start the project

```bash
pnpm dev
```

The main services are:

- Website: <https://localhost:5173>
- Sanity Studio: <http://localhost:3333>

The website uses a local HTTPS certificate. Your computer may ask for permission to create or trust
it the first time you start the project.

## 7. Check that everything works

Open the website and make sure the front page loads. Then run:

```bash
pnpm check
pnpm lint
```

You now have a working development setup.

## Common problems

### The database has missing tables

Stop the development server and run `pnpm db:migrate:local` from the repository root.

### A port is already in use

Another development server may already be running. Stop it with `Ctrl+C` in its terminal, then run
`pnpm dev` again.

## Where to go next

Read the [architecture guide](./architecture.md) for a map of the code, or the
[development guide](./development.md) before making your first change.

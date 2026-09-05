# Programmerbar documentation

Welcome! This documentation explains how the Programmerbar website works and how you can help
develop it.

## Start here

1. [Getting started](./getting-started.md) explains how to run the project on your computer.
2. [Architecture](./architecture.md) gives you a simple map of the codebase.
3. [Development guide](./development.md) explains how we add code and check our work.

## What is in this repository?

Programmerbar is a monorepo. This means that one Git repository contains several tightly connected projects in one repository instead of multiple separate ones. This is mostly an ergonomic thing so that we can easily make changes to multiple parts of the codebase, without having to orchestrate multiple pushes / pull requests. The projects in this repository are:

- `programmerbar-web` is the website, server code, and member portal.
- `programmerbar-cms` is the Sanity studio used to manage content. Also called a CMS (content management system).
- `programmerbar-email-templates` contains the email templates sent by the website.

Most contributors will spend their time in `programmerbar-web`.

## Quick command list

Run these commands from the repository root unless a guide says otherwise.

| Command                 | What it does                                   |
| ----------------------- | ---------------------------------------------- |
| `pnpm install`          | Installs the packages needed by every project. |
| `pnpm dev`              | Starts the website and Sanity studio.          |
| `pnpm check`            | Checks Svelte and TypeScript code.             |
| `pnpm lint`             | Finds common code style problems.              |
| `pnpm format:check`     | Checks that files are formatted correctly.     |
| `pnpm build`            | Builds all projects.                           |
| `pnpm db:migrate:local` | Updates your local database.                   |

## External resources

- [SvelteKit documentation](https://kit.svelte.dev/docs) for the framework used to build the
  website.
- [Svelte documentation](https://svelte.dev/docs) for the framework used to build the website and
  email templates.
- [Drizzle ORM documentation](https://orm.drizzle.team/) for the database library used in the
  website.
- [Tailwind CSS documentation](https://tailwindcss.com/docs) for the CSS framework used in the
  website and email templates.
- [Sanity documentation](https://www.sanity.io/docs) for the CMS used to manage content.
- [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/) for the serverless
  platform that runs the website.
- [Cloudflare D1 documentation](https://developers.cloudflare.com/d1/) for the database used by the
  website.
- [Cloudflare KV documentation](https://developers.cloudflare.com/workers/runtime-apis/kv/) for the
  key-value store used by the website.
- [Cloudflare Email documentation](https://developers.cloudflare.com/email-service/) for the email
  service used by the website.
- [React Email documentation](https://react.email/docs/introduction) for the email template
  framework used by the website.
- [TypeScript documentation](https://www.typescriptlang.org/docs/) for the programming language used
  in the website and email templates.

## Keeping these docs useful

If your code changes how people set up, use, or develop the project, update the related page in this folder. Short examples are usually more helpful than long explanations.

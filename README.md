# Programmerbar Website

## Prerequisites

- [Node.js](https://nodejs.org/)

## How to run locally

1. Use the correct package manager with corepack

   ```bash
   corepack enable
   corepack prepare pnpm@latest --activate
   ```

1. Fill in env-variables

   ```bash
   cp programmerbar-web/.env.example programmerbar-web/.env
   ```

1. Fill in the empty variables

1. Install dependencies

   ```bash
   pnpm install
   ```

1. Apply migrations

   ```bash
   pnpm db:migrate:local
   ```

1. Start the development server

   ```bash
    pnpm dev
   ```

- Website will run on <http://localhost:5173>
- Sanity will run on <http://localhost:3333>

## Documentation

Read more in the [documentation](./docs/README.md).

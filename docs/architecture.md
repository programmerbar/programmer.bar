# Architecture

This page gives you a map of the project. It is fine if some words are new to you. You can come back
to this page as you work on different parts of the code.

## The short version

The browser sends a request to the SvelteKit app. SvelteKit runs the server code, gets any needed
data, and returns a page or an API response.

```text
Browser
   |
   v
SvelteKit app in programmerbar-web
   |
   +-- D1 database (users, shifts, products, and other app data)
   +-- Sanity (website content and events)
   +-- KV (small values such as status and rate limits)
   +-- Cloudflare Email (emails sent by the app)
```

The app is built to run on Cloudflare Workers. Which is a serverless platform that allows our code
to run in small containers close to the user. We also use Cloudflare's D1 database and Cloudflare KV
for fast key-value storage. We also send our emails through Cloudflare Email.

## The three projects

### `programmerbar-web`

This is the main project. It contains both the pages people see and the server code behind them.

Useful folders inside `programmerbar-web/src`:

- `routes`: Pages, layouts, form actions, and API endpoints.
- `lib/components`: Svelte components that can be reused on several pages.
- `lib/server`: Server-only code, including auth, database code, and services.
- `lib/api/sanity`: Code that gets content from Sanity.
- `scripts`: Small scripts for setup, test data, and invitations.

Code under `lib/server` must only run on the server. Do not import it into a browser component.
SvelteKit will also throw an error if you try to do this.

### `programmerbar-cms`

This is the Sanity Studio. Editors use it to manage content without changing code. Its content
types are in `programmerbar-cms/schemaTypes`.

### `programmerbar-email-templates`

This project contains React Email templates. The web app renders these templates and sends the
result as email.

## Services

We try to keep the keep business logic in service classes. A service class is a TypeScript class
that contains methods for a specific part of the app. For example, `user.service.ts` contains
methods for retrieving, creating, and updating users. `shift.service.ts` contains methods for
shifts. And so on.

Service classes live in `programmerbar-web/src/lib/server/services`.

Keeping this work in services means routes do not need to contain every database query. It also
makes shared code easier to find.

All services should be instantiated in `hooks.server.ts` and passed to the routes through the
`locals` object. This will again make all the serivces available to all routes. `hooks.server.ts` is
a special type of file that runs before every request, meaning that we use this to "set up" the
application for each request.

## Authentication and permissions

The app uses Feide for login and Lucia for sessions. After login, the session is stored in the D1
database and its ID is stored in a browser cookie.

There are two user roles:

- `normal` is a regular member.
- `board` can open admin pages.

The request hook redirects visitors who are not signed in away from `/portal`. It also checks that
admin users have the `board` role.

## Where data lives

Not all data is stored in the same place:

- Cloudflare D1 stores app data such as users, shifts, notifications, and products.
   SQLite database that is compatible with D1. You can use a normal SQLite client to open it.
- The main Sanity project stores managed website content.
- A second Sanity project supplies events from echo. See
  [echo-web-mono](https://github.com/echo-webkom/echo-web-mono).
- Cloudflare R2 stores uploaded images. (Currently not used)
- Cloudflare KV stores small values used for status, bans, magic links, and rate limits.

## Local database

The local D1 database is a SQLite database that can be found in
`programmerbar-web/.wrangler/state/v3/d1/miniflare-<something>/<random-id>.sqlite`. This is a
SQLite database can be opned with a normal SQLite client. For example macOS ships with the `sqlite3`
tool which could be useful to use to inspect the data in the database. You could also use a GUI tool
like TablePlus (costs money).


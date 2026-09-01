# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Programmerbar** is a Norwegian student bar/social organization management platform built as a monorepo. The application manages member registration, event/shift assignments, beer/product inventory with tiered pricing, volunteer applications, and admin workflows.

## Monorepo Structure

This is a **Turborepo** monorepo with three workspaces:

- **programmerbar-web**: Main SvelteKit application (frontend + backend)
- **programmerbar-cms**: Sanity Studio (headless CMS)
- **programmerbar-email-templates**: React Email templates (shared package)

## Common Commands

### Development

```bash
pnpm install              # Install all dependencies
pnpm dev                  # Start all workspaces in dev mode
                         # - Web: http://localhost:5173
                         # - Sanity: http://localhost:3333
```

### Building & Deployment

```bash
pnpm build               # Build all workspaces
pnpm preview             # Build and preview with Wrangler
cd programmerbar-web && pnpm deploy  # Deploy to Cloudflare Workers
```

### Code Quality

```bash
pnpm lint                # Lint all workspaces
pnpm lint:fix            # Fix linting issues
pnpm check               # Type-check all workspaces (svelte-check)
pnpm format              # Format code with Prettier
pnpm format:check        # Check formatting without writing
```

### Database (Drizzle + Cloudflare D1)

```bash
pnpm db:generate         # Generate migration files from schema changes
pnpm db:migrate:local    # Apply migrations to local D1 database
pnpm db:migrate          # Apply migrations to production D1 database
```

**Important**: When you modify database schemas in `src/lib/server/db/schemas/`, always run `pnpm db:generate` to create migration files before applying them. The production D1 database is named `progbar-db` (see `db:migrate` in `programmerbar-web/package.json`).

### Testing

```bash
# In programmerbar-web/
pnpm test:unit           # Run Vitest unit tests
pnpm test:e2e            # Run Playwright e2e tests
pnpm test:e2e:ui         # Run Playwright with the UI runner
```

### Utilities

```bash
# From repo root
pnpm add-invitation "<email>"   # Create user invitation (wraps src/scripts/add-invitation.ts)

# In programmerbar-web/ (scripts live in src/scripts/)
pnpm dlx tsx ./src/scripts/seed.ts       # Seed local database
pnpm dlx tsx ./src/scripts/reset.ts      # Reset local database
pnpm dlx tsx ./src/scripts/setup.ts      # Set up local database
pnpm typegen                             # Generate Wrangler types (-> src/worker-configuration.d.ts)
```

### CMS

```bash
# In programmerbar-cms/
pnpm extract             # Extract Sanity schema
pnpm typegen             # Generate TypeScript types from schema
pnpm deploy              # Deploy Sanity Studio
```

## Architecture

### Tech Stack

**Frontend & Backend** (Same SvelteKit app):

- SvelteKit 2.57 with Vite 8
- Cloudflare Workers (via @sveltejs/adapter-cloudflare)
- Tailwind CSS 4.2 + Bits UI component library
- Svelte 5.55 (Runes syntax)
- Zod 4 for validation (`src/lib/validators.ts`), Sentry for error tracking, Turnstile for bot protection

**Data Layer**:

- Cloudflare D1 (serverless SQLite)
- Drizzle ORM 0.45 with relational queries
- Database migrations via drizzle-kit
- Snake_case conversion enabled in Drizzle config

**Authentication**:

- Lucia 3.2 (session-based auth)
- Feide OAuth2 provider (Norwegian federated identity service)
- Cookie-based sessions stored in D1
- Session validation in `hooks.server.ts`

**Content Management**:

- **Two separate Sanity instances**:
  - Main Sanity: products, producers, product types
  - Echo Sanity: events/happenings (external event system integration)
- GROQ queries for content fetching
- Image handling via @sanity/image-url

**Email**:

- Cloudflare Email (transactional email service)
- React Email for templates (in shared workspace)
- Shift emails include .ics calendar attachments

**Infrastructure** (Cloudflare):

- Workers: Serverless runtime
- D1: SQLite database
- R2: Object storage (product images)
- KV: Key-value store (IP bans, status cache)

### Service Layer Pattern

The application uses **dependency injection** via `hooks.server.ts`. Every request handler receives initialized services in `event.locals`:

```typescript
event.locals.db; // Drizzle ORM instance
event.locals.auth; // Lucia auth instance
event.locals.eventService; // Event CRUD operations
event.locals.userService; // User CRUD operations
event.locals.shiftService; // Shift management
event.locals.productService; // Product management
// ... and more
```

Services are **class-based** (e.g., `UserService`, `EventService`) with private `#db` field and public methods. Each service focuses on one domain. DB-backed services take the Drizzle `Database`; some take Cloudflare bindings instead (e.g. `BanService`/`StatusService`/`RateLimitService` take `STATUS_KV`, `ImageService` takes `R2_BUCKET`, `EmailService` takes a `sendEmail` function).

**Location**: `src/lib/server/services/` (everything under `src/lib/server/` is server-only and never bundled to the client)

### Database Schema

Key tables (all in `src/lib/server/db/schemas/`):

- `user` - Members with Feide ID, role (board/normal), training status
- `session` - Lucia session storage
- `event` - Internal events with optional slug for public listing
- `shift` - Volunteer shifts within events
- `user_shift` - Join table (user assignments to shifts)
- `product` - Beverages with three price tiers (`ordinaryPrice`, `studentPrice`, `internalPrice`) + credits
- `producer` - Breweries/distilleries
- `product_type` - Beer categories
- `group` - User groups/teams
- `users_groups` - Join table (user memberships)
- `notification` - User notifications
- `pending_application` - Volunteer applications
- `referral` - Referral system tracking
- `claimed_credit` - Beer credit claims
- `invitation` - User invitations

**Schema changes workflow**:

1. Edit schema files in `src/lib/server/db/schemas/`
2. Run `pnpm db:generate` to create migration
3. Run `pnpm db:migrate:local` to apply locally
4. Test changes
5. Run `pnpm db:migrate` for production

### Route Structure

**Public Routes** `src/routes/(app)/`:

- `/` - Homepage
- `/meny` - Beer/product menu
- `/arrangement` - Event listings (from Sanity)
- `/arrangement/[slug]` - Event details
- `/logg-inn` - Login (Feide OAuth redirect)
- `/bli-frivillig` - Volunteer signup form
- `/meny`, `/produkt`, `/om-oss`, `/emeritus`, `/beer-pong` - Misc public pages

**Protected Routes** `src/routes/(portal)/portal/`:

- `/portal` - User dashboard (requires auth)
- `/portal/profil` - User profile & settings
- `/portal/admin/*` - Board-only admin panel (requires `user.role === 'board'`)
  - `/portal/admin/soknader` - Pending applications
  - `/portal/admin/historikk` - Statistics/history
  - `/portal/admin/bruker` - User management
  - `/portal/admin/cms` - Product/producer/type management

**API Routes** `src/routes/(app)/`:

- `/slack-command` - Slack integration webhook
- `/booking` - Event booking endpoint

Route protection is implemented in `src/hooks.server.ts` with HTTP 307 redirects.

### Authentication Flow

1. User clicks login → redirects to `/logg-inn`
2. Feide OAuth redirect → user authorizes
3. Callback receives `sub` (unique ID) + email from Feide
4. `UserService` looks up by `feideId` or creates new user
5. Lucia creates session in `session` table
6. Session cookie set → user redirected to `/portal`

On every request:

- `hooks.server.ts` extracts session cookie
- Validates with Lucia (queries D1 `session` table)
- Populates `event.locals.user` and `event.locals.session`
- Protects routes based on auth status and role

**Files**:

- `src/hooks.server.ts` - Request lifecycle & DI
- `src/lib/server/auth/lucia.ts` - Lucia auth factory
- `src/lib/server/auth/feide.ts` - Feide OAuth2 provider
- `src/routes/(app)/logg-inn/` - Login landing page
- `src/routes/(portal)/auth/feide/+server.ts` - Feide OAuth redirect endpoint
- `src/routes/(portal)/auth/feide/callback/+server.ts` - OAuth callback
- `src/routes/(portal)/auth/logg-ut/` - Logout

### Sanity CMS Integration

**Two separate Sanity projects**:

1. **Main Sanity** (`sanityClient`):
   - Products, producers, product types
   - Configured in `src/lib/api/sanity/client.ts`
   - Schema in `programmerbar-cms/schemaTypes/`

2. **Echo Sanity** (`echoSanityClient`):
   - Events/happenings from external system
   - Separate project ID and dataset

**Usage**:

```typescript
// Fetch products from main Sanity
const products = await sanityClient.fetch(groq`*[_type == "product"]`);

// Fetch events from Echo Sanity
const events = await echoSanityClient.fetch(groq`*[_type == "happening"]`);

// Generate image URLs
const imageUrl = imageUrlBuilder.image(product.image).width(400).url();
```

**Files**:

- `src/lib/api/sanity/client.ts` - Client setup + image URL builder
- `src/lib/api/sanity/echo-cms.ts` - Echo Sanity client (events/happenings)
- `src/lib/api/sanity/queries.ts` - GROQ queries
- `src/lib/api/remotes/` - SvelteKit remote functions for data fetching

### Email System

Email templates are **React components** in the `@programmerbar/email-templates` workspace:

- `ContactUsEmail.tsx` - Contact form notifications
- `InvitationEmail.tsx` - User invitations
- `NewShiftEmail.tsx` - Shift assignments (includes .ics attachment)
- `VolunteerRequestEmail.tsx` - Volunteer applications

**Sending emails**:

```typescript
const html = render(<InvitationEmail email={email} />)
await event.locals.emailService.sendEmail({
  from: 'Programmerbar <no-reply@programmer.bar>',
  to: email,
  subject: 'Invitation',
  html
})
```

**File**: `src/lib/server/services/email.service.tsx`

### Cloudflare Bindings

Access Cloudflare resources via `event.platform?.env`:

```typescript
event.platform.env.DB; // D1 database
event.platform.env.BUCKET; // R2 bucket (images)
event.platform.env.STATUS_KV; // KV namespace (caching)
event.platform.env.FEIDE_CLIENT_ID; // OAuth credentials
```

**Configuration**: `programmerbar-web/wrangler.jsonc`

## Important Conventions

### Code Style

- **Database**: Use `snake_case` in SQL (handled by Drizzle config `casing: 'snake_case'`)
- **TypeScript**: Use `camelCase` for variables, `PascalCase` for types/classes
- **Services**: Name as `domain.service.ts` (e.g., `user.service.ts`, `event.service.ts`)
- **Components**: Use `.svelte` extension, `PascalCase` for component names

### Type Safety

- Services accept `Database` type from `$lib/db/drizzle`
- Use Drizzle's `InferSelectModel<typeof table>` for type inference
- SvelteKit auto-generates `$types` for routes (don't import manually)

### Form Validation

Use **Zod** schemas for all form validation:

```typescript
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

// In +page.server.ts actions:
const result = schema.safeParse(formData);
```

### Environment Variables

**Local development**: Copy `.env.example` to `.env` in `programmerbar-web/`

**Production**: Set via Wrangler secrets or environment variables in Cloudflare dashboard

Required variables:

- `FEIDE_CLIENT_ID`, `FEIDE_CLIENT_SECRET` - OAuth credentials
- `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET` - Main Sanity
- `PUBLIC_ECHO_SANITY_PROJECT_ID`, `PUBLIC_ECHO_SANITY_DATASET` - Echo Sanity

## Common Workflows

### Adding a New Database Table

1. Create schema file in `src/lib/server/db/schemas/your-table.ts`
2. Export from `src/lib/server/db/schemas/index.ts`
3. Run `pnpm db:generate` to create migration
4. Run `pnpm db:migrate:local` to apply locally
5. Create corresponding service in `src/lib/server/services/your-domain.service.ts`
6. Initialize service in `src/hooks.server.ts`

### Adding a New Route

**Public route**:

1. Create `src/routes/(app)/your-path/+page.svelte`
2. Add server logic in `+page.server.ts` if needed
3. No auth required by default

**Protected route**:

1. Create `src/routes/(portal)/portal/your-path/+page.svelte`
2. Add server logic in `+page.server.ts`
3. Access user via `const { user } = await parent()`

**Admin-only route**:

1. Create `src/routes/(portal)/portal/admin/your-path/+page.svelte`
2. Check `user.role === 'board'` in `+page.server.ts` or component
3. Redirect if unauthorized

### Testing Email Templates

```bash
cd programmerbar-email-templates
pnpm dev  # Starts React Email dev server on http://localhost:3000
```

Preview and iterate on email templates in the browser.

### Running Single Tests

```bash
# Unit test (Vitest)
pnpm test:unit -- path/to/test.test.ts

# E2E test (Playwright)
pnpm test:e2e -- tests/your-test.spec.ts
```

## Key Files Reference

| Purpose                | File Path                                     |
| ---------------------- | --------------------------------------------- |
| Request lifecycle & DI | `src/hooks.server.ts`                         |
| Database factory       | `src/lib/server/db/drizzle.ts`                |
| Database schemas       | `src/lib/server/db/schemas/`                  |
| Services               | `src/lib/server/services/`                    |
| Lucia auth setup       | `src/lib/server/auth/lucia.ts`                |
| Feide OAuth            | `src/lib/server/auth/feide.ts`                |
| Zod validators         | `src/lib/validators.ts`                       |
| Sanity integration     | `src/lib/api/sanity/`                         |
| Email templates        | `../programmerbar-email-templates/templates/` |
| Cloudflare config      | `wrangler.jsonc`                              |
| Drizzle config         | `drizzle.config.ts`                           |

## Domain-Specific Notes

### Product Pricing System

Products have **three price tiers**:

- `ordinaryPrice` - Regular customers
- `studentPrice` - Discounted for students
- `internalPrice` - Cost for board members

Products also have a `credits` field (1-5 rating).

### User Roles

- `normal` - Regular member
- `board` - Board member (admin access)

Check role in routes:

```typescript
if (user.role !== "board") {
  redirect(307, "/portal");
}
```

### Training Status

Users have training-related fields:

- `trainingCompleted` - Boolean
- `trainingCompletedDate` - Timestamp

Managed via `UserService`.

### Shift Assignment Flow

1. Board creates event with shifts in `/portal/admin`
2. Board assigns users to shifts (`user_shift` join table)
3. `ShiftService` sends email via `EmailService`
4. Email includes .ics file for calendar import
5. User receives shift details + calendar invite

### Referral System

Users can refer others. Tracked in `referral` table with `referrerId` and `referredId`.

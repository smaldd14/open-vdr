# Open VDR

A self-hosted Virtual Data Room built on Cloudflare Workers and Supabase. Designed for due diligence, M&A, and fundraising workflows where organizations need secure, audited document sharing with controlled access.

## Features

- **Document management** — upload, organize in folders, and download files up to 100 MB
- **PDF watermarking** — every PDF download is stamped with a configurable label, the viewer's email, and the date
- **Role-based access** — admin and viewer roles per room
- **Invitation system** — email invitations with 7-day expiry via AWS SES
- **Audit log** — every upload, download, deletion, and member change is recorded with IP and user agent
- **Room branding** — custom logo and primary color per room

## Stack

| Layer | Technology |
|---|---|
| Runtime | Cloudflare Workers |
| API framework | Hono |
| Database | Supabase (PostgreSQL + RLS) |
| File storage | Cloudflare R2 |
| Email | AWS SES |
| Frontend | React 19, Vite, Tailwind CSS v4 |
| PDF processing | pdf-lib |

## Project Structure

```
src/
├── worker/              # Cloudflare Worker (backend)
│   ├── routes/          # API route handlers
│   ├── middleware/      # Auth middleware
│   ├── db/              # All database queries
│   └── lib/             # Supabase client, email, watermark
├── react-app/           # React frontend
│   ├── pages/           # Route-level components
│   ├── hooks/           # Data fetching hooks
│   └── components/      # Shared UI components
├── lib/                 # Shared utilities (parse-jsonb, etc.)
└── types/               # Generated Supabase types
supabase/
└── migrations/          # SQL migration files
```

## Prerequisites

- Node.js 20+
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (`npm i -g wrangler`)
- A Cloudflare account with an R2 bucket
- An AWS account with SES configured

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Start local Supabase

```bash
supabase start
```

This starts a local Postgres instance (port 54321) and applies migrations from `supabase/migrations/`.

### 3. Configure environment variables

Create `.dev.vars` in the project root:

```ini
WATERMARK_TEXT=YOUR_LABEL
CORS_ALLOWED_ORIGINS=
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_PUBLISHABLE_KEY=<from supabase start output>
SUPABASE_SECRET_KEY=<from supabase start output>
SES_AWS_REGION=us-east-1
SES_ACCESS_KEY_ID=<your AWS key>
SES_SECRET_ACCESS_KEY=<your AWS secret>
SES_FROM_EMAIL=noreply@yourdomain.com
APP_URL=http://localhost:5173
```

### 4. Start the development servers

In two separate terminals:

```bash
# Frontend (Vite dev server on :5173)
npm run dev

# Backend (Wrangler local worker on :8787)
npm run dev:worker
```

## Deployment

### 1. Create an R2 bucket

```bash
wrangler r2 bucket create open-vdr-files
```

Update `wrangler.jsonc` if you use a different bucket name.

### 2. Set production secrets

```bash
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_PUBLISHABLE_KEY
wrangler secret put SUPABASE_SECRET_KEY
wrangler secret put SES_ACCESS_KEY_ID
wrangler secret put SES_SECRET_ACCESS_KEY
wrangler secret put SES_FROM_EMAIL
wrangler secret put APP_URL
```

### 3. Apply database migrations

```bash
supabase db push
```

### 4. Deploy

```bash
npm run deploy
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server (frontend) |
| `npm run dev:worker` | Wrangler dev server (backend) |
| `npm run build` | TypeScript check + full production build |
| `npm run check` | Build + dry-run deploy |
| `npm run deploy` | Deploy to Cloudflare Workers |
| `npm run test` | Run tests |
| `npm run test:coverage` | Tests with coverage report |
| `npm run lint` | ESLint |
| `npm run cf-typegen` | Regenerate `worker-configuration.d.ts` |
| `npm run knip` | Find unused exports and dependencies |

## Schema Changes

After modifying `supabase/migrations/`, regenerate the TypeScript types:

```bash
supabase gen types typescript --local > src/types/supabase.ts
```

After modifying `wrangler.jsonc`, regenerate Worker env types:

```bash
wrangler types
```

## Environment Variables

| Variable | Description |
|---|---|
| `WATERMARK_TEXT` | Label stamped on every PDF download (e.g. `CONFIDENTIAL`) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed origins (empty = localhost only) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `SUPABASE_SECRET_KEY` | Supabase service role key |
| `SES_AWS_REGION` | AWS region for SES |
| `SES_ACCESS_KEY_ID` | AWS access key ID |
| `SES_SECRET_ACCESS_KEY` | AWS secret access key |
| `SES_FROM_EMAIL` | Sender address for invitation emails |
| `APP_URL` | Public URL of the frontend (used in invite links) |

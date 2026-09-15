# VeriNova Connect — Next.js build

A full-stack rebuild of VeriNova Connect for your `apps/web` Next.js app inside the Turborepo. Covers every v1.0 goal from the blueprint:

- **Accounts** — email/password auth, JWT session in an httpOnly cookie
- **Profiles** — bio, profession, skills, location, user type
- **Interests** — shared tag set, filterable
- **Communities** — create, browse, join
- **Member discovery** — filterable directory
- **Search** — members and communities by keyword
- **Notifications** — in-app (welcome message, new community member alerts)

## Stack

- **Next.js 14 App Router + TypeScript** — pages and API routes in one app, no separate server
- **Prisma + SQLite** for local dev (zero setup — swap the `datasource` in `prisma/schema.prisma` to `postgresql` when you're ready to deploy)
- **jose** for JWT (Edge-runtime compatible, works in `middleware.ts`)
- **bcryptjs** for password hashing
- Plain CSS (`app/globals.css`) — no Tailwind assumed, since I couldn't confirm what's in your scaffold. If you do have Tailwind installed, this still works fine alongside it; nothing here conflicts.

## How this maps into your monorepo

Your structure was:
```
apps/web/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx
│   └── ...
├── package.json
└── ...
```

Everything in this zip is meant to **replace the contents of `apps/web`** (merge, don't nest it inside). Steps:

1. Back up or remove the placeholder `app/page.tsx`, `app/layout.tsx`, `app/globals.css` that came with the scaffold.
2. Copy everything from this zip's `app/`, `components/`, `lib/`, `prisma/`, `middleware.ts` into `apps/web/`.
3. Merge `package.json` — add the `dependencies`/`devDependencies`/`prisma` block from this zip's `package.json` into your existing `apps/web/package.json` (keep your existing `name` field and any monorepo-specific fields/scripts).
4. From the repo root (or `apps/web` if it manages its own deps):
   ```bash
   npm install
   ```
5. Set up your environment file:
   ```bash
   cp apps/web/.env.example apps/web/.env
   # edit .env: set JWT_SECRET to a long random string
   ```
6. Create the database and seed default interests:
   ```bash
   cd apps/web
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
7. Run dev:
   ```bash
   npm run dev
   ```
   (or `turbo dev` from the repo root, if that's how you normally start things)

## Project structure (inside apps/web)

```
app/
├── page.tsx                 # redirects to /login or /dashboard/discover
├── login/page.tsx           # login + register (tabbed)
├── dashboard/
│   ├── layout.tsx           # topbar + nav wrapper
│   ├── discover/page.tsx    # member search/discovery
│   ├── communities/page.tsx # browse/create/join communities
│   └── profile/page.tsx     # edit profile + interests
└── api/
    ├── auth/{register,login,logout,me}/route.ts
    ├── profiles/{[id],me,me/interests}/route.ts
    ├── interests/route.ts
    ├── communities/{route.ts,[id]/{join,leave,members}/route.ts}
    ├── search/{members,communities}/route.ts
    └── notifications/{route.ts,[id]/read,read-all}/route.ts
components/
├── Topbar.tsx        # nav + notifications panel
└── Toast.tsx          # toast provider for success/error messages
lib/
├── db.ts              # Prisma client singleton
├── auth.ts             # JWT + password hashing (Edge-compatible)
├── api-utils.ts        # shared error response helper
└── client.ts            # client-side fetch helper
middleware.ts            # protects /dashboard, redirects logged-in users off /login
prisma/
├── schema.prisma
└── seed.js
```

## Auth model

Sessions are a JWT stored in an **httpOnly cookie** (`vn_session`), set by the `/api/auth/login` and `/api/auth/register` routes. `middleware.ts` checks this cookie on every request to `/dashboard/*` and redirects to `/login` if missing/invalid — so there's no client-side "am I logged in" flicker.

## What's next (per the blueprint's roadmap)

Same as noted before — messaging, groups, projects, events, marketplace, jobs, mobile apps, and AI-powered recommendations are the blueprint's future roadmap, not built here. The Prisma schema is structured so each can be added as a new model + routes without reworking what exists:
- **Messaging** → a `Message` model keyed on sender/recipient
- **Events/Projects** → new models relating to `Community`, same pattern as `CommunityMember`
- **Marketplace/Jobs** → new models with their own `/api/search/*` routes, reusing the existing search pattern
- **AI recommendations** → a scoring pass over `UserInterest` + `location` + `userType`

## Note on dependencies

This environment has no network access, so `npm install` and the Prisma migration couldn't be run or verified here — every file has been checked for syntax correctness, but you'll want to run `npm run dev` and click through once you install. If anything doesn't compile cleanly (e.g. a dependency version mismatch with what's already in your monorepo's `package.json`), tell me the error and I'll fix it directly.

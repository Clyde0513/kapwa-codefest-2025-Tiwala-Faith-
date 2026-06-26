# Tiwala Kapwa - Church Community Platform

A church community management platform for the Filipino Catholic community in Boston.

## Current Backend Status

This project has been migrated to Supabase for backend services.

- Auth: Supabase Auth
- Database access layer: Supabase-backed server queries
- Media storage: Supabase Storage
- Image delivery/optimization: Supabase Storage public URLs with transform params
- Upload pipeline: server-side upload proxy via API route
- Rate limiting: Supabase-backed counters (with safe in-memory fallback)

## Not Used Anymore

The active runtime backend no longer uses:

- Prisma
- Cloudinary
- Sanity

Legacy folders and scripts may still exist from the hackathon phase, but they are not part of the active production backend path.

## Tech Stack

### Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS

### Backend

- Supabase (Auth + Database + Storage)
- Next.js App Router API routes
- Zod for validation

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

# Optional
NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET=media
SUPABASE_MEDIA_BUCKET=media
ADMIN_EMAIL_ALLOWLIST=admin@yourchurch.com,pastor@yourchurch.com
```

### 3. Run development server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
npm run start
```

## API Overview

- Auth
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/session`

- Posts
  - `GET /api/posts`
  - `POST /api/posts`
  - `GET /api/posts/[id]`
  - `PUT /api/posts/[id]`
  - `PATCH /api/posts/[id]`
  - `DELETE /api/posts/[id]`

- Events
  - `GET /api/events`
  - `POST /api/events`
  - `GET /api/events/[id]`
  - `PATCH /api/events/[id]`
  - `DELETE /api/events/[id]`

- Media
  - `POST /api/uploads/sign` (Supabase upload proxy)
  - `GET/POST /api/photos`
  - `GET/PATCH/DELETE /api/photos/[id]`
  - `GET/POST /api/videos`
  - `GET/PATCH/DELETE /api/videos/[id]`
  - `GET/POST /api/media`
  - `GET/PATCH/DELETE /api/media/[id]`

- Engagement
  - `GET/POST /api/comments`
  - `GET/POST /api/likes`

- Settings / Health
  - `GET/POST /api/settings`
  - `GET /api/health/db`

## Notes

- Admin route protection is enforced in middleware using JWT payload checks.
- Full session validation is performed in server auth utilities against Supabase Auth.
- Media endpoint naming keeps compatibility with existing frontend components.

## License

MIT. See `LICENSE`.

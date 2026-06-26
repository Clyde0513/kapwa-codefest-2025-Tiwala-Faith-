# Tiwala Kapwa - Church Community Platform

A production-focused church community platform for the Filipino Catholic community in Boston. The app supports public content pages, blog posts, events, galleries, comments, likes, and an admin dashboard for managing the site.

## Production Status

The active production backend is Supabase-first.

- Supabase Auth handles admin login.
- Supabase Database stores posts, events, comments, likes, settings, media metadata, and rate-limit counters.
- Supabase Storage stores uploaded images and videos.
- Next.js API routes handle server-side data access, uploads, auth sessions, and media proxying.
- Admin dashboard controls editable site content, posts, events, photos, videos, and website settings.

## Not Used In Runtime

The active runtime backend no longer depends on:

- Prisma
- Cloudinary
- Sanity

Some legacy dependencies, folders, and scripts may still exist from the hackathon phase. They should be treated as cleanup candidates unless a current route imports them.

## Tech Stack

### Frontend

- Next.js 15.5.19
- React 19
- TypeScript
- Tailwind CSS
- FullCalendar for calendar UI

### Backend

- Supabase Auth
- Supabase Database
- Supabase Storage
- Next.js App Router API routes
- Zod validation
- Server-side media proxy through `/api/media/proxy`

## Main Features

### Public Site

- Home page with hero, latest posts, events, calendar, mass schedule, leadership, galleries, resources, and footer
- Blog listing and post detail pages
- Archive page
- Calendar page
- Mission page
- Photo and video galleries

### Admin Dashboard

- Admin login through Supabase Auth
- Blog post create/edit/delete/archive
- Event create/edit/delete
- Event card image upload
- Photo upload and management
- Video upload and management
- Website settings editor
- Mission page editor
- Mission logo image upload
- Mass schedule editor
- Leadership editor
- Events section copy editor
- Resources section editor

## Repository Structure

```text
app/
  admin/                  Admin dashboard pages
  api/                    Next.js API routes
  archive/                Public archive page
  blog/                   Public blog pages
  calendar/               Calendar page
  components/             Public site components
  mission/                Mission page
components/               Shared client components
lib/                      Supabase, auth, database, media helpers
docs/                     Supabase SQL and setup docs
public/images/            Static fallback images
```

Key files:

- `lib/supabase.ts` creates Supabase admin and anon clients.
- `lib/supabase-db.ts` provides the Supabase-backed data access layer.
- `lib/supabase-media.ts` handles upload results, media URL normalization, and proxy URL generation.
- `lib/auth.ts` handles Supabase Auth login/session logic.
- `lib/auth-middleware.ts` performs lightweight admin JWT checks in middleware.
- `app/api/media/proxy/route.ts` proxies Supabase Storage media through the app domain.
- `app/api/uploads/sign/route.ts` uploads files to Supabase Storage from trusted server code.

## Supabase Setup

### 1. Create Supabase Project

Create a project in Supabase and copy the project URL, anon/publishable key, and service role key.

### 2. Run SQL Schema

Run this file in the Supabase SQL Editor:

```text
docs/SUPABASE_SCHEMA_POLICIES.sql
```

This creates:

- `admin_users`
- `User`
- `Post`
- `Comment`
- `Like`
- `Event`
- `Photo`
- `Video`
- `Settings`
- `RateLimit`
- media storage bucket setup
- RLS policies

If your database was created before event image support was added, also run:

```text
docs/SUPABASE_IMAGE_UPLOAD_MIGRATION.sql
```

### 3. Create Storage Bucket

The SQL creates a public `media` bucket if permissions allow it.

Recommended bucket strategy is documented here:

```text
docs/SUPABASE_BUCKET_STRATEGY.md
```

Current bucket expectation:

- Bucket name: `media`
- Public read: yes
- Upload/write: server-side only through API routes
- Max file size: 100 MB
- Folder pattern: `images/YYYY-MM-DD/...` and `videos/YYYY-MM-DD/...`

### 4. Create Admin Users

Create admin users in Supabase Dashboard under Authentication, then add matching rows in `admin_users`.

Example admin allowlist env:

```env
ADMIN_EMAIL_ALLOWLIST=admin@example.com,pastor@example.com
```

Admin passwords are managed by Supabase Auth, not by `.env` and not by this database schema.

## Environment Variables

Create `.env.local` for local development.

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_OR_PUBLISHABLE_KEY
SUPABASE_SERVICE_KEY=YOUR_SERVICE_ROLE_KEY
ADMIN_EMAIL_ALLOWLIST=admin@example.com,pastor@example.com

NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET=media
SUPABASE_MEDIA_BUCKET=media
```

Supported aliases:

- `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, or `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SERVICE_KEY`

Important security notes:

- Never expose the service role key in client code.
- Only `NEXT_PUBLIC_*` values are safe for browser exposure.
- Keep `.env.local` out of git.

## Install And Run

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Start production server locally:

```bash
npm run start
```

## Media Upload And Proxy Flow

Uploads use a server-side Supabase Storage proxy flow.

1. Admin selects an image or video in the dashboard.
2. Browser sends the file to `/api/uploads/sign`.
3. Server validates file type, size, and rate limit.
4. Server uploads to Supabase Storage with service role access.
5. Server returns a first-party proxy URL like `/api/media/proxy?path=...`.
6. Database stores the media metadata and proxy URL.
7. Public pages render media through the app domain, not directly through the Supabase object URL.

Proxy route:

```text
GET /api/media/proxy?path=images/YYYY-MM-DD/file.png
```

Why proxy media:

- Keeps public pages using first-party app URLs.
- Avoids exposing direct Supabase Storage links in rendered UI.
- Centralizes caching headers.
- Leaves room for future authorization, transforms, logging, or signed delivery.

Existing direct Supabase Storage URLs are normalized at render time by `normalizeMediaUrl()`.

## Admin Workflows

### Login

1. Create the user in Supabase Auth.
2. Add the email to `ADMIN_EMAIL_ALLOWLIST`.
3. Add the user to the `admin_users` table.
4. Visit `/admin/login`.

### Manage Blog Posts

Admin route:

```text
/admin/posts
```

Supported actions:

- Create post
- Edit post
- Delete post
- Archive/unarchive post

Public blog pages are dynamic and revalidated after mutations so deleted posts do not remain visible in public lists.

### Manage Events

Admin route:

```text
/admin/events
```

Supported actions:

- Create event
- Edit event
- Delete event
- Upload event card image

Public event cards read from the admin-managed events API. Static sample events are only a fallback when no events exist.

### Manage Media

Admin routes:

```text
/admin/photos
/admin/videos
```

Supported actions:

- Upload media
- Edit captions
- Delete media metadata records

### Manage Website Settings

Admin route:

```text
/admin/settings
```

Editable content includes:

- Site name
- Tagline
- Pastor/priest name
- Homepage welcome content
- Contact information
- Mission page text
- Mission logo image
- Logo explanation text
- Mass schedule section
- Leadership section
- Events section copy
- Resources section links

## API Overview

### Auth

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/session
```

### Posts

```text
GET    /api/posts
POST   /api/posts
GET    /api/posts/[id]
PUT    /api/posts/[id]
PATCH  /api/posts/[id]
DELETE /api/posts/[id]
GET    /api/posts/photos
```

### Events

```text
GET    /api/events
POST   /api/events
GET    /api/events/[id]
PATCH  /api/events/[id]
DELETE /api/events/[id]
```

### Media

```text
POST   /api/uploads/sign
GET    /api/media/proxy?path=...
GET    /api/photos
POST   /api/photos
GET    /api/photos/[id]
PATCH  /api/photos/[id]
DELETE /api/photos/[id]
GET    /api/videos
POST   /api/videos
GET    /api/videos/[id]
PATCH  /api/videos/[id]
DELETE /api/videos/[id]
GET    /api/media
POST   /api/media
GET    /api/media/[id]
PATCH  /api/media/[id]
DELETE /api/media/[id]
```

### Engagement

```text
GET  /api/comments
POST /api/comments
GET  /api/likes
POST /api/likes
```

### Settings And Health

```text
GET  /api/settings
POST /api/settings
GET  /api/health/db
```

## Caching And Freshness

Dynamic pages:

- `/blog`
- `/archive`
- `/blog/[id]`
- `/mission`
- `/admin`

Mutation routes revalidate relevant pages after changes.

Examples:

- Creating, updating, deleting, or archiving a post revalidates `/`, `/blog`, `/archive`, and the affected detail page.
- Saving settings revalidates `/`, `/mission`, and `/calendar`.
- Creating, updating, or deleting events revalidates `/` and `/calendar`.

## Deployment

Recommended platform: Vercel.

Deployment checklist:

1. Add all Supabase env vars to Vercel project settings.
2. Run Supabase SQL schema before first deploy.
3. Run the image upload migration if needed.
4. Create Supabase Auth users for admins.
5. Add matching rows to `admin_users`.
6. Deploy.
7. Test admin login, settings save, post CRUD, event CRUD, photo upload, video upload, and media proxy URLs.

## Supabase SQL Files

- `docs/SUPABASE_SCHEMA_POLICIES.sql` creates the main schema, bucket, and policies.
- `docs/SUPABASE_IMAGE_UPLOAD_MIGRATION.sql` adds `Event.imageUrl` to existing DBs.
- `docs/SUPABASE_BUCKET_STRATEGY.md` explains media bucket strategy.

## Known Cleanup Candidates

The repo still includes some legacy dependencies and scripts from the previous stack. The runtime code has been migrated, but package cleanup can be done later to reduce install size and vulnerability noise.

Potential cleanup areas:

- Legacy Prisma dependency and scripts
- Legacy Cloudinary dependency
- Legacy Sanity dependency and studio code
- Old migration/demo scripts

Do cleanup carefully and run `npm run build` after each removal batch.

## Validation Commands

Run these before deploy:

```bash
npm run build
```

Optional checks:

```bash
npm ls next eslint-config-next --depth=0
npm audit
```

## Troubleshooting

### Missing Supabase anon key

Set one of:

```env
SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Restart the dev server after changing env vars.

### Missing service role key

Set one of:

```env
SUPABASE_SERVICE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Media upload succeeds but image URL shows Supabase directly

New uploads should save `/api/media/proxy?path=...` URLs. Older rows may still contain direct Supabase URLs, but public render paths normalize them through the proxy.

### Blog list shows deleted post

The public blog page is dynamic and mutation routes revalidate paths. If this happens in production, redeploy and confirm the current code is deployed.

### Storage policy SQL error

If Supabase reports ownership errors for `storage.objects`, run the SQL from Supabase Dashboard SQL Editor as project owner. The schema file now skips storage policy DDL when the current role is not the table owner.

## License

MIT. See `LICENSE`.

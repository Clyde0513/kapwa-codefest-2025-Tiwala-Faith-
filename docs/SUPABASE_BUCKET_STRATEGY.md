# Supabase Bucket Strategy

This guide is aligned with the current backend implementation in this repo.

## Bucket Plan

Use one primary bucket:

- Bucket name: media
- Public: true
- Max file size: 100 MB
- Allowed MIME types:
  - image/jpeg
  - image/png
  - image/webp
  - image/gif
  - video/mp4
  - video/webm
  - video/quicktime

Why one bucket:

- Simpler management for a small/medium church content platform.
- Easy URL generation and gallery rendering.
- Works with the current upload proxy and media table structure.

## Folder Convention

Use deterministic folders so moderation and cleanup are easy:

- images/YYYY-MM-DD/filename
- videos/YYYY-MM-DD/filename

Your current uploader already creates resource-specific folder prefixes and UUID-based names.

## Access Strategy

Current production-friendly setup:

- Public read from media bucket for website delivery.
- Admin upload/update/delete only.
- Uploads run through server API route using service-role key.

Notes:

- Service role bypasses RLS, which is expected for trusted server routes.
- Keep service-role key server-only and never expose it to client code.

## Metadata Strategy

Store file metadata in DB and binary in Storage:

- Photo table stores image metadata and post linkage.
- Video table stores video metadata and post linkage.
- publicId in DB matches path in bucket.

This separation is ideal for search/filter/moderation while keeping Storage optimized for files.

## Lifecycle + Hygiene

Recommended periodic jobs:

1. Orphan cleanup:

- Find storage objects that do not exist in Photo or Video tables.
- Delete them in batches.

1. Soft moderation flow:

- Add optional isHidden or deletedAt fields to Photo/Video.
- Hide from UI before physical delete if needed.

1. Cache policy:

- Set cache-control at upload time (already done in app).
- For changed media, prefer new object path (immutable-style) rather than overwrite.

## Optional Future Split

If traffic grows, split into:

1. media-public

- Public optimized assets for website rendering.

1. media-private

- Originals, staff-only files, exports, moderation queue.

For now, one bucket is sufficient and operationally clean.

## Rollout Checklist

1. Run docs/SUPABASE_SCHEMA_POLICIES.sql in Supabase SQL Editor.

2. Create first admin in public.admin_users.

3. Set required env vars in local and hosting:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET=media
- SUPABASE_MEDIA_BUCKET=media

1. Test flows:

- admin login
- create post/event
- upload photo/video
- read gallery/blog/comments/likes

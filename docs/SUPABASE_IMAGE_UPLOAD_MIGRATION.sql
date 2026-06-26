-- One-time migration for admin-controlled images added after initial Supabase setup.
-- Run this in Supabase SQL Editor if your Event table was created before imageUrl existed.

alter table public."Event"
add column if not exists "imageUrl" text;

-- Mission logo image is stored inside Settings.value JSONB, so it does not require a schema change.

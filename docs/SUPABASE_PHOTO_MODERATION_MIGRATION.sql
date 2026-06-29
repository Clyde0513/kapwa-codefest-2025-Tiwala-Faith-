-- One-time migration for community photo moderation.
-- Run this in Supabase SQL Editor if your Photo table was created before moderation existed.

alter table public."Photo"
add column if not exists "moderationStatus" text not null default 'approved';

alter table public."Photo"
add column if not exists "moderatedAt" timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'photo_moderation_status_check'
  ) then
    alter table public."Photo"
    add constraint photo_moderation_status_check
    check ("moderationStatus" in ('pending', 'approved', 'rejected'));
  end if;
end $$;

create index if not exists photo_moderation_status_idx
on public."Photo"("moderationStatus");

-- Existing photos are treated as approved so the current gallery does not disappear.
update public."Photo"
set "moderationStatus" = 'approved'
where "moderationStatus" is null;

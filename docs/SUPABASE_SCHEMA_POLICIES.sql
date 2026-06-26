-- Supabase schema + RLS policies for current app backend
-- IMPORTANT:
-- 1) Run this in Supabase SQL Editor as project owner.
-- 2) This schema intentionally uses quoted PascalCase table names and camelCase columns
--    because the current backend queries these exact identifiers.

create extension if not exists pgcrypto;
create extension if not exists citext;

-- -----------------------------------------------------------------------------
-- Admin authorization mapping (do not store passwords here; use Supabase Auth)
-- -----------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email citext not null unique,
  role text not null default 'admin' check (role in ('owner', 'admin', 'editor')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users a
    where a.user_id = auth.uid()
      and a.is_active = true
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Shared trigger for updatedAt columns
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Core tables used by current code
-- -----------------------------------------------------------------------------
create table if not exists public."User" (
  id uuid primary key default gen_random_uuid(),
  email citext unique,
  name text,
  image text,
  "createdAt" timestamptz not null default now()
);

create table if not exists public."Post" (
  id uuid primary key default gen_random_uuid(),
  "authorId" uuid references public."User"(id) on delete set null,
  title text not null check (char_length(title) <= 200),
  content text not null check (char_length(content) <= 10000),
  published boolean not null default true,
  archived boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists post_author_idx on public."Post"("authorId");
create index if not exists post_created_idx on public."Post"("createdAt" desc);
create index if not exists post_archived_idx on public."Post"(archived);
create index if not exists post_published_idx on public."Post"(published);

drop trigger if exists trg_post_updated_at on public."Post";
create trigger trg_post_updated_at
before update on public."Post"
for each row
execute function public.set_updated_at();

create table if not exists public."Comment" (
  id uuid primary key default gen_random_uuid(),
  "postId" uuid not null references public."Post"(id) on delete cascade,
  "authorId" uuid references public."User"(id) on delete set null,
  content text not null check (char_length(content) <= 5000),
  "parentId" uuid references public."Comment"(id) on delete cascade,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists comment_post_created_idx on public."Comment"("postId", "createdAt" desc);
create index if not exists comment_parent_idx on public."Comment"("parentId");
create index if not exists comment_author_idx on public."Comment"("authorId");

drop trigger if exists trg_comment_updated_at on public."Comment";
create trigger trg_comment_updated_at
before update on public."Comment"
for each row
execute function public.set_updated_at();

create table if not exists public."Like" (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null references public."User"(id) on delete cascade,
  "postId" uuid references public."Post"(id) on delete cascade,
  "commentId" uuid references public."Comment"(id) on delete cascade,
  "createdAt" timestamptz not null default now(),
  constraint like_target_check check (
    (("postId" is not null)::int + ("commentId" is not null)::int) = 1
  )
);

create unique index if not exists like_user_post_unique
  on public."Like"("userId", "postId")
  where "postId" is not null;

create unique index if not exists like_user_comment_unique
  on public."Like"("userId", "commentId")
  where "commentId" is not null;

create index if not exists like_post_idx on public."Like"("postId");
create index if not exists like_comment_idx on public."Like"("commentId");
create index if not exists like_created_idx on public."Like"("createdAt" desc);

create table if not exists public."Event" (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  "startsAt" timestamptz not null,
  "endsAt" timestamptz not null,
  "allDay" boolean not null default false,
  location text,
  "imageUrl" text,
  url text,
  "createdById" uuid references public."User"(id) on delete set null,
  "gcalEventId" text,
  "gcalCalendarId" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint event_time_check check ("endsAt" >= "startsAt")
);

create index if not exists event_starts_idx on public."Event"("startsAt");
create index if not exists event_created_by_idx on public."Event"("createdById");

drop trigger if exists trg_event_updated_at on public."Event";
create trigger trg_event_updated_at
before update on public."Event"
for each row
execute function public.set_updated_at();

create table if not exists public."Photo" (
  id uuid primary key default gen_random_uuid(),
  "postId" uuid references public."Post"(id) on delete cascade,
  "publicId" text not null unique,
  url text not null,
  width integer not null default 0,
  height integer not null default 0,
  format text not null,
  bytes bigint not null,
  caption text,
  "uploaderId" uuid references public."User"(id) on delete set null,
  "createdAt" timestamptz not null default now()
);

create index if not exists photo_post_idx on public."Photo"("postId");
create index if not exists photo_uploader_idx on public."Photo"("uploaderId");
create index if not exists photo_created_idx on public."Photo"("createdAt" desc);

create table if not exists public."Video" (
  id uuid primary key default gen_random_uuid(),
  "postId" uuid references public."Post"(id) on delete cascade,
  "publicId" text not null unique,
  url text not null,
  width integer not null default 0,
  height integer not null default 0,
  format text not null,
  bytes bigint not null,
  duration double precision,
  caption text,
  "uploaderId" uuid references public."User"(id) on delete set null,
  "createdAt" timestamptz not null default now()
);

create index if not exists video_post_idx on public."Video"("postId");
create index if not exists video_uploader_idx on public."Video"("uploaderId");
create index if not exists video_created_idx on public."Video"("createdAt" desc);

create table if not exists public."Settings" (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  description text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists settings_key_idx on public."Settings"(key);

drop trigger if exists trg_settings_updated_at on public."Settings";
create trigger trg_settings_updated_at
before update on public."Settings"
for each row
execute function public.set_updated_at();

-- Used by current rate-limit helper.
create table if not exists public."RateLimit" (
  id bigserial primary key,
  key text not null,
  action text not null,
  "windowStart" timestamptz not null,
  "resetTime" timestamptz not null,
  count integer not null default 0 check (count >= 0),
  "createdAt" timestamptz not null default now(),
  unique (key, action, "windowStart")
);

create index if not exists ratelimit_reset_idx on public."RateLimit"("resetTime");

-- -----------------------------------------------------------------------------
-- RLS enablement
-- -----------------------------------------------------------------------------
alter table public.admin_users enable row level security;
alter table public."User" enable row level security;
alter table public."Post" enable row level security;
alter table public."Comment" enable row level security;
alter table public."Like" enable row level security;
alter table public."Event" enable row level security;
alter table public."Photo" enable row level security;
alter table public."Video" enable row level security;
alter table public."Settings" enable row level security;
alter table public."RateLimit" enable row level security;

-- -----------------------------------------------------------------------------
-- admin_users policies
-- -----------------------------------------------------------------------------
drop policy if exists admin_users_select on public.admin_users;
create policy admin_users_select
on public.admin_users
for select
to authenticated
using (public.is_admin() or user_id = auth.uid());

drop policy if exists admin_users_insert on public.admin_users;
create policy admin_users_insert
on public.admin_users
for insert
to authenticated
with check (public.is_admin());

drop policy if exists admin_users_update on public.admin_users;
create policy admin_users_update
on public.admin_users
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists admin_users_delete on public.admin_users;
create policy admin_users_delete
on public.admin_users
for delete
to authenticated
using (public.is_admin());

-- -----------------------------------------------------------------------------
-- User policies
-- -----------------------------------------------------------------------------
drop policy if exists user_select on public."User";
create policy user_select
on public."User"
for select
to authenticated
using (public.is_admin() or id = auth.uid());

drop policy if exists user_insert on public."User";
create policy user_insert
on public."User"
for insert
to authenticated
with check (public.is_admin() or id = auth.uid());

drop policy if exists user_update on public."User";
create policy user_update
on public."User"
for update
to authenticated
using (public.is_admin() or id = auth.uid())
with check (public.is_admin() or id = auth.uid());

drop policy if exists user_delete on public."User";
create policy user_delete
on public."User"
for delete
to authenticated
using (public.is_admin());

-- -----------------------------------------------------------------------------
-- Post policies
-- -----------------------------------------------------------------------------
drop policy if exists post_select on public."Post";
create policy post_select
on public."Post"
for select
to public
using (published = true or public.is_admin());

drop policy if exists post_insert on public."Post";
create policy post_insert
on public."Post"
for insert
to authenticated
with check (public.is_admin());

drop policy if exists post_update on public."Post";
create policy post_update
on public."Post"
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists post_delete on public."Post";
create policy post_delete
on public."Post"
for delete
to authenticated
using (public.is_admin());

-- -----------------------------------------------------------------------------
-- Comment policies
-- -----------------------------------------------------------------------------
drop policy if exists comment_select on public."Comment";
create policy comment_select
on public."Comment"
for select
to public
using (true);

drop policy if exists comment_insert on public."Comment";
create policy comment_insert
on public."Comment"
for insert
to authenticated
with check (
  public.is_admin()
  or "authorId" = auth.uid()
);

drop policy if exists comment_update on public."Comment";
create policy comment_update
on public."Comment"
for update
to authenticated
using (
  public.is_admin()
  or "authorId" = auth.uid()
)
with check (
  public.is_admin()
  or "authorId" = auth.uid()
);

drop policy if exists comment_delete on public."Comment";
create policy comment_delete
on public."Comment"
for delete
to authenticated
using (
  public.is_admin()
  or "authorId" = auth.uid()
);

-- -----------------------------------------------------------------------------
-- Like policies
-- -----------------------------------------------------------------------------
drop policy if exists like_select on public."Like";
create policy like_select
on public."Like"
for select
to public
using (true);

drop policy if exists like_insert on public."Like";
create policy like_insert
on public."Like"
for insert
to authenticated
with check (
  public.is_admin()
  or "userId" = auth.uid()
);

drop policy if exists like_delete on public."Like";
create policy like_delete
on public."Like"
for delete
to authenticated
using (
  public.is_admin()
  or "userId" = auth.uid()
);

-- -----------------------------------------------------------------------------
-- Event policies
-- -----------------------------------------------------------------------------
drop policy if exists event_select on public."Event";
create policy event_select
on public."Event"
for select
to public
using (true);

drop policy if exists event_insert on public."Event";
create policy event_insert
on public."Event"
for insert
to authenticated
with check (public.is_admin());

drop policy if exists event_update on public."Event";
create policy event_update
on public."Event"
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists event_delete on public."Event";
create policy event_delete
on public."Event"
for delete
to authenticated
using (public.is_admin());

-- -----------------------------------------------------------------------------
-- Photo policies
-- -----------------------------------------------------------------------------
drop policy if exists photo_select on public."Photo";
create policy photo_select
on public."Photo"
for select
to public
using (true);

drop policy if exists photo_insert on public."Photo";
create policy photo_insert
on public."Photo"
for insert
to authenticated
with check (public.is_admin());

drop policy if exists photo_update on public."Photo";
create policy photo_update
on public."Photo"
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists photo_delete on public."Photo";
create policy photo_delete
on public."Photo"
for delete
to authenticated
using (public.is_admin());

-- -----------------------------------------------------------------------------
-- Video policies
-- -----------------------------------------------------------------------------
drop policy if exists video_select on public."Video";
create policy video_select
on public."Video"
for select
to public
using (true);

drop policy if exists video_insert on public."Video";
create policy video_insert
on public."Video"
for insert
to authenticated
with check (public.is_admin());

drop policy if exists video_update on public."Video";
create policy video_update
on public."Video"
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists video_delete on public."Video";
create policy video_delete
on public."Video"
for delete
to authenticated
using (public.is_admin());

-- -----------------------------------------------------------------------------
-- Settings policies
-- -----------------------------------------------------------------------------
drop policy if exists settings_select on public."Settings";
create policy settings_select
on public."Settings"
for select
to public
using (true);

drop policy if exists settings_insert on public."Settings";
create policy settings_insert
on public."Settings"
for insert
to authenticated
with check (public.is_admin());

drop policy if exists settings_update on public."Settings";
create policy settings_update
on public."Settings"
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists settings_delete on public."Settings";
create policy settings_delete
on public."Settings"
for delete
to authenticated
using (public.is_admin());

-- -----------------------------------------------------------------------------
-- RateLimit policies
-- Intentionally no client policies. Service-role server access only.
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- Storage bucket + storage policies
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  104857600,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
on conflict (id)
do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- storage.objects is a Supabase-managed table and may be owned by another role.
-- If current role is not owner, skip policy DDL instead of failing the full script.
do $$
begin
  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'storage'
      and c.relname = 'objects'
      and pg_get_userbyid(c.relowner) = current_user
  ) then
    alter table storage.objects enable row level security;

    drop policy if exists media_public_read on storage.objects;
    create policy media_public_read
    on storage.objects
    for select
    to public
    using (bucket_id = 'media');

    drop policy if exists media_admin_insert on storage.objects;
    create policy media_admin_insert
    on storage.objects
    for insert
    to authenticated
    with check (bucket_id = 'media' and public.is_admin());

    drop policy if exists media_admin_update on storage.objects;
    create policy media_admin_update
    on storage.objects
    for update
    to authenticated
    using (bucket_id = 'media' and public.is_admin())
    with check (bucket_id = 'media' and public.is_admin());

    drop policy if exists media_admin_delete on storage.objects;
    create policy media_admin_delete
    on storage.objects
    for delete
    to authenticated
    using (bucket_id = 'media' and public.is_admin());
  else
    raise notice 'Skipping storage.objects policy setup: current role "%" is not table owner. Run in Supabase SQL editor as project owner (postgres).', current_user;
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- Optional: bootstrap first admin (run once, then remove/comment)
-- Replace placeholders before running.
-- -----------------------------------------------------------------------------
-- insert into public.admin_users (user_id, email, role)
-- values ('00000000-0000-0000-0000-000000000000', 'admin@example.com', 'owner')
-- on conflict (user_id) do update set email = excluded.email, role = excluded.role, is_active = true;

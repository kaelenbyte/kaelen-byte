-- Kaelen Byte community: initial schema
-- Creates enums, tables, constraints and indexes. RLS lives in a later migration.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'report_target_type') then
    create type public.report_target_type as enum ('post', 'comment', 'profile');
  end if;
  if not exists (select 1 from pg_type where typname = 'report_status') then
    create type public.report_status as enum ('pending', 'reviewed', 'dismissed', 'actioned');
  end if;
  if not exists (select 1 from pg_type where typname = 'notification_type') then
    create type public.notification_type as enum ('like', 'comment', 'follow', 'moderation');
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- profiles (public projection of auth.users; never stores secrets)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  display_name text not null,
  bio text not null default '',
  avatar_url text,
  header_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,30}$'),
  constraint profiles_display_name_len check (char_length(display_name) between 1 and 60),
  constraint profiles_bio_len check (char_length(bio) <= 280)
);

create unique index if not exists profiles_username_key on public.profiles (lower(username));

-- ---------------------------------------------------------------------------
-- posts
-- ---------------------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  content text not null,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_content_len check (char_length(content) between 1 and 280)
);

create index if not exists posts_feed_idx on public.posts (created_at desc, id desc);
create index if not exists posts_user_idx on public.posts (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- comments
-- ---------------------------------------------------------------------------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comments_content_len check (char_length(content) between 1 and 500)
);

create index if not exists comments_post_idx on public.comments (post_id, created_at asc);

-- ---------------------------------------------------------------------------
-- likes (one per user per post)
-- ---------------------------------------------------------------------------
create table if not exists public.likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists likes_user_idx on public.likes (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- follows (no self follow, no duplicates)
-- ---------------------------------------------------------------------------
create table if not exists public.follows (
  follower_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self check (follower_id <> following_id)
);

create index if not exists follows_following_idx on public.follows (following_id, created_at desc);

-- ---------------------------------------------------------------------------
-- reports
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  target_type public.report_target_type not null,
  target_id uuid not null,
  reason text not null,
  details text,
  status public.report_status not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete set null,
  constraint reports_reason_len check (char_length(reason) between 1 and 60),
  constraint reports_reason_allowed check (reason in ('spam', 'harassment', 'impersonation', 'harmful', 'other')),
  constraint reports_details_len check (details is null or char_length(details) <= 500)
);

create unique index if not exists reports_unique_pending_idx
  on public.reports (reporter_id, target_type, target_id)
  where status = 'pending';
create index if not exists reports_pending_idx on public.reports (status, created_at asc);

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  type public.notification_type not null,
  entity_type text,
  entity_id uuid,
  message text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_recipient_idx
  on public.notifications (recipient_id, created_at desc);
create index if not exists notifications_unread_idx
  on public.notifications (recipient_id)
  where read_at is null;

-- ---------------------------------------------------------------------------
-- saved_posts
-- ---------------------------------------------------------------------------
create table if not exists public.saved_posts (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

-- ---------------------------------------------------------------------------
-- user_blocks
-- ---------------------------------------------------------------------------
create table if not exists public.user_blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint user_blocks_no_self check (blocker_id <> blocked_id)
);

-- ---------------------------------------------------------------------------
-- moderation_actions (audit trail)
-- ---------------------------------------------------------------------------
create table if not exists public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  moderator_id uuid default auth.uid() references public.profiles (id) on delete set null,
  target_type public.report_target_type not null,
  target_id uuid not null,
  action text not null,
  reason text,
  created_at timestamptz not null default now(),
  constraint moderation_actions_action_len check (char_length(action) between 1 and 40)
);

-- ---------------------------------------------------------------------------
-- user_roles (privileged; never self-assignable through RLS)
-- ---------------------------------------------------------------------------
create table if not exists public.user_roles (
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null,
  granted_at timestamptz not null default now(),
  primary key (user_id, role),
  constraint user_roles_role_check check (role in ('moderator', 'admin'))
);

-- ---------------------------------------------------------------------------
-- posting_events (server-enforced rate limiting)
-- ---------------------------------------------------------------------------
create table if not exists public.posting_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null,
  created_at timestamptz not null default now()
);

create index if not exists posting_events_user_idx
  on public.posting_events (user_id, kind, created_at desc);

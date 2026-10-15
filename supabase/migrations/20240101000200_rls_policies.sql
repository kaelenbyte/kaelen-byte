-- Kaelen Byte community: Row Level Security.
-- Every exposed table gets RLS enabled. Ownership is derived from auth.uid()
-- and never from client-supplied identifiers.

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.follows enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;
alter table public.saved_posts enable row level security;
alter table public.user_blocks enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.user_roles enable row level security;
alter table public.posting_events enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
drop policy if exists profiles_select_public on public.profiles;
create policy profiles_select_public on public.profiles
  for select using (true);

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- posts
-- ---------------------------------------------------------------------------
drop policy if exists posts_select_public on public.posts;
create policy posts_select_public on public.posts
  for select using (true);

drop policy if exists posts_insert_own on public.posts;
create policy posts_insert_own on public.posts
  for insert with check (auth.uid() = user_id);

drop policy if exists posts_update_own_or_mod on public.posts;
create policy posts_update_own_or_mod on public.posts
  for update using (auth.uid() = user_id or public.is_moderator())
  with check (auth.uid() = user_id or public.is_moderator());

drop policy if exists posts_delete_own_or_mod on public.posts;
create policy posts_delete_own_or_mod on public.posts
  for delete using (auth.uid() = user_id or public.is_moderator());

-- ---------------------------------------------------------------------------
-- comments
-- ---------------------------------------------------------------------------
drop policy if exists comments_select_public on public.comments;
create policy comments_select_public on public.comments
  for select using (true);

drop policy if exists comments_insert_own on public.comments;
create policy comments_insert_own on public.comments
  for insert with check (auth.uid() = user_id);

drop policy if exists comments_update_own_or_mod on public.comments;
create policy comments_update_own_or_mod on public.comments
  for update using (auth.uid() = user_id or public.is_moderator())
  with check (auth.uid() = user_id or public.is_moderator());

drop policy if exists comments_delete_own_or_mod on public.comments;
create policy comments_delete_own_or_mod on public.comments
  for delete using (auth.uid() = user_id or public.is_moderator());

-- ---------------------------------------------------------------------------
-- likes
-- ---------------------------------------------------------------------------
drop policy if exists likes_select_public on public.likes;
create policy likes_select_public on public.likes
  for select using (true);

drop policy if exists likes_insert_own on public.likes;
create policy likes_insert_own on public.likes
  for insert with check (auth.uid() = user_id);

drop policy if exists likes_delete_own on public.likes;
create policy likes_delete_own on public.likes
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- follows
-- ---------------------------------------------------------------------------
drop policy if exists follows_select_public on public.follows;
create policy follows_select_public on public.follows
  for select using (true);

drop policy if exists follows_insert_own on public.follows;
create policy follows_insert_own on public.follows
  for insert with check (auth.uid() = follower_id);

drop policy if exists follows_delete_own on public.follows;
create policy follows_delete_own on public.follows
  for delete using (auth.uid() = follower_id);

-- ---------------------------------------------------------------------------
-- reports (private to reporter and moderators)
-- ---------------------------------------------------------------------------
drop policy if exists reports_insert_own on public.reports;
create policy reports_insert_own on public.reports
  for insert with check (auth.uid() = reporter_id);

drop policy if exists reports_select_own_or_mod on public.reports;
create policy reports_select_own_or_mod on public.reports
  for select using (auth.uid() = reporter_id or public.is_moderator());

drop policy if exists reports_update_mod on public.reports;
create policy reports_update_mod on public.reports
  for update using (public.is_moderator()) with check (public.is_moderator());

-- ---------------------------------------------------------------------------
-- notifications (recipient only)
-- ---------------------------------------------------------------------------
drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications
  for select using (auth.uid() = recipient_id);

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications
  for update using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);

drop policy if exists notifications_delete_own on public.notifications;
create policy notifications_delete_own on public.notifications
  for delete using (auth.uid() = recipient_id);

-- ---------------------------------------------------------------------------
-- saved_posts
-- ---------------------------------------------------------------------------
drop policy if exists saved_select_own on public.saved_posts;
create policy saved_select_own on public.saved_posts
  for select using (auth.uid() = user_id);

drop policy if exists saved_insert_own on public.saved_posts;
create policy saved_insert_own on public.saved_posts
  for insert with check (auth.uid() = user_id);

drop policy if exists saved_delete_own on public.saved_posts;
create policy saved_delete_own on public.saved_posts
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- user_blocks
-- ---------------------------------------------------------------------------
drop policy if exists blocks_select_own on public.user_blocks;
create policy blocks_select_own on public.user_blocks
  for select using (auth.uid() = blocker_id);

drop policy if exists blocks_insert_own on public.user_blocks;
create policy blocks_insert_own on public.user_blocks
  for insert with check (auth.uid() = blocker_id);

drop policy if exists blocks_delete_own on public.user_blocks;
create policy blocks_delete_own on public.user_blocks
  for delete using (auth.uid() = blocker_id);

-- ---------------------------------------------------------------------------
-- moderation_actions
-- ---------------------------------------------------------------------------
drop policy if exists moderation_actions_select_mod on public.moderation_actions;
create policy moderation_actions_select_mod on public.moderation_actions
  for select using (public.is_moderator());

drop policy if exists moderation_actions_insert_mod on public.moderation_actions;
create policy moderation_actions_insert_mod on public.moderation_actions
  for insert with check (public.is_moderator() and auth.uid() = moderator_id);

-- ---------------------------------------------------------------------------
-- user_roles: readable by the owner or moderators, writable only by trusted
-- server-side code (service role). No insert/update/delete policies exist, so
-- authenticated clients can never grant themselves a role.
-- ---------------------------------------------------------------------------
drop policy if exists user_roles_select_self_or_mod on public.user_roles;
create policy user_roles_select_self_or_mod on public.user_roles
  for select using (auth.uid() = user_id or public.is_moderator());

-- ---------------------------------------------------------------------------
-- posting_events: no policies at all. Row Level Security denies every client
-- operation; only SECURITY DEFINER functions and the service role may touch it.
-- ---------------------------------------------------------------------------
revoke all on public.posting_events from anon, authenticated;
revoke all on public.user_roles from anon;
grant select on public.user_roles to authenticated;

-- Views respect the caller's row level security through security_invoker.
grant select on public.post_details to anon, authenticated;
grant select on public.profile_stats to anon, authenticated;

-- Explicit table grants complement RLS. RLS decides which rows/actions are
-- allowed; these grants only make the intended SQL operations available.
grant select on public.profiles, public.posts, public.comments, public.likes, public.follows to anon, authenticated;
grant insert, update, delete on public.profiles, public.posts, public.comments to authenticated;
grant insert, delete on public.likes, public.follows to authenticated;
grant select, insert, update on public.reports to authenticated;
grant select, update, delete on public.notifications to authenticated;
grant select, insert, delete on public.saved_posts, public.user_blocks to authenticated;
grant select, insert on public.moderation_actions to authenticated;

-- Role assignment and rate-limit records are server-managed only.
revoke insert, update, delete on public.user_roles from anon, authenticated;
revoke all on public.posting_events from anon, authenticated;

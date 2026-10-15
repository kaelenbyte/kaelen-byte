-- Kaelen Byte community: functions, triggers and aggregate views.

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

drop trigger if exists comments_set_updated_at on public.comments;
create trigger comments_set_updated_at
  before update on public.comments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Role helper. SECURITY DEFINER so policies can consult user_roles without
-- granting clients read access to the whole table.
-- ---------------------------------------------------------------------------
create or replace function public.is_moderator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('moderator', 'admin')
  );
$$;

revoke all on function public.is_moderator() from public;
grant execute on function public.is_moderator() to authenticated, anon;

-- ---------------------------------------------------------------------------
-- Server-side rate limiting. Clients cannot raise these limits because the
-- function runs as the table owner and the counters live in posting_events.
-- ---------------------------------------------------------------------------
create or replace function public.register_rate_limit_event(
  p_kind text,
  p_max integer,
  p_window interval
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  -- Serialize concurrent writes by the same account and event kind so that
  -- parallel requests cannot race past the count check.
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text || ':' || p_kind, 0));

  select count(*) into v_count
  from public.posting_events
  where user_id = auth.uid()
    and kind = p_kind
    and created_at > now() - p_window;

  if v_count >= p_max then
    raise exception 'Rate limit exceeded for %. Please slow down and try again later.', p_kind
      using errcode = 'check_violation';
  end if;

  insert into public.posting_events (user_id, kind) values (auth.uid(), p_kind);
end;
$$;

revoke all on function public.register_rate_limit_event(text, integer, interval) from public;

create or replace function public.enforce_post_rate_limit()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.register_rate_limit_event('post', 10, interval '10 minutes');
  return true;
end;
$$;

create or replace function public.tg_posts_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.register_rate_limit_event('post', 10, interval '10 minutes');
  return new;
end;
$$;

create or replace function public.tg_comments_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.register_rate_limit_event('comment', 30, interval '10 minutes');
  return new;
end;
$$;

create or replace function public.tg_reports_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.register_rate_limit_event('report', 10, interval '1 hour');
  return new;
end;
$$;

drop trigger if exists posts_rate_limit on public.posts;
create trigger posts_rate_limit
  before insert on public.posts
  for each row execute function public.tg_posts_rate_limit();

drop trigger if exists comments_rate_limit on public.comments;
create trigger comments_rate_limit
  before insert on public.comments
  for each row execute function public.tg_comments_rate_limit();

drop trigger if exists reports_rate_limit on public.reports;
create trigger reports_rate_limit
  before insert on public.reports
  for each row execute function public.tg_reports_rate_limit();

create or replace function public.validate_report_target()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.target_type = 'post' and not exists (select 1 from public.posts where id = new.target_id) then
    raise exception 'Report target does not exist' using errcode = '23503';
  elsif new.target_type = 'comment' and not exists (select 1 from public.comments where id = new.target_id) then
    raise exception 'Report target does not exist' using errcode = '23503';
  elsif new.target_type = 'profile' and not exists (select 1 from public.profiles where id = new.target_id) then
    raise exception 'Report target does not exist' using errcode = '23503';
  end if;
  return new;
end;
$$;

drop trigger if exists reports_validate_target on public.reports;
create trigger reports_validate_target
  before insert on public.reports
  for each row execute function public.validate_report_target();

-- ---------------------------------------------------------------------------
-- Profile provisioning on registration. Fails the whole signup if the
-- username is already taken (database-enforced uniqueness).
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text;
  v_display text;
begin
  v_username := lower(coalesce(new.raw_user_meta_data ->> 'username', ''));
  v_username := regexp_replace(v_username, '[^a-z0-9_]', '', 'g');
  if char_length(v_username) < 3 then
    v_username := 'user_' || substr(replace(new.id::text, '-', ''), 1, 10);
  end if;
  v_username := left(v_username, 30);

  v_display := nullif(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), '');
  if v_display is null then
    v_display := v_username;
  end if;

  insert into public.profiles (id, username, display_name)
  values (new.id, v_username, left(v_display, 60));

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Notification fan-out. SECURITY DEFINER so recipients get rows their own
-- RLS would otherwise forbid inserting.
-- ---------------------------------------------------------------------------
create or replace function public.tg_like_notify()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
  v_actor text;
begin
  select user_id into v_owner from public.posts where id = new.post_id;
  if v_owner is null or v_owner = new.user_id then
    return new;
  end if;
  select display_name into v_actor from public.profiles where id = new.user_id;
  insert into public.notifications (recipient_id, actor_id, type, entity_type, entity_id, message)
  values (v_owner, new.user_id, 'like', 'post', new.post_id, coalesce(v_actor, 'Someone') || ' liked your post');
  return new;
end;
$$;

drop trigger if exists likes_notify on public.likes;
create trigger likes_notify
  after insert on public.likes
  for each row execute function public.tg_like_notify();

create or replace function public.tg_unlike_cleanup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.notifications
  where type = 'like'
    and actor_id = old.user_id
    and entity_id = old.post_id;
  return old;
end;
$$;

drop trigger if exists likes_unlike_cleanup on public.likes;
create trigger likes_unlike_cleanup
  after delete on public.likes
  for each row execute function public.tg_unlike_cleanup();

create or replace function public.tg_comment_notify()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
  v_actor text;
begin
  select user_id into v_owner from public.posts where id = new.post_id;
  if v_owner is null or v_owner = new.user_id then
    return new;
  end if;
  select display_name into v_actor from public.profiles where id = new.user_id;
  insert into public.notifications (recipient_id, actor_id, type, entity_type, entity_id, message)
  values (v_owner, new.user_id, 'comment', 'post', new.post_id, coalesce(v_actor, 'Someone') || ' commented on your post');
  return new;
end;
$$;

drop trigger if exists comments_notify on public.comments;
create trigger comments_notify
  after insert on public.comments
  for each row execute function public.tg_comment_notify();

create or replace function public.tg_follow_notify()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor text;
begin
  select display_name into v_actor from public.profiles where id = new.follower_id;
  insert into public.notifications (recipient_id, actor_id, type, entity_type, entity_id, message)
  values (new.following_id, new.follower_id, 'follow', 'profile', new.follower_id,
          coalesce(v_actor, 'Someone') || ' started following you');
  return new;
end;
$$;

drop trigger if exists follows_notify on public.follows;
create trigger follows_notify
  after insert on public.follows
  for each row execute function public.tg_follow_notify();

create or replace function public.tg_unfollow_cleanup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.notifications
  where type = 'follow'
    and actor_id = old.follower_id
    and recipient_id = old.following_id;
  return old;
end;
$$;

drop trigger if exists follows_unfollow_cleanup on public.follows;
create trigger follows_unfollow_cleanup
  after delete on public.follows
  for each row execute function public.tg_unfollow_cleanup();

-- ---------------------------------------------------------------------------
-- Aggregate views (security_invoker keeps RLS of the underlying tables active)
-- ---------------------------------------------------------------------------
create or replace view public.post_details
with (security_invoker = on)
as
select
  p.id,
  p.user_id,
  p.content,
  p.image_url,
  p.created_at,
  p.updated_at,
  (select count(*) from public.likes l where l.post_id = p.id)::integer as like_count,
  (select count(*) from public.comments c where c.post_id = p.id)::integer as comment_count
from public.posts p;

create or replace view public.profile_stats
with (security_invoker = on)
as
select
  pr.id,
  pr.username,
  pr.display_name,
  pr.bio,
  pr.avatar_url,
  pr.header_image_url,
  pr.created_at,
  (select count(*) from public.posts p where p.user_id = pr.id)::integer as post_count,
  (select count(*) from public.follows f where f.following_id = pr.id)::integer as follower_count,
  (select count(*) from public.follows f where f.follower_id = pr.id)::integer as following_count
from public.profiles pr;

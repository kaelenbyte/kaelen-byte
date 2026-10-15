-- LOCAL DEVELOPMENT SEED DATA ONLY.
--
-- This file inserts clearly-labelled demo accounts and content so a fresh
-- local Supabase instance is not empty. It is NEVER run against production.
-- Demo accounts use the shared password "password123" and @example.com email
-- addresses so they are easy to identify and remove.
--
-- Apply with: supabase db reset   (runs migrations then this seed)

-- Demo auth users. The handle_new_user trigger creates matching profiles.
insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
                        email_confirmed_at, confirmation_token, recovery_token,
                        email_change_token_new, email_change, email_change_token_current,
                        reauthentication_token, raw_app_meta_data, raw_user_meta_data,
                        created_at, updated_at)
values
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'demo.kaelen@example.com', crypt('password123', gen_salt('bf')),
   now(), '', '', '', '', '', '', '{"provider":"email","providers":["email"]}',
   '{"username":"kaelen_demo","display_name":"Kaelen (demo)"}', now(), now()),
  ('00000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'demo.maya@example.com', crypt('password123', gen_salt('bf')),
   now(), '', '', '', '', '', '', '{"provider":"email","providers":["email"]}',
   '{"username":"maya_demo","display_name":"Maya (demo)"}', now(), now()),
  ('00000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'demo.omar@example.com', crypt('password123', gen_salt('bf')),
   now(), '', '', '', '', '', '', '{"provider":"email","providers":["email"]}',
   '{"username":"omar_demo","display_name":"Omar (demo)"}', now(), now())
on conflict (id) do nothing;

insert into auth.identities (provider_id, user_id, identity_data, provider,
                             last_sign_in_at, created_at, updated_at)
values
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001',
   '{"sub":"00000000-0000-4000-8000-000000000001","email":"demo.kaelen@example.com"}', 'email', now(), now(), now()),
  ('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002',
   '{"sub":"00000000-0000-4000-8000-000000000002","email":"demo.maya@example.com"}', 'email', now(), now(), now()),
  ('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000003',
   '{"sub":"00000000-0000-4000-8000-000000000003","email":"demo.omar@example.com"}', 'email', now(), now(), now())
on conflict (provider_id, provider) do nothing;

update public.profiles set bio = 'Demo account — safe to delete.'
where id in (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000003'
);

-- Run demo post inserts as their owning users so the real RLS and rate-limit
-- triggers execute under the same identity context as browser requests.
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', false);
insert into public.posts (id, user_id, content, created_at)
values ('00000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-000000000001',
        '[demo] Shipping a cleaner experience starts with fewer but better decisions.', now() - interval '2 hours')
on conflict (id) do nothing;

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000002', false);
insert into public.posts (id, user_id, content, created_at)
values ('00000000-0000-4000-8000-0000000000a2', '00000000-0000-4000-8000-000000000002',
        '[demo] Working on community-first design. Safety is the differentiator.', now() - interval '1 hour')
on conflict (id) do nothing;
reset role;
select set_config('request.jwt.claim.sub', '', false);

insert into public.follows (follower_id, following_id)
values
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002'),
  ('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001')
on conflict do nothing;

-- Seeded posts are fixtures rather than user actions; they must not consume
-- the demo accounts' posting cooldowns.
delete from public.posting_events
where user_id in (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000003'
);

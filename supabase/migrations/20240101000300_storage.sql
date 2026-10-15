-- Kaelen Byte community: storage buckets and their access policies.
-- Buckets are public-read (feed/profile images are public content) but every
-- write is restricted to the authenticated owner's own folder: {user_id}/file.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars', 'avatars', true, 2097152,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-images', 'post-images', true, 5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- avatars
-- ---------------------------------------------------------------------------
drop policy if exists avatars_read on storage.objects;
create policy avatars_read on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists avatars_insert_own on storage.objects;
create policy avatars_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatars_update_own on storage.objects;
create policy avatars_update_own on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and owner_id = (select auth.uid()::text))
  with check (bucket_id = 'avatars' and owner_id = (select auth.uid()::text));

drop policy if exists avatars_delete_own on storage.objects;
create policy avatars_delete_own on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and owner_id = (select auth.uid()::text));

-- ---------------------------------------------------------------------------
-- post-images
-- ---------------------------------------------------------------------------
drop policy if exists post_images_read on storage.objects;
create policy post_images_read on storage.objects
  for select using (bucket_id = 'post-images');

drop policy if exists post_images_insert_own on storage.objects;
create policy post_images_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists post_images_update_own on storage.objects;
create policy post_images_update_own on storage.objects
  for update to authenticated
  using (bucket_id = 'post-images' and owner_id = (select auth.uid()::text))
  with check (bucket_id = 'post-images' and owner_id = (select auth.uid()::text));

drop policy if exists post_images_delete_own on storage.objects;
drop policy if exists post_images_delete_owner_or_mod on storage.objects;
create policy post_images_delete_owner_or_mod on storage.objects
  for delete to authenticated
  using (bucket_id = 'post-images' and (owner_id = (select auth.uid()::text) or public.is_moderator()));

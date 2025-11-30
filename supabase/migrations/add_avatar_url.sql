-- Add avatar_url column to profiles table
alter table public.profiles
add column if not exists avatar_url text;

-- Create avatars bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Set up storage policies
-- Allow public read access to avatars
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Allow authenticated users to upload avatars
create policy "Anyone can upload an avatar"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

-- Allow users to update their own avatars
create policy "Users can update their own avatar"
  on storage.objects for update
  using ( bucket_id = 'avatars' and auth.uid() = owner )
  with check ( bucket_id = 'avatars' and auth.uid() = owner );

-- Allow users to delete their own avatars
create policy "Users can delete their own avatar"
  on storage.objects for delete
  using ( bucket_id = 'avatars' and auth.uid() = owner );

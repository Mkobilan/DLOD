-- Create notifications table
create table if not exists public.notifications (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('chat_request', 'message', 'system')),
  content text not null,
  related_id uuid, -- e.g., the user who sent the request
  is_read boolean not null default false,
  created_at timestamp with time zone not null default now(),
  constraint notifications_pkey primary key (id)
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Policies
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Allow inserting notifications for other users (e.g. chat requests)
-- Ideally this should be restricted, but for now we allow authenticated users to insert
create policy "Users can insert notifications"
  on public.notifications for insert
  with check (auth.role() = 'authenticated');

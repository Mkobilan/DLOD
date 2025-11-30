-- Create user_settings table for storing user preferences
create table if not exists public.user_settings (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  
  -- Notification preferences
  notification_chat_request boolean not null default true,
  notification_message boolean not null default true,
  notification_application boolean not null default true,
  notification_review boolean not null default true,
  notification_system boolean not null default true,
  
  -- Privacy settings
  hide_phone_number boolean not null default false,
  
  -- Appearance settings
  theme text not null default 'dark' check (theme in ('dark', 'light')),
  text_size text not null default 'medium' check (text_size in ('small', 'medium', 'large')),
  
  -- Timestamps
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  
  constraint user_settings_pkey primary key (id),
  constraint user_settings_user_id_key unique (user_id)
);

-- Enable RLS
alter table public.user_settings enable row level security;

-- Policies
create policy "Users can view their own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own settings"
  on public.user_settings for update
  using (auth.uid() = user_id);

-- Function to update updated_at timestamp
create or replace function public.update_user_settings_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at
create trigger update_user_settings_updated_at
  before update on public.user_settings
  for each row
  execute function public.update_user_settings_updated_at();

-- Function to create default settings for new users
create or replace function public.create_default_user_settings()
returns trigger as $$
begin
  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create default settings when a new profile is created
create trigger create_default_user_settings_trigger
  after insert on public.profiles
  for each row
  execute function public.create_default_user_settings();

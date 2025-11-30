alter table public.user_settings
add column if not exists has_seen_tutorial boolean not null default false;

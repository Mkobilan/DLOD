-- Add updated_at column to profiles table
alter table public.profiles
add column if not exists updated_at timestamptz default now();

-- Create function to handle updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for profiles
drop trigger if exists on_profiles_updated on public.profiles;
create trigger on_profiles_updated
  before update on public.profiles
  for each row
  execute procedure public.handle_updated_at();

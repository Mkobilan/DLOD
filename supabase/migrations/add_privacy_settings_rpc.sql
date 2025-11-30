-- Function to check if a user's phone number should be hidden
-- This function is security definer to bypass RLS policies on user_settings table
create or replace function public.should_hide_phone_number(target_user_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  should_hide boolean;
begin
  select hide_phone_number
  into should_hide
  from public.user_settings
  where user_id = target_user_id;
  
  -- Default to false (show phone) if no settings found
  return coalesce(should_hide, false);
end;
$$;

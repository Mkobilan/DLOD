-- Remove the type constraint to allow 'review' and any other notification types
-- This is the safest approach when we're not sure what types exist in the database
alter table public.notifications
drop constraint if exists notifications_type_check;

-- Note: If you want to add the constraint back with specific types, 
-- first run this query in Supabase SQL editor to see what types exist:
-- SELECT DISTINCT type FROM public.notifications ORDER BY type;
-- Then add them all to a new constraint.

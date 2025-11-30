-- Enable Realtime for messages table
do $$
begin
  -- Check if the table is already in the publication to avoid errors
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' 
    and schemaname = 'public' 
    and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table messages;
  end if;
end $$;

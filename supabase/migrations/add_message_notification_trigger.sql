-- Create function to handle new message notifications
create or replace function public.handle_new_message_notification()
returns trigger as $$
declare
  sender_name text;
begin
  -- Get sender's name
  select full_name into sender_name
  from public.profiles
  where id = new.sender_id;

  -- Create notification for the receiver
  insert into public.notifications (user_id, type, content, related_id)
  values (
    new.receiver_id,
    'message',
    sender_name || ' sent you a message',
    new.sender_id
  );

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Create trigger on messages table
drop trigger if exists on_message_created on public.messages;
create trigger on_message_created
  after insert on public.messages
  for each row
  execute function public.handle_new_message_notification();

-- Create function to handle new review notifications
create or replace function public.handle_new_review_notification()
returns trigger as $$
declare
  reviewer_name text;
begin
  -- Get reviewer's name
  select full_name into reviewer_name
  from public.profiles
  where id = new.reviewer_id;

  -- Create notification for the reviewee
  insert into public.notifications (user_id, type, content, related_id)
  values (
    new.reviewee_id,
    'review',
    reviewer_name || ' gave you a ' || new.rating || '-star review',
    new.reviewer_id
  );

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Create trigger on reviews table
drop trigger if exists on_review_created on public.reviews;
create trigger on_review_created
  after insert on public.reviews
  for each row
  execute function public.handle_new_review_notification();

-- Function to validate review roles
create or replace function public.validate_review_roles()
returns trigger as $$
declare
  reviewer_role text;
  reviewee_role text;
begin
  -- Get reviewer role
  select role into reviewer_role
  from public.profiles
  where id = new.reviewer_id;

  -- Get reviewee role
  select role into reviewee_role
  from public.profiles
  where id = new.reviewee_id;

  -- Check if roles are different
  if reviewer_role = reviewee_role then
    raise exception 'Users cannot review others with the same role';
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger for review validation
drop trigger if exists on_review_created_check_roles on public.reviews;
create trigger on_review_created_check_roles
  before insert on public.reviews
  for each row
  execute function public.validate_review_roles();

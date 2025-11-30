-- Add new notification types to the check constraint
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check 
  check (type in ('chat_request', 'message', 'system', 'application_received', 'application_status'));

-- Function to handle new application notifications (Notify Contractor)
create or replace function public.handle_new_application()
returns trigger as $$
declare
  job_title text;
  contractor_id uuid;
  applicant_name text;
begin
  -- Get job details
  select title, contractor_id into job_title, contractor_id
  from public.jobs
  where id = new.job_id;

  -- Get applicant name
  select full_name into applicant_name
  from public.profiles
  where id = new.laborer_id;

  -- Create notification for the contractor
  insert into public.notifications (user_id, type, content, related_id)
  values (
    contractor_id,
    'application_received',
    applicant_name || ' applied for ' || job_title,
    new.id -- Store application ID as related_id
  );

  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new applications
drop trigger if exists on_application_created on public.applications;
create trigger on_application_created
  after insert on public.applications
  for each row
  execute function public.handle_new_application();

-- Function to handle application status changes (Notify Laborer)
create or replace function public.handle_application_status_change()
returns trigger as $$
declare
  job_title text;
begin
  -- Only proceed if status has changed
  if old.status = new.status then
    return new;
  end if;

  -- Get job details
  select title into job_title
  from public.jobs
  where id = new.job_id;

  -- Create notification for the laborer
  insert into public.notifications (user_id, type, content, related_id)
  values (
    new.laborer_id,
    'application_status',
    'Your application for ' || job_title || ' was ' || new.status,
    new.job_id -- Store job ID as related_id so they can view the job
  );

  return new;
end;
$$ language plpgsql security definer;

-- Trigger for application status changes
drop trigger if exists on_application_status_change on public.applications;
create trigger on_application_status_change
  after update on public.applications
  for each row
  execute function public.handle_application_status_change();

-- Add DELETE policy for jobs table
-- This allows contractors to delete their own job postings

create policy "Contractors can delete own jobs."
  on public.jobs for delete
  using ( auth.uid() = contractor_id );

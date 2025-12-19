-- Create saved_workers table
create table if not exists public.saved_workers (
    id uuid not null default gen_random_uuid(),
    contractor_id uuid not null references public.profiles(id) on delete cascade,
    worker_id uuid not null references public.profiles(id) on delete cascade,
    created_at timestamp with time zone not null default now(),
    primary key (id),
    unique (contractor_id, worker_id)
);

-- Enable RLS
alter table public.saved_workers enable row level security;

-- Policies
create policy "Contractors can view their saved workers"
    on public.saved_workers for select
    using ((select auth.uid()) = contractor_id);

create policy "Contractors can save workers"
    on public.saved_workers for insert
    with check ((select auth.uid()) = contractor_id);

create policy "Contractors can remove saved workers"
    on public.saved_workers for delete
    using ((select auth.uid()) = contractor_id);

-- Add zip_code and notes columns to jobs table
alter table public.jobs add column if not exists zip_code text;
alter table public.jobs add column if not exists notes text;

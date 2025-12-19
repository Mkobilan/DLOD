-- Enable PostGIS for location
create extension if not exists postgis;

-- Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role text check (role in ('laborer', 'contractor')) not null,
  full_name text,
  avatar_url text,
  phone text,
  email text,
  location geography(POINT),
  city text,
  state text,
  zip text,
  bio text,
  skills text[], -- Array of skills
  is_available boolean default false,
  search_radius int default 10, -- in miles
  rating float default 0,
  review_count int default 0,
  subscription_status text,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( (select auth.uid()) = id );

create policy "Users can update own profile."
  on profiles for update
  using ( (select auth.uid()) = id );

-- Jobs Table
create table public.jobs (
  id uuid default gen_random_uuid() primary key,
  contractor_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  location geography(POINT),
  city text,
  state text,
  pay_rate text,
  requirements text,
  status text check (status in ('open', 'closed')) default 'open',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.jobs enable row level security;

-- Jobs Policies
create policy "Jobs are viewable by everyone."
  on jobs for select
  using ( true );

create policy "Contractors can insert jobs."
  on jobs for insert
  with check ( (select auth.uid()) = contractor_id );

create policy "Contractors can update own jobs."
  on jobs for update
  using ( (select auth.uid()) = contractor_id );

-- Applications Table
create table public.applications (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references public.jobs(id) on delete cascade not null,
  laborer_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(job_id, laborer_id)
);

-- Enable RLS
alter table public.applications enable row level security;

-- Applications Policies
create policy "Users can view relevant applications"
  on applications for select
  using ( (select auth.uid()) = laborer_id or exists ( select 1 from jobs where jobs.id = applications.job_id and jobs.contractor_id = (select auth.uid()) ) );

create policy "Laborers can create applications."
  on applications for insert
  with check ( (select auth.uid()) = laborer_id );

create policy "Contractors can update application status."
  on applications for update
  using ( exists ( select 1 from jobs where jobs.id = applications.job_id and jobs.contractor_id = (select auth.uid()) ) );

-- Messages Table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.messages enable row level security;

-- Messages Policies
create policy "Users can view their own messages."
  on messages for select
  using ( (select auth.uid()) = sender_id or (select auth.uid()) = receiver_id );

create policy "Users can insert messages."
  on messages for insert
  with check ( (select auth.uid()) = sender_id );

-- Reviews Table
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  reviewee_id uuid references public.profiles(id) on delete cascade not null,
  rating int check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.reviews enable row level security;

-- Reviews Policies
create policy "Reviews are viewable by everyone."
  on reviews for select
  using ( true );

create policy "Users can insert reviews."
  on reviews for insert
  with check ( (select auth.uid()) = reviewer_id );

-- Storage Buckets (Avatars)
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );

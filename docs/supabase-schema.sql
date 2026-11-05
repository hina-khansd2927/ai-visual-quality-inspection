-- ==============================================================================
-- AI Visual Quality Inspection: Supabase Database & Storage Setup Schema
-- Run this script in the Supabase SQL Editor to provision the project schema.
-- ==============================================================================

-- 1. Create the `inspections` table
create table if not exists public.inspections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default null,
  image_name text not null,
  image_path text not null,
  product_category text not null default 'General',
  status text not null check (status in ('PASS', 'FAIL', 'NEEDS_REVIEW')),
  defects jsonb not null default '[]'::jsonb,
  summary text not null,
  estimated_confidence numeric(4,2),
  limitations text,
  created_at timestamptz not null default now()
);

-- 2. Performance indexes for real-time querying, sorting, and filtering
create index if not exists idx_inspections_created_at on public.inspections (created_at desc);
create index if not exists idx_inspections_status on public.inspections (status);
create index if not exists idx_inspections_category on public.inspections (product_category);

-- 3. Provision the private Supabase Storage bucket for uploaded inspection images
insert into storage.buckets (id, name, public)
values ('inspection-images', 'inspection-images', false)
on conflict (id) do nothing;

-- 4. Enable Row Level Security (RLS)
alter table public.inspections enable row level security;

-- Policy: Allow anonymous/demo reading of records for hackathon demo mode
create policy "Allow read access to demo inspections"
  on public.inspections for select
  using (true);

-- Policy: Allow server backend (service role) full read/write access
create policy "Allow service role full access to inspections"
  on public.inspections for all
  using (auth.jwt() ->> 'role' = 'service_role')
  with check (auth.jwt() ->> 'role' = 'service_role');

-- Storage policy: Allow service role to upload images to inspection-images bucket
create policy "Allow service role uploads to inspection-images"
  on storage.objects for insert
  with check (bucket_id = 'inspection-images');

create policy "Allow service role reads from inspection-images"
  on storage.objects for select
  using (bucket_id = 'inspection-images');

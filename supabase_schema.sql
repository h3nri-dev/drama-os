-- ═══════════════════════════════════════════════════════════════════
-- Drama Studio — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════

-- 1. WAITLIST TABLE
-- Collects emails from the "Join Waitlist" tab on the login page
create table if not exists public.waitlist (
  id          uuid default gen_random_uuid() primary key,
  email       text not null,
  name        text,
  source      text default 'app',     -- where they signed up from
  status      text default 'pending', -- pending | approved | invited
  notes       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  constraint  waitlist_email_unique unique (email)
);

-- Allow anonymous inserts (so unauthenticated users can join the waitlist)
alter table public.waitlist enable row level security;

create policy "Anyone can join waitlist"
  on public.waitlist for insert
  to anon, authenticated
  with check (true);

-- Only authenticated admins can read/update waitlist
create policy "Authenticated users can read waitlist"
  on public.waitlist for select
  to authenticated
  using (true);

create policy "Authenticated users can update waitlist"
  on public.waitlist for update
  to authenticated
  using (true);

-- 2. PROJECTS TABLE
create table if not exists public.projects (
  id                text primary key,
  name              text not null,
  genre             text,
  color             text default '#c9a84c',
  ep_runtime        text,
  description       text,
  slug              text,
  global_pass       boolean default true,
  per_project_pass  boolean default true,
  site_published    boolean default false,
  next_release_date text,
  user_id           uuid references auth.users(id),
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

alter table public.projects enable row level security;

create policy "Users can read own projects"
  on public.projects for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on public.projects for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  to authenticated
  using (auth.uid() = user_id);

-- 3. EPISODES TABLE
create table if not exists public.episodes (
  id                text primary key,
  project_id        text references public.projects(id) on delete cascade,
  num               integer not null,
  title             text,
  notes             text,
  status            text default 'draft',
  segments          jsonb default '[]'::jsonb,
  vn_panels         jsonb default '[]'::jsonb,
  vn_panels_history jsonb default '[]'::jsonb,
  vn_style          text default 'cinematic',
  vn_style_prefix   text default '',
  chat_history      jsonb default '[]'::jsonb,
  price_per_ep      numeric,
  price_model       text default 'subscription',
  site_published    boolean default false,
  is_free           boolean default false,
  user_id           uuid references auth.users(id),
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

alter table public.episodes enable row level security;

create policy "Users can read own episodes"
  on public.episodes for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own episodes"
  on public.episodes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own episodes"
  on public.episodes for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own episodes"
  on public.episodes for delete
  to authenticated
  using (auth.uid() = user_id);

-- 4. BIBLES TABLE (story bible per project)
create table if not exists public.bibles (
  id              text primary key,
  project_id      text references public.projects(id) on delete cascade,
  characters      jsonb default '[]'::jsonb,
  relationships   jsonb default '[]'::jsonb,
  world_facts     jsonb default '[]'::jsonb,
  endings         jsonb default '[]'::jsonb,
  decision_points jsonb default '[]'::jsonb,
  story_prompt    jsonb default '{}'::jsonb,
  bible_version   integer default 1,
  last_changed_at timestamptz,
  changelog       jsonb default '[]'::jsonb,
  user_id         uuid references auth.users(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.bibles enable row level security;

create policy "Users can read own bibles"
  on public.bibles for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own bibles"
  on public.bibles for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own bibles"
  on public.bibles for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete own bibles"
  on public.bibles for delete to authenticated using (auth.uid() = user_id);

-- 5. ASSETS TABLE
create table if not exists public.assets (
  id          text primary key,
  project_id  text references public.projects(id) on delete cascade,
  name        text,
  type        text,
  url         text,
  user_id     uuid references auth.users(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.assets enable row level security;

create policy "Users can CRUD own assets" on public.assets for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 6. PUBLISH JOBS TABLE
create table if not exists public.publish_jobs (
  id          text primary key,
  project_id  text references public.projects(id) on delete cascade,
  status      text default 'draft',
  platform    text,
  config      jsonb default '{}'::jsonb,
  user_id     uuid references auth.users(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.publish_jobs enable row level security;

create policy "Users can CRUD own publish_jobs" on public.publish_jobs for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 7. VN IMAGES TABLE (visual novel panel images)
create table if not exists public.vn_images (
  id          uuid default gen_random_uuid() primary key,
  project_id  text references public.projects(id) on delete cascade,
  episode_id  text,
  panel_id    text,
  data_url    text,
  user_id     uuid references auth.users(id),
  created_at  timestamptz default now()
);

alter table public.vn_images enable row level security;

create policy "Users can CRUD own vn_images" on public.vn_images for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Unique constraint for upserts
create unique index if not exists vn_images_ep_panel on public.vn_images(episode_id, panel_id);

-- 8. AUDIO TRANSCRIPTS TABLE
create table if not exists public.audio_transcripts (
  id          text primary key,
  project_id  text references public.projects(id) on delete cascade,
  ep_id       text,
  lines       jsonb default '[]'::jsonb,
  voice_map   jsonb default '{}'::jsonb,
  audio_urls  jsonb default '{}'::jsonb,
  stale_audio jsonb default '{}'::jsonb,
  user_id     uuid references auth.users(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.audio_transcripts enable row level security;

create policy "Users can CRUD own audio_transcripts" on public.audio_transcripts for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════
-- REALTIME — enable for tables that need live sync
-- ═══════════════════════════════════════════════════════════════════
alter publication supabase_realtime add table public.episodes;
alter publication supabase_realtime add table public.bibles;

-- ═══════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════
create index if not exists idx_episodes_project on public.episodes(project_id);
create index if not exists idx_bibles_project on public.bibles(project_id);
create index if not exists idx_assets_project on public.assets(project_id);
create index if not exists idx_publish_jobs_project on public.publish_jobs(project_id);
create index if not exists idx_vn_images_project on public.vn_images(project_id);
create index if not exists idx_audio_transcripts_project on public.audio_transcripts(project_id);
create index if not exists idx_waitlist_email on public.waitlist(email);

-- ═══════════════════════════════════════════════════════════════════
-- SUPABASE AUTH SETTINGS (configure in Dashboard → Authentication)
-- ═══════════════════════════════════════════════════════════════════
-- 1. Enable Email provider (Dashboard → Authentication → Providers → Email)
-- 2. Optionally disable "Confirm email" for faster dev signup
-- 3. Set Site URL to your app's URL (e.g. http://localhost:3000)
-- 4. Add redirect URLs: http://localhost:3000, https://yourdomain.com

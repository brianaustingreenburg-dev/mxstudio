-- Run this in your Supabase SQL editor (supabase.com → project → SQL editor)
-- Creates two tables for Habla language app

-- Table 1: users (name + device ID, created on first open)
create table if not exists habla_users (
  uid        text primary key,          -- e.g. HB-4729
  name       text not null,             -- first name they entered
  created_at timestamptz default now()
);

-- Table 2: progress (level unlocks + TikTok URL for audit)
create table if not exists habla_progress (
  uid             text primary key references habla_users(uid),
  name            text,
  level_unlocked  int default 1,         -- 1, 2, or 3
  tiktok_url      text,                  -- URL they pasted to unlock
  verified_at     timestamptz default now()
);

-- Allow anonymous reads/writes from the app (anon key)
alter table habla_users enable row level security;
alter table habla_progress enable row level security;

create policy "Anyone can insert their own user" on habla_users
  for insert with check (true);

create policy "Anyone can read their own user" on habla_users
  for select using (true);

create policy "Anyone can upsert progress" on habla_progress
  for all using (true) with check (true);

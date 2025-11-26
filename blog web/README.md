# Supabase Database Schema — Argent Blog

Run this inside the Supabase SQL editor.

## Posts Table

```sql
create table posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  tag text not null,
  content text not null,
  author_id uuid references auth.users(id),
  inserted_at timestamp default now()
for rls/
-- Anyone can read posts
create policy "Public read" on posts
for select using (true);

-- Only logged-in users can insert posts
create policy "User insert" on posts
for insert with check (auth.uid() = author_id);

);

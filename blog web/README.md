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
);

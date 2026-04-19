-- =========================================================
--  MIGRATION 04 — Historique articles (V2 feature 4)
-- =========================================================

create table if not exists public.item_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text,
  unit text,
  use_count int default 1,
  last_used_at timestamptz default now(),
  unique(user_id, name)
);

alter table public.item_history enable row level security;

drop policy if exists "Users manage their own history" on public.item_history;
create policy "Users manage their own history"
  on public.item_history for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- =========================================================
--  MIGRATION 05 — Templates de listes (V2 feature 5)
-- =========================================================

create table if not exists public.list_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  items jsonb not null default '[]',
  created_at timestamptz default now()
);

alter table public.list_templates enable row level security;

drop policy if exists "Users manage their own templates" on public.list_templates;
create policy "Users manage their own templates"
  on public.list_templates for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

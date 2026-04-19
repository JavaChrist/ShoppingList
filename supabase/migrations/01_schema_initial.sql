-- =========================================================
--  MIGRATION 01 — Schéma initial (V1)
--  Tables: lists, list_members, items
--  Triggers, RLS, Realtime, fonction join_list_by_code
-- =========================================================

create extension if not exists "pgcrypto";

-- ============ TABLES ============

create table if not exists public.lists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references auth.users(id) on delete cascade not null,
  invite_code text unique default substr(md5(random()::text), 1, 8),
  created_at timestamptz default now()
);

create table if not exists public.list_members (
  list_id uuid references public.lists(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'editor' check (role in ('owner', 'editor', 'viewer')),
  joined_at timestamptz default now(),
  primary key (list_id, user_id)
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references public.lists(id) on delete cascade not null,
  name text not null,
  quantity int default 1,
  category text,
  checked boolean default false,
  added_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============ INDEX ============

create index if not exists idx_items_list_id on public.items(list_id);
create index if not exists idx_list_members_user_id on public.list_members(user_id);

-- ============ TRIGGERS ============

create or replace function public.update_updated_at()
returns trigger as $upd$
begin
  new.updated_at = now();
  return new;
end;
$upd$ language plpgsql;

drop trigger if exists trg_items_updated_at on public.items;
create trigger trg_items_updated_at
  before update on public.items
  for each row execute function public.update_updated_at();

create or replace function public.add_owner_to_members()
returns trigger as $own$
begin
  insert into public.list_members (list_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$own$ language plpgsql security definer;

drop trigger if exists trg_add_owner on public.lists;
create trigger trg_add_owner
  after insert on public.lists
  for each row execute function public.add_owner_to_members();

-- ============ RLS ============

alter table public.lists enable row level security;
alter table public.list_members enable row level security;
alter table public.items enable row level security;

-- lists
drop policy if exists "Members can view their lists" on public.lists;
create policy "Members can view their lists"
  on public.lists for select
  using (id in (select list_id from public.list_members where user_id = auth.uid()));

drop policy if exists "Authenticated users can create lists" on public.lists;
create policy "Authenticated users can create lists"
  on public.lists for insert
  with check (auth.uid() = owner_id);

drop policy if exists "Owners can update their lists" on public.lists;
create policy "Owners can update their lists"
  on public.lists for update
  using (owner_id = auth.uid());

drop policy if exists "Owners can delete their lists" on public.lists;
create policy "Owners can delete their lists"
  on public.lists for delete
  using (owner_id = auth.uid());

-- list_members
drop policy if exists "Users can view memberships of their lists" on public.list_members;
create policy "Users can view memberships of their lists"
  on public.list_members for select
  using (user_id = auth.uid());

drop policy if exists "Users can join via invite" on public.list_members;
create policy "Users can join via invite"
  on public.list_members for insert
  with check (user_id = auth.uid());

drop policy if exists "Users can leave a list" on public.list_members;
create policy "Users can leave a list"
  on public.list_members for delete
  using (user_id = auth.uid());

-- items
drop policy if exists "Members can view items" on public.items;
create policy "Members can view items"
  on public.items for select
  using (list_id in (select list_id from public.list_members where user_id = auth.uid()));

drop policy if exists "Members can add items" on public.items;
create policy "Members can add items"
  on public.items for insert
  with check (
    list_id in (
      select list_id from public.list_members
      where user_id = auth.uid() and role in ('owner', 'editor')
    )
  );

drop policy if exists "Members can update items" on public.items;
create policy "Members can update items"
  on public.items for update
  using (
    list_id in (
      select list_id from public.list_members
      where user_id = auth.uid() and role in ('owner', 'editor')
    )
  );

drop policy if exists "Members can delete items" on public.items;
create policy "Members can delete items"
  on public.items for delete
  using (
    list_id in (
      select list_id from public.list_members
      where user_id = auth.uid() and role in ('owner', 'editor')
    )
  );

-- ============ REALTIME ============

do $rt$ begin
  alter publication supabase_realtime add table public.items;
exception when others then null; end $rt$;
do $rt$ begin
  alter publication supabase_realtime add table public.lists;
exception when others then null; end $rt$;
do $rt$ begin
  alter publication supabase_realtime add table public.list_members;
exception when others then null; end $rt$;

-- ============ FONCTION: rejoindre via code ============

drop function if exists public.join_list_by_code(text);

create or replace function public.join_list_by_code(code text)
returns uuid as $join$
declare
  target_list_id uuid;
begin
  target_list_id := (select id from public.lists where invite_code = code);

  if target_list_id is null then
    raise exception 'Code invalide';
  end if;

  insert into public.list_members (list_id, user_id, role)
  values (target_list_id, auth.uid(), 'editor')
  on conflict (list_id, user_id) do nothing;

  return target_list_id;
end;
$join$ language plpgsql security definer;

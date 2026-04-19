-- =========================================================
--  MIGRATION 02 — Table categories + seed (V2 feature 1)
-- =========================================================

create table if not exists public.categories (
  id text primary key,
  name text not null,
  emoji text not null,
  color text not null,
  sort_order int not null
);

alter table public.categories enable row level security;

drop policy if exists "Authenticated users can read categories" on public.categories;
create policy "Authenticated users can read categories"
  on public.categories for select
  to authenticated
  using (true);

insert into public.categories (id, name, emoji, color, sort_order) values
  ('fruits',      'Fruits',           '🍎', 'bg-red-50',    1),
  ('legumes',     'Légumes',          '🥕', 'bg-orange-50', 2),
  ('epicerie',    'Épicerie',         '🥫', 'bg-yellow-50', 3),
  ('boulangerie', 'Boulangerie',      '🥖', 'bg-amber-50',  4),
  ('laitier',     'Produits laitiers','🥛', 'bg-blue-50',   5),
  ('viande',      'Viande / Poisson', '🥩', 'bg-pink-50',   6),
  ('surgeles',    'Surgelés',         '❄️', 'bg-cyan-50',   7),
  ('boissons',    'Boissons',         '🍷', 'bg-purple-50', 8),
  ('hygiene',     'Hygiène',          '🧴', 'bg-green-50',  9),
  ('entretien',   'Entretien',        '🧽', 'bg-gray-100',  10),
  ('autre',       'Autre',            '📦', 'bg-gray-50',   11)
on conflict (id) do nothing;

-- =========================================================
--  MIGRATION 08 — Favoris produits
-- =========================================================
--  Ajoute un flag is_favorite sur item_history pour permettre
--  d'épingler les produits qu'on achète régulièrement.
--  Les produits "fréquents" (use_count élevé) et les favoris
--  épinglés sont affichés dans le modal "Mes produits".
-- =========================================================

alter table public.item_history
  add column if not exists is_favorite boolean not null default false;

-- Index pour accélérer le tri favoris d'abord puis par fréquence
create index if not exists item_history_user_favorite_idx
  on public.item_history (user_id, is_favorite desc, use_count desc);

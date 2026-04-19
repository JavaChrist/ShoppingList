-- =========================================================
--  MIGRATION 03 — Colonnes unit et note sur items (V2 features 2 & 3)
-- =========================================================

alter table public.items add column if not exists unit text;
alter table public.items add column if not exists note text;

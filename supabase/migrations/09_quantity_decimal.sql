-- =========================================================
--  MIGRATION 09 — Quantités décimales
-- =========================================================
--  Change items.quantity de int en numeric pour accepter les
--  valeurs décimales (0.5 cuillère, 1.5 kg, 2.5 L…).
--  L'IA peut renvoyer des demi-unités pour les recettes.
-- =========================================================

alter table public.items
  alter column quantity type numeric using quantity::numeric;

-- Même traitement pour l'historique (utile si on veut mémoriser
-- les quantités typiques avec fractions)
-- On ne touche pas use_count qui reste int par nature.

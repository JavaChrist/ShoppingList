-- =========================================================
--  MIGRATION 06 — Fix RLS SELECT policy on lists
--  Permet à l'owner de voir sa liste sans attendre le trigger
--  (nécessaire pour les INSERT ... RETURNING depuis createListFromRecipe)
-- =========================================================

drop policy if exists "Members can view their lists" on public.lists;

create policy "Members can view their lists"
  on public.lists for select
  using (
    owner_id = auth.uid()
    or id in (select list_id from public.list_members where user_id = auth.uid())
  );

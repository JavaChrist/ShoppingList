-- =========================================================
--  MIGRATION 07 — Codes d'invitation numériques à 6 chiffres
--  Remplace les codes md5 (ex "278c0cd3") par des codes
--  numériques plus simples à partager oralement (ex "482913")
-- =========================================================

-- Fonction qui génère un code unique à 6 chiffres
create or replace function public.generate_invite_code()
returns text as $gic$
declare
  new_code text;
  attempt int := 0;
begin
  loop
    new_code := lpad(floor(random() * 1000000)::text, 6, '0');
    exit when not exists (
      select 1 from public.lists where invite_code = new_code
    );
    attempt := attempt + 1;
    exit when attempt > 20;
  end loop;
  return new_code;
end;
$gic$ language plpgsql;

-- Nouveau default pour les prochaines listes
alter table public.lists
  alter column invite_code set default public.generate_invite_code();

-- Regénère les codes existants pour harmoniser le format
update public.lists
set invite_code = public.generate_invite_code()
where invite_code !~ '^[0-9]{6}$';

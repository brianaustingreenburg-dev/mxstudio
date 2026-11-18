-- Family First: fixes for the database rules (Supabase project ndpoxseourftjgdokxyh)
-- Run once in Supabase → SQL Editor → New query → paste → Run. Safe to run more than once.
--
-- Why: the original rules ask "which families am I in?" by reading family_members from inside
-- the family_members rule itself. Postgres stops that with "infinite recursion detected in policy",
-- so creating a family, joining one, check-ins, GPS, SOS alerts and the vault all fail for real accounts.
-- A new family is also invisible to its owner right after it is created, and nobody can look up a
-- family by invite code before joining it. This script fixes all three.

-- 1. One helper that answers "which families am I in?" without triggering the rules again
create or replace function public.ff_my_family_ids()
returns setof uuid
language sql security definer stable
set search_path = public
as $$
  select family_id from public.family_members where user_id = auth.uid()
$$;

-- 2. Families: members and the owner can see it; anyone signed in can create their own
drop policy if exists "Family members can read" on public.families;
drop policy if exists "ff families read" on public.families;
drop policy if exists "ff families insert" on public.families;
drop policy if exists "ff families update" on public.families;
create policy "ff families read" on public.families for select
  using (id in (select public.ff_my_family_ids()) or owner_id = auth.uid());
create policy "ff families insert" on public.families for insert
  with check (owner_id = auth.uid());
create policy "ff families update" on public.families for update
  using (owner_id = auth.uid());

-- 3. Family members: see your family; add yourself to a family you own
drop policy if exists "Family members visible to family" on public.family_members;
drop policy if exists "ff members read" on public.family_members;
drop policy if exists "ff members add self" on public.family_members;
drop policy if exists "ff members edit self" on public.family_members;
drop policy if exists "ff members leave" on public.family_members;
create policy "ff members read" on public.family_members for select
  using (family_id in (select public.ff_my_family_ids()));
create policy "ff members add self" on public.family_members for insert
  with check (user_id = auth.uid()
              and family_id in (select id from public.families where owner_id = auth.uid()));
create policy "ff members edit self" on public.family_members for update
  using (user_id = auth.uid());
create policy "ff members leave" on public.family_members for delete
  using (user_id = auth.uid());

-- 4. Locations, SOS alerts, check-ins, vault: same family only; you can only post as yourself
do $$
declare t text;
begin
  foreach t in array array['locations','sos_alerts','check_ins','vault_items'] loop
    execute format('drop policy if exists "Family sees family locations" on public.%I', t);
    execute format('drop policy if exists "Family sees SOS alerts" on public.%I', t);
    execute format('drop policy if exists "Family sees check-ins" on public.%I', t);
    execute format('drop policy if exists "Family sees vault" on public.%I', t);
    execute format('drop policy if exists "ff read" on public.%I', t);
    execute format('drop policy if exists "ff write" on public.%I', t);
    execute format('drop policy if exists "ff change own" on public.%I', t);
    execute format('drop policy if exists "ff delete own" on public.%I', t);
    execute format('create policy "ff read" on public.%I for select using (family_id in (select public.ff_my_family_ids()))', t);
    execute format('create policy "ff write" on public.%I for insert with check (user_id = auth.uid() and family_id in (select public.ff_my_family_ids()))', t);
    execute format('create policy "ff change own" on public.%I for update using (user_id = auth.uid() or family_id in (select public.ff_my_family_ids()))', t);
    execute format('create policy "ff delete own" on public.%I for delete using (user_id = auth.uid())', t);
  end loop;
end $$;

-- 5. Join by invite code (the app calls this first; returns the family, or nothing if the code is wrong)
create or replace function public.ff_join_family(code text)
returns setof public.families
language plpgsql security definer
set search_path = public
as $$
declare fam public.families;
begin
  if auth.uid() is null then return; end if;
  select * into fam from public.families where lower(invite_code) = lower(trim(code)) limit 1;
  if not found then return; end if;
  insert into public.family_members (family_id, user_id, nickname, emoji)
  values (fam.id, auth.uid(),
          coalesce((select display_name from public.profiles where id = auth.uid()), 'Me'), '👤')
  on conflict (family_id, user_id) do nothing;
  update public.profiles set family_code = fam.invite_code where id = auth.uid();
  return next fam;
end $$;
grant execute on function public.ff_join_family(text) to authenticated;
grant execute on function public.ff_my_family_ids() to authenticated;

-- 6. Profiles: family members can see each other's name and emoji (the member strip needs this)
drop policy if exists "ff profiles family read" on public.profiles;
create policy "ff profiles family read" on public.profiles for select
  using (id in (select user_id from public.family_members
                where family_id in (select public.ff_my_family_ids())));

-- 7. Emergency contacts are saved on the profile (Setup → step 5); add the columns the app writes
alter table public.profiles add column if not exists ec1_name  text;
alter table public.profiles add column if not exists ec1_phone text;
alter table public.profiles add column if not exists ec2_name  text;
alter table public.profiles add column if not exists ec2_phone text;

-- 8. Let the app read each member's name/emoji together with the member row
--    (the member strip asks for family_members + profiles in one request)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'family_members_profile_fk') then
    alter table public.family_members
      add constraint family_members_profile_fk foreign key (user_id)
      references public.profiles(id) on delete cascade not valid;
  end if;
end $$;
notify pgrst, 'reload schema';

-- ==============================================================================
-- likyAI - SCRIPT D'INITIALISATION COMPLET DU BACKEND SUPABASE (POSTGRESQL)
-- ==============================================================================
-- Ce script contient l'intégralité du schéma, des tables, fonctions RPC, déclencheurs,
-- règles de sécurité (Row Level Security - RLS) et configuration de stockage (Storage)
-- pour faire tourner le backend de likyAI.
--
-- Instructions :
-- 1. Rendez-vous sur votre tableau de bord Supabase (https://supabase.com/dashboard)
-- 2. Ouvrez votre projet likyAI
-- 3. Allez dans "SQL Editor" dans le menu de gauche
-- 4. Collez l'intégralité de ce script et cliquez sur "Run"
-- ==============================================================================

-- 1. EXTENSIONS NÉCESSAIRES
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 2. TABLE : PROFILES (Profils utilisateurs & solde de crédits)
-- ==============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  phone_number text,
  credits integer not null default 60 check (credits >= 0),
  tier text not null default 'free' check (tier in ('free', 'starter', 'pro', 'business')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

comment on table public.profiles is 'Profils utilisateurs de likyAI avec solde de crédits et forfaits.';

-- ==============================================================================
-- 3. TABLE : GENERATIONS (Créations : Image, Vidéo, Musique, Voix off)
-- ==============================================================================
create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  task_id text unique, -- ID de tâche externe KIE.ai ou local
  tool text not null check (tool in ('image', 'video', 'music', 'voice')),
  model_name text not null, -- ex: 'Nano Banana', 'Kling', 'Seedream', 'Suno V6'
  prompt text not null,
  status text not null default 'waiting' check (status in ('waiting', 'generating', 'success', 'fail')),
  media_url text, -- URL du rendu final dans Supabase Storage ou URL directe
  thumbnail_url text,
  credits_cost integer not null default 5,
  duration_seconds integer default 0,
  fail_reason text,
  parameters jsonb default '{}'::jsonb, -- Tous les réglages (format, qualité, durée, etc.)
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

comment on table public.generations is 'Historique des tâches et créations générées par les utilisateurs de likyAI.';

-- ==============================================================================
-- 4. TABLE : TRANSACTIONS (Recharges Mobile Money & débits de crédits)
-- ==============================================================================
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('topup', 'generation', 'refund', 'bonus')),
  amount integer not null, -- Positif pour les recharges/bonus, négatif pour les générations
  description text not null,
  operator text check (operator in ('MTN MoMo', 'Orange Money', 'Wave', 'Card', null)),
  phone text,
  amount_fcfa integer, -- Ex: 1000, 2500, 5000 FCFA
  status text not null default 'completed' check (status in ('pending', 'completed', 'failed', 'refunded')),
  reference text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

comment on table public.transactions is 'Journal comptable des recharges et des consommations de crédits.';

-- ==============================================================================
-- 5. INDEX POUR OPTIMISATION DES REQUÊTES
-- ==============================================================================
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_generations_user_id on public.generations(user_id);
create index if not exists idx_generations_task_id on public.generations(task_id);
create index if not exists idx_generations_status on public.generations(status);
create index if not exists idx_generations_created_at on public.generations(created_at desc);
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_created_at on public.transactions(created_at desc);

-- ==============================================================================
-- 6. DÉCLENCHEUR AUTOMATIQUE : CRÉATION DE PROFIL À L'INSCRIPTION
-- ==============================================================================
-- À chaque nouvel utilisateur dans auth.users, créer un profil avec 60 crédits offerts
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, credits)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    60 -- 60 crédits de bienvenue offerts pour tester l'IA
  )
  on conflict (id) do nothing;

  -- Enregistrement de la transaction de bienvenue
  insert into public.transactions (user_id, type, amount, description, status)
  values (
    new.id,
    'bonus',
    60,
    'Crédits de bienvenue likyAI offerts',
    'completed'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- 7. FONCTION RPC SÉCURISÉE : DÉDUCTION ATOMIQUE DE CRÉDITS (DÉBUT DE CRÉATION)
-- ==============================================================================
-- Empêche les attaques de concurrence (race conditions) avec verrouillage de ligne FOR UPDATE
create or replace function public.deduct_credits(
  p_user_id uuid,
  p_cost integer,
  p_description text,
  p_task_id text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_credits integer;
  v_new_credits integer;
begin
  -- Verrouillage de la ligne de profil pour mise à jour exclusive
  select credits into v_current_credits
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    return json_build_object('success', false, 'error', 'Utilisateur introuvable');
  end if;

  if v_current_credits < p_cost then
    return json_build_object(
      'success', false,
      'error', 'Crédits insuffisants',
      'credits', v_current_credits,
      'required', p_cost
    );
  end if;

  v_new_credits := v_current_credits - p_cost;

  update public.profiles
  set credits = v_new_credits, updated_at = now()
  where id = p_user_id;

  -- Journaliser la transaction
  insert into public.transactions (user_id, type, amount, description, status, reference)
  values (p_user_id, 'generation', -p_cost, p_description, 'completed', p_task_id);

  return json_build_object(
    'success', true,
    'previous_credits', v_current_credits,
    'new_credits', v_new_credits,
    'cost', p_cost
  );
end;
$$;

-- ==============================================================================
-- 8. FONCTION RPC SÉCURISÉE : RECHARGE DE CRÉDITS (MOBILE MONEY)
-- ==============================================================================
create or replace function public.add_credits(
  p_user_id uuid,
  p_credits_amount integer,
  p_amount_fcfa integer,
  p_operator text,
  p_phone text,
  p_reference text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_credits integer;
begin
  update public.profiles
  set credits = credits + p_credits_amount, updated_at = now()
  where id = p_user_id
  returning credits into v_new_credits;

  if not found then
    return json_build_object('success', false, 'error', 'Utilisateur introuvable');
  end if;

  insert into public.transactions (
    user_id,
    type,
    amount,
    description,
    operator,
    phone,
    amount_fcfa,
    status,
    reference
  ) values (
    p_user_id,
    'topup',
    p_credits_amount,
    format('Recharge %s (%s FCFA)', p_operator, to_char(p_amount_fcfa, 'FM999G999')),
    p_operator,
    p_phone,
    p_amount_fcfa,
    'completed',
    coalesce(p_reference, format('MOMO-%s', floor(extract(epoch from now()))))
  );

  return json_build_object(
    'success', true,
    'added_credits', p_credits_amount,
    'total_credits', v_new_credits
  );
end;
$$;

-- ==============================================================================
-- 9. SÉCURITÉ AU NIVEAU DES LIGNES (ROW LEVEL SECURITY - RLS)
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.generations enable row level security;
alter table public.transactions enable row level security;

-- Politiques pour PROFILES
drop policy if exists "Les utilisateurs peuvent lire leur propre profil" on public.profiles;
create policy "Les utilisateurs peuvent lire leur propre profil"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Les utilisateurs peuvent mettre à jour leur propre profil" on public.profiles;
create policy "Les utilisateurs peuvent mettre à jour leur propre profil"
  on public.profiles for update
  using (auth.uid() = id);

-- Politiques pour GENERATIONS
drop policy if exists "Les utilisateurs peuvent voir leurs propres créations" on public.generations;
create policy "Les utilisateurs peuvent voir leurs propres créations"
  on public.generations for select
  using (auth.uid() = user_id);

drop policy if exists "Les utilisateurs peuvent insérer leurs créations" on public.generations;
create policy "Les utilisateurs peuvent insérer leurs créations"
  on public.generations for insert
  with check (auth.uid() = user_id);

drop policy if exists "Les utilisateurs peuvent modifier leurs créations" on public.generations;
create policy "Les utilisateurs peuvent modifier leurs créations"
  on public.generations for update
  using (auth.uid() = user_id);

drop policy if exists "Les utilisateurs peuvent supprimer leurs créations" on public.generations;
create policy "Les utilisateurs peuvent supprimer leurs créations"
  on public.generations for delete
  using (auth.uid() = user_id);

-- Politiques pour TRANSACTIONS
drop policy if exists "Les utilisateurs peuvent voir leur historique financier" on public.transactions;
create policy "Les utilisateurs peuvent voir leur historique financier"
  on public.transactions for select
  using (auth.uid() = user_id);

-- ==============================================================================
-- 10. CONFIGURATION DES BUCKETS SUPABASE STORAGE
-- ==============================================================================
-- Création des 3 compartiments nécessaires :
-- - 'creations' : pour les images, vidéos et musiques générées (public)
-- - 'avatars' : photos de profil des utilisateurs (public)
-- - 'uploads' : fichiers temporaires uploadés par les utilisateurs
insert into storage.buckets (id, name, public)
values ('creations', 'creations', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', false)
on conflict (id) do update set public = false;

-- Politiques Storage pour 'creations'
drop policy if exists "Accès public en lecture aux créations" on storage.objects;
create policy "Accès public en lecture aux créations"
  on storage.objects for select
  using (bucket_id = 'creations');

drop policy if exists "Upload autorisé pour utilisateurs connectés sur créations" on storage.objects;
create policy "Upload autorisé pour utilisateurs connectés sur créations"
  on storage.objects for insert
  with check (bucket_id = 'creations' and auth.role() = 'authenticated');

-- ==============================================================================
-- FIN DU SCRIPT SUPABASE - likyAI EST PRÊT !
-- ==============================================================================

-- ==============================================================================
-- likyAI STUDIOS v2 - SCHÉMA COMPLET ET AUTO-PORTANT (SUPABASE / POSTGRESQL)
-- ==============================================================================
-- Ce script crée de manière 100% sécurisée et idempotente toutes les tables nécessaires
-- pour les Studios likyAI (Personnages, Brand Kits, Templates, Pipelines).
-- 
-- Instructions :
-- 1. Rendez-vous sur votre tableau de bord Supabase (https://supabase.com/dashboard)
-- 2. Allez dans "SQL Editor" dans le menu de gauche
-- 3. Collez ce script et cliquez sur "Run"
-- ==============================================================================

-- 0. EXTENSIONS NÉCESSAIRES
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 0.1 TABLE PROFILES DE SECOURS (si schema.sql initial n'a pas encore été exécuté)
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

-- ==============================================================================
-- 1. TABLE : CHARACTERS (Personnages et Influenceurs IA - Soul ID)
-- ==============================================================================
create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  avatar_url text,
  description text,
  traits jsonb default '{}'::jsonb, -- genre, âge, style vestimentaire, niche, etc.
  reference_images text[] default '{}'::text[], -- Planche multi-vues (face, 3/4, profil)
  default_voice text,
  default_language text default 'fr',
  is_public boolean default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

comment on table public.characters is 'Personnages réutilisables et cohérents pour le Studio Personnages et les Pubs UGC.';

-- ==============================================================================
-- 2. TABLE : BRAND_KITS (Identité de marque & Produits)
-- ==============================================================================
create table if not exists public.brand_kits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Mon Brand Kit',
  logo_url text,
  palette text[] default array['#0F172A', '#3B82F6', '#FFFFFF'], -- Codes hex
  typography jsonb default '{"heading": "Sentient", "body": "Geist"}'::jsonb,
  tone text default 'Dynamique & Moderne',
  tagline text,
  website_url text,
  contact_whatsapp text,
  products jsonb default '[]'::jsonb, -- Catalogue [{ name, price, currency, description }]
  is_default boolean default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

comment on table public.brand_kits is 'Chartes graphiques et catalogues produits injectés dans les Studios.';

-- ==============================================================================
-- 3. TABLE : TEMPLATES (Modèles de départ pour chaque Studio)
-- ==============================================================================
create table if not exists public.templates (
  id text primary key, -- ex: 'ugc-review', 'click-to-ad', 'poster-event', 'saas-demo'
  studio_slug text not null check (studio_slug in ('ugc', 'characters', 'posters', 'saas', 'assets', 'motion')),
  title text not null,
  description text not null,
  category text not null, -- ex: 'E-commerce', 'Tech', 'Restauration', 'Mode'
  badge text,
  thumbnail_url text,
  format text default '9:16',
  recommended_models jsonb default '[]'::jsonb,
  default_params jsonb default '{}'::jsonb,
  cost_estimate_credits integer not null default 15,
  is_active boolean default true,
  created_at timestamptz not null default timezone('utc'::text, now())
);

comment on table public.templates is 'Catalogue de presets et modèles guidés pour les Studios.';

-- ==============================================================================
-- 4. TABLE : PIPELINE_RUNS (Exécutions de pipelines multi-étapes)
-- ==============================================================================
create table if not exists public.pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  studio_slug text not null,
  template_id text references public.templates(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'running', 'success', 'failed', 'refunded')),
  credits_reserved integer not null default 0,
  credits_consumed integer not null default 0,
  steps jsonb default '[]'::jsonb, -- Étapes détaillées [{ id, label, type, status, credits, output, error }]
  inputs jsonb default '{}'::jsonb,
  outputs jsonb default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

comment on table public.pipeline_runs is 'Suivi des workflows multi-étapes avec réservation et remboursement de crédits.';

-- ==============================================================================
-- 5. INDEX POUR LES PERFORMANCES
-- ==============================================================================
create index if not exists idx_characters_user_id on public.characters(user_id);
create index if not exists idx_brand_kits_user_id on public.brand_kits(user_id);
create index if not exists idx_templates_studio_slug on public.templates(studio_slug);
create index if not exists idx_pipeline_runs_user_id on public.pipeline_runs(user_id);
create index if not exists idx_pipeline_runs_status on public.pipeline_runs(status);

-- ==============================================================================
-- 6. SÉCURITÉ ROW LEVEL SECURITY (RLS)
-- ==============================================================================
alter table public.characters enable row level security;
alter table public.brand_kits enable row level security;
alter table public.templates enable row level security;
alter table public.pipeline_runs enable row level security;

-- Politiques CHARACTERS
drop policy if exists "Les utilisateurs gèrent leurs personnages" on public.characters;
create policy "Les utilisateurs gèrent leurs personnages"
  on public.characters for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Lecture des personnages publics" on public.characters;
create policy "Lecture des personnages publics"
  on public.characters for select
  using (is_public = true);

-- Politiques BRAND_KITS
drop policy if exists "Les utilisateurs gèrent leurs Brand Kits" on public.brand_kits;
create policy "Les utilisateurs gèrent leurs Brand Kits"
  on public.brand_kits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Politiques TEMPLATES (Lecture publique pour tous)
drop policy if exists "Lecture publique des templates" on public.templates;
create policy "Lecture publique des templates"
  on public.templates for select
  using (is_active = true);

-- Politiques PIPELINE_RUNS
drop policy if exists "Les utilisateurs consultent leurs pipelines" on public.pipeline_runs;
create policy "Les utilisateurs consultent leurs pipelines"
  on public.pipeline_runs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ==============================================================================
-- 7. TEMPLATES PAR DÉFAUT POUR LES STUDIOS
-- ==============================================================================
insert into public.templates (id, studio_slug, title, description, category, badge, format, cost_estimate_credits)
values
  ('ugc-review', 'ugc', 'Avis Client / Témoignage', 'Un créateur face caméra présente le produit et partage son retour d''expérience enthousiaste.', 'E-commerce', 'Bestseller', '9:16', 18),
  ('ugc-unboxing', 'ugc', 'Unboxing Immersif', 'Déballage soigné du produit avec focus sur les textures, packaging et accessoires.', 'Produit', null, '9:16', 20),
  ('click-to-ad', 'ugc', 'Spot Publicitaire Dynamique', 'Montage rythmé en 3 temps : accroche choc, problème résolu, offre promotionnelle et CTA.', 'Marketing', 'Conversion', '9:16', 22),
  ('char-create', 'characters', 'Influenceur Digital Polyvalent', 'Créez une personnalité numérique complète avec planche de références multi-angles.', 'Identité', 'Multi-vues', '9:16', 8),
  ('char-motion', 'characters', 'Animation par Mouvement', 'Transférez la gestuelle ou la chorégraphie d''une vidéo témoin sur votre personnage.', 'Cinématique', 'Kling 3.0', '9:16', 22),
  ('poster-event', 'posters', 'Affiche Événement / Festival', 'Visuel percutant avec composition typographique équilibrée pour concerts ou conférences.', 'Événement', 'OCR Validé', '4:5', 8),
  ('saas-teaser', 'saas', 'Teaser Produit 15s', 'Présentation concise d''une fonctionnalité phare avec zoom d''interface et voix off percutante.', 'SaaS', 'Rapide', '16:9', 18),
  ('assets-icons-3d', 'assets', 'Pack 12 Icônes 3D Glassmorphism', 'Génération d''une collection d''icônes cohérentes avec détourage transparent automatique.', 'Design', '12 Icônes', '1:1', 8),
  ('motion-logo-reveal', 'motion', 'Révélation de Logo Cinématique', 'Animation dynamique de votre logo avec effets de particules, néon ou métallique.', 'Branding', 'Pro', '16:9', 14)
on conflict (id) do nothing;

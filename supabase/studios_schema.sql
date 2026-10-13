-- ==============================================================================
-- likyAI STUDIOS v2 - SCHÉMA DE BASE DE DONNÉES (SUPABASE / POSTGRESQL)
-- ==============================================================================
-- Tables pour les Studios : Personnages, Brand Kits, Templates et Pipelines
-- ==============================================================================

-- 1. TABLE : CHARACTERS (Personnages et Influenceurs IA)
create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  avatar_url text,
  description text,
  traits jsonb default '{}'::jsonb, -- genre, âge, ethnie, style vestimentaire, niche, etc.
  reference_images text[] default '{}'::text[], -- Planche multi-vues (face, profil, plein pied)
  default_voice text, -- ID de voix ElevenLabs associée
  default_language text default 'fr',
  is_public boolean default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

comment on table public.characters is 'Personnages réutilisables et cohérents pour le Studio Personnages et les Pubs UGC.';

-- 2. TABLE : BRAND_KITS (Identité de marque & Produits)
create table if not exists public.brand_kits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null default 'Mon Brand Kit',
  logo_url text,
  palette text[] default array['#000000', '#ffffff'], -- Codes hex verrouillés
  typography jsonb default '{"heading": "Sentient", "body": "Geist"}'::jsonb,
  tone text default 'Dynamique & Moderne',
  tagline text,
  website_url text,
  contact_whatsapp text,
  products jsonb default '[]'::jsonb, -- Catalogue [{ name, price, currency, image_url, description }]
  is_default boolean default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

comment on table public.brand_kits is 'Chartes graphiques et catalogues produits injectés dans les Studios.';

-- 3. TABLE : TEMPLATES (Modèles de départ pour chaque Studio)
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

-- 4. TABLE : PIPELINE_RUNS (Exécutions de pipelines multi-étapes)
create table if not exists public.pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
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

-- 5. INDEX
create index if not exists idx_characters_user_id on public.characters(user_id);
create index if not exists idx_brand_kits_user_id on public.brand_kits(user_id);
create index if not exists idx_templates_studio_slug on public.templates(studio_slug);
create index if not exists idx_pipeline_runs_user_id on public.pipeline_runs(user_id);
create index if not exists idx_pipeline_runs_status on public.pipeline_runs(status);

-- 6. ROW LEVEL SECURITY (RLS)
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

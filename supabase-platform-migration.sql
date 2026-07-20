-- Phase 1 Platform Restructure Migration
-- Run this in Supabase SQL Editor

-- 1. Create competitions table
CREATE TABLE IF NOT EXISTS public.competitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  slug TEXT,
  api_league_id INTEGER,
  api_season INTEGER,
  status TEXT NOT NULL DEFAULT 'upcoming', -- upcoming | active | ended
  scoring_exact INTEGER NOT NULL DEFAULT 15,
  scoring_result INTEGER NOT NULL DEFAULT 5,
  scoring_winner INTEGER NOT NULL DEFAULT 50,
  scoring_bonus INTEGER NOT NULL DEFAULT 10,
  accent_color TEXT DEFAULT '#f59e0b',
  is_public BOOLEAN NOT NULL DEFAULT true
);

-- 2. Insert competitions
INSERT INTO public.competitions (id, name, short_name, slug, api_league_id, api_season, status, accent_color)
VALUES
  ('wc2026', 'FIFA World Cup 2026', 'World Cup 2026', 'wc2026', 1, 2026, 'active', '#f59e0b'),
  ('pl2526', 'Premier League 2025/26', 'PL 2025/26', 'pl2526', 39, 2025, 'upcoming', '#a855f7')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  status = EXCLUDED.status,
  accent_color = EXCLUDED.accent_color;

-- 3. Create competition_members table
CREATE TABLE IF NOT EXISTS public.competition_members (
  competition_id TEXT NOT NULL REFERENCES public.competitions(id),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (competition_id, user_id)
);

-- Enable RLS on competition_members
ALTER TABLE public.competition_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see competition members" ON public.competition_members FOR SELECT USING (true);
CREATE POLICY "Users can join competitions" ON public.competition_members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Auto-enrol all existing users into wc2026
INSERT INTO public.competition_members (competition_id, user_id)
SELECT 'wc2026', id FROM auth.users
ON CONFLICT DO NOTHING;

-- 5. Add competition_id to predictions table (nullable, defaults to wc2026)
ALTER TABLE public.predictions ADD COLUMN IF NOT EXISTS competition_id TEXT DEFAULT 'wc2026';

-- Back-fill existing rows
UPDATE public.predictions SET competition_id = 'wc2026' WHERE competition_id IS NULL;

-- 6. Add competition_id to bonus_answers table
ALTER TABLE public.bonus_answers ADD COLUMN IF NOT EXISTS competition_id TEXT DEFAULT 'wc2026';

-- Back-fill existing rows
UPDATE public.bonus_answers SET competition_id = 'wc2026' WHERE competition_id IS NULL;

-- 7. Create leagues table (mini leagues)
CREATE TABLE IF NOT EXISTS public.leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id TEXT NOT NULL REFERENCES public.competitions(id),
  name TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see leagues" ON public.leagues FOR SELECT USING (true);
CREATE POLICY "Users can create leagues" ON public.leagues FOR INSERT WITH CHECK (auth.uid() = created_by);

-- 8. Create league_members table
CREATE TABLE IF NOT EXISTS public.league_members (
  league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (league_id, user_id)
);

ALTER TABLE public.league_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see league members" ON public.league_members FOR SELECT USING (true);
CREATE POLICY "Users can join leagues" ON public.league_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave leagues" ON public.league_members FOR DELETE USING (auth.uid() = user_id);

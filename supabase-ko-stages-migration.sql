-- ============================================================
-- Scoracle: Add knockout stage prediction columns
-- Run this in the Supabase SQL editor
-- ============================================================

-- Add ET and penalty score columns to predictions table
ALTER TABLE public.predictions
  ADD COLUMN IF NOT EXISTS home_et INTEGER,
  ADD COLUMN IF NOT EXISTS away_et INTEGER,
  ADD COLUMN IF NOT EXISTS home_pens INTEGER,
  ADD COLUMN IF NOT EXISTS away_pens INTEGER;

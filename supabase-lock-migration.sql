-- ============================================================
-- Scoracle: Server-side prediction lock enforcement
-- Run this in the Supabase SQL editor
-- ============================================================

-- 1. Create fixtures table to store kickoff times
CREATE TABLE IF NOT EXISTS public.fixtures (
  id TEXT PRIMARY KEY,
  kickoff_time TIMESTAMPTZ NOT NULL
);

-- Allow all authenticated users to read fixture times
ALTER TABLE public.fixtures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Fixtures readable by authenticated users" ON public.fixtures;
CREATE POLICY "Fixtures readable by authenticated users"
  ON public.fixtures FOR SELECT
  TO authenticated
  USING (true);

-- 2. Insert all fixture kickoff times
-- On conflict, update the kickoff time (safe to re-run)
INSERT INTO public.fixtures (id, kickoff_time) VALUES
  -- Matchday 1
  ('s_A1',  '2026-06-11T15:00:00-04:00'),
  ('s_A2',  '2026-06-11T22:00:00-04:00'),
  ('s_B1',  '2026-06-12T15:00:00-04:00'),
  ('s_D1',  '2026-06-12T21:00:00-04:00'),
  ('s_B2',  '2026-06-13T15:00:00-04:00'),
  ('s_C1',  '2026-06-13T18:00:00-04:00'),
  ('s_C2',  '2026-06-13T21:00:00-04:00'),
  ('s_D2',  '2026-06-14T00:00:00-04:00'),
  ('s_E1',  '2026-06-14T13:00:00-04:00'),
  ('s_F1',  '2026-06-14T16:00:00-04:00'),
  ('s_E2',  '2026-06-14T19:00:00-04:00'),
  ('s_F2',  '2026-06-14T22:00:00-04:00'),
  ('s_H1',  '2026-06-15T12:00:00-04:00'),
  ('s_G1',  '2026-06-15T15:00:00-04:00'),
  ('s_H2',  '2026-06-15T18:00:00-04:00'),
  ('s_G2',  '2026-06-15T21:00:00-04:00'),
  ('s_I1',  '2026-06-16T15:00:00-04:00'),
  ('s_I2',  '2026-06-16T18:00:00-04:00'),
  ('s_J1',  '2026-06-16T21:00:00-04:00'),
  ('s_J2',  '2026-06-17T00:00:00-04:00'),
  ('s_K1',  '2026-06-17T13:00:00-04:00'),
  ('s_L1',  '2026-06-17T16:00:00-04:00'),
  ('s_L2',  '2026-06-17T19:00:00-04:00'),
  ('s_K2',  '2026-06-17T22:00:00-04:00'),
  -- Matchday 2
  ('s_A3',  '2026-06-18T12:00:00-04:00'),
  ('s_B3',  '2026-06-18T15:00:00-04:00'),
  ('s_B4',  '2026-06-18T18:00:00-04:00'),
  ('s_A4',  '2026-06-18T21:00:00-04:00'),
  ('s_D3',  '2026-06-19T15:00:00-04:00'),
  ('s_C3',  '2026-06-19T18:00:00-04:00'),
  ('s_C4',  '2026-06-19T20:30:00-04:00'),
  ('s_D4',  '2026-06-19T23:00:00-04:00'),
  ('s_F3',  '2026-06-20T13:00:00-04:00'),
  ('s_E3',  '2026-06-20T16:00:00-04:00'),
  ('s_E4',  '2026-06-20T20:00:00-04:00'),
  ('s_F4',  '2026-06-21T00:00:00-04:00'),
  ('s_H3',  '2026-06-21T12:00:00-04:00'),
  ('s_G3',  '2026-06-21T15:00:00-04:00'),
  ('s_H4',  '2026-06-21T18:00:00-04:00'),
  ('s_G4',  '2026-06-21T21:00:00-04:00'),
  ('s_J3',  '2026-06-22T13:00:00-04:00'),
  ('s_I3',  '2026-06-22T17:00:00-04:00'),
  ('s_I4',  '2026-06-22T20:00:00-04:00'),
  ('s_J4',  '2026-06-22T23:00:00-04:00'),
  ('s_K3',  '2026-06-23T13:00:00-04:00'),
  ('s_L3',  '2026-06-23T16:00:00-04:00'),
  ('s_L4',  '2026-06-23T19:00:00-04:00'),
  ('s_K4',  '2026-06-23T22:00:00-04:00'),
  -- Matchday 3
  ('s_B5',  '2026-06-24T15:00:00-04:00'),
  ('s_B6',  '2026-06-24T15:00:00-04:00'),
  ('s_C5',  '2026-06-24T18:00:00-04:00'),
  ('s_C6',  '2026-06-24T18:00:00-04:00'),
  ('s_A5',  '2026-06-24T21:00:00-04:00'),
  ('s_A6',  '2026-06-24T21:00:00-04:00'),
  ('s_E5',  '2026-06-25T16:00:00-04:00'),
  ('s_E6',  '2026-06-25T16:00:00-04:00'),
  ('s_F5',  '2026-06-25T19:00:00-04:00'),
  ('s_F6',  '2026-06-25T19:00:00-04:00'),
  ('s_D5',  '2026-06-25T22:00:00-04:00'),
  ('s_D6',  '2026-06-25T22:00:00-04:00'),
  ('s_I5',  '2026-06-26T15:00:00-04:00'),
  ('s_I6',  '2026-06-26T15:00:00-04:00'),
  ('s_H5',  '2026-06-26T20:00:00-04:00'),
  ('s_H6',  '2026-06-26T20:00:00-04:00'),
  ('s_G5',  '2026-06-26T23:00:00-04:00'),
  ('s_G6',  '2026-06-26T23:00:00-04:00'),
  ('s_L5',  '2026-06-27T17:00:00-04:00'),
  ('s_L6',  '2026-06-27T17:00:00-04:00'),
  ('s_K5',  '2026-06-27T19:30:00-04:00'),
  ('s_K6',  '2026-06-27T19:30:00-04:00'),
  ('s_J5',  '2026-06-27T22:00:00-04:00'),
  ('s_J6',  '2026-06-27T22:00:00-04:00'),
  -- Round of 32 (chronological order matching KNOCKOUT_BRACKET in App.jsx)
  ('k_r32_m73',  '2026-06-28T15:00:00-04:00'),  -- SoFi LA
  ('k_r32_m76',  '2026-06-29T13:00:00-04:00'),  -- NRG Houston
  ('k_r32_m74',  '2026-06-29T16:30:00-04:00'),  -- Gillette Foxborough
  ('k_r32_m75',  '2026-06-29T23:00:00-04:00'),  -- Estadio BBVA Monterrey
  ('k_r32_m78',  '2026-06-30T14:00:00-04:00'),  -- AT&T Arlington
  ('k_r32_m77',  '2026-06-30T17:00:00-04:00'),  -- MetLife New York
  ('k_r32_m79',  '2026-06-30T23:00:00-04:00'),  -- Estadio Azteca Mexico City
  ('k_r32_m80',  '2026-07-01T12:00:00-04:00'),  -- Mercedes-Benz Atlanta
  ('k_r32_m82',  '2026-07-01T16:00:00-04:00'),  -- Lumen Field Seattle
  ('k_r32_m81',  '2026-07-01T23:00:00-04:00'),  -- Levi's Stadium Santa Clara
  ('k_r32_m84',  '2026-07-02T15:00:00-04:00'),  -- SoFi LA
  ('k_r32_m83',  '2026-07-02T19:00:00-04:00'),  -- BMO Field Toronto
  ('k_r32_m85',  '2026-07-02T23:00:00-04:00'),  -- BC Place Vancouver
  ('k_r32_m88',  '2026-07-03T14:00:00-04:00'),  -- AT&T Arlington
  ('k_r32_m86',  '2026-07-03T18:00:00-04:00'),  -- Hard Rock Miami
  ('k_r32_m87',  '2026-07-03T21:30:00-04:00'),  -- Arrowhead Kansas City
  -- Round of 16
  ('k_r16_m89',  '2026-07-04T17:00:00-04:00'),
  ('k_r16_m90',  '2026-07-04T13:00:00-04:00'),
  ('k_r16_m91',  '2026-07-05T16:00:00-04:00'),
  ('k_r16_m92',  '2026-07-05T20:00:00-04:00'),
  ('k_r16_m93',  '2026-07-06T15:00:00-04:00'),
  ('k_r16_m94',  '2026-07-06T20:00:00-04:00'),
  ('k_r16_m95',  '2026-07-07T12:00:00-04:00'),
  ('k_r16_m96',  '2026-07-07T16:00:00-04:00'),
  -- Quarter-Finals
  ('k_qf_m97',   '2026-07-09T16:00:00-04:00'),
  ('k_qf_m98',   '2026-07-10T15:00:00-04:00'),
  ('k_qf_m99',   '2026-07-11T17:00:00-04:00'),
  ('k_qf_m100',  '2026-07-11T21:00:00-04:00'),
  -- Semi-Finals
  ('k_sf_m101',  '2026-07-14T15:00:00-04:00'),
  ('k_sf_m102',  '2026-07-15T15:00:00-04:00'),
  -- 3rd Place & Final
  ('k_3rd_m103', '2026-07-18T17:00:00-04:00'),
  ('k_final_m104','2026-07-19T15:00:00-04:00')
ON CONFLICT (id) DO UPDATE SET kickoff_time = EXCLUDED.kickoff_time;

-- 3. Add server-side lock enforcement to the predictions table
--    Blocks INSERT and UPDATE if now() is past kickoff - 15 minutes.
--    If the fixture_id isn't in the fixtures table (e.g. an API knockout ID),
--    the policy falls through to allow — client-side lock still applies there.

DROP POLICY IF EXISTS "Predictions lock before kickoff on insert" ON public.predictions;
CREATE POLICY "Predictions lock before kickoff on insert"
  ON public.predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND now() < COALESCE(
      (SELECT kickoff_time - interval '15 minutes'
       FROM public.fixtures WHERE id = fixture_id),
      'infinity'::timestamptz
    )
  );

DROP POLICY IF EXISTS "Predictions lock before kickoff on update" ON public.predictions;
CREATE POLICY "Predictions lock before kickoff on update"
  ON public.predictions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND now() < COALESCE(
      (SELECT kickoff_time - interval '15 minutes'
       FROM public.fixtures WHERE id = fixture_id),
      'infinity'::timestamptz
    )
  );

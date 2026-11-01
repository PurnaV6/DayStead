-- Adds an optional "Who is this for?" label to schedules (for example "Mum"), so carers can
-- manage someone else's bills, medicines and appointments alongside their own.
-- Run once in the Supabase SQL editor before shipping the app version that uses it.
-- Safe to re-run; no data is changed. Existing row-level security policies already cover new columns.
alter table public.daystead_schedules
  add column if not exists for_person text
  check (for_person is null or char_length(for_person) between 1 and 60);

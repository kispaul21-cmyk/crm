-- Migration: add_inn_to_deals.sql
-- Adds a nullable text column `inn` to the `deals` table.
-- Run this in Supabase SQL editor or via psql against your project's database.

BEGIN;

ALTER TABLE IF EXISTS public.deals
    ADD COLUMN IF NOT EXISTS inn text;

COMMIT;

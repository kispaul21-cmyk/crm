-- Migration: add_category_to_deals.sql
-- Adds a nullable text column `category` to the `deals` table.
-- Run this in Supabase SQL editor or via psql against your project's database.

BEGIN;

ALTER TABLE IF EXISTS public.deals
    ADD COLUMN IF NOT EXISTS category text;

COMMIT;

-- Optional: set a default value for existing rows, uncomment if desired
-- UPDATE public.deals SET category = 'server' WHERE category IS NULL;

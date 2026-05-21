-- ============================================================
-- Performance indexes — bestfreewallpapers.com
-- Updated after diagnostic (2026-05-21)
--
-- DIAGNOSTIC RESULT:
--   wallpapers:      37+ indexes (over-indexed, duplicates present)
--   ringtones:       12 indexes (reasonable, missing partial + trgm)
--   live_wallpapers:  8 indexes (missing downloads_count sort + trgm)
--   categories:      well indexed — nothing to add
--   collections:     well indexed — nothing to add
--   favorites:       well indexed — nothing to add
--   pg_trgm:         NOT installed
--
-- HOW TO RUN (Supabase SQL Editor):
--   Run STEP 1 first (extension), then STEP 2 (indexes),
--   then optionally STEP 3 (drop duplicates).
--   Each CONCURRENTLY statement must run individually
--   (not inside a BEGIN/COMMIT block).
--   All CREATE statements use IF NOT EXISTS — safe to re-run.
--
-- NO sensitive data, keys, or secrets in this file.
-- ============================================================


-- ============================================================
-- STEP 1 — Enable pg_trgm extension (required for ILIKE search)
--          Run this FIRST, alone.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;


-- ============================================================
-- STEP 2 — Missing indexes (run after STEP 1)
-- ============================================================

-- live_wallpapers: popular sort — /live-wallpapers page, homepage
-- Existing idx_live_wallpapers_published covers (is_published, is_active)
-- but has no downloads_count column — this one adds the sort column.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_live_wallpapers_active_pub_downloads
    ON live_wallpapers (downloads_count DESC)
    WHERE is_active = true AND is_published = true;

-- live_wallpapers: category filter with downloads sort
-- Existing idx_live_wallpapers_category covers (category) WHERE category IS NOT NULL
-- This partial index adds is_active/is_published guard + downloads sort.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_live_wallpapers_active_pub_category
    ON live_wallpapers (category, downloads_count DESC)
    WHERE is_active = true AND is_published = true;

-- ILIKE title search (all 3 content tables)
-- Requires pg_trgm extension from STEP 1.
-- wallpapers has a tsvector index on description but NOT on title with trgm.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wallpapers_title_trgm
    ON wallpapers USING gin (title gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_live_wallpapers_title_trgm
    ON live_wallpapers USING gin (title gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ringtones_title_trgm
    ON ringtones USING gin (title gin_trgm_ops);

-- ringtones: GIN index on tags array
-- Used by /ringtones/category/[slug] → .contains('tags', [categorySlug])
-- Not present in diagnostic results.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ringtones_tags_gin
    ON ringtones USING gin (tags);

-- ringtones: partial popular sort (more efficient than existing full-table idx_ringtones_downloads)
-- Existing: idx_ringtones_downloads ON (downloads_count DESC) — no WHERE clause
-- This partial index is ~80% smaller and faster for the common case.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ringtones_active_pub_downloads
    ON ringtones (downloads_count DESC)
    WHERE is_active = true AND is_published = true;

-- ringtones: duration sort — /ringtones?sort=duration
-- Not present in diagnostic results.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ringtones_active_pub_duration
    ON ringtones (duration_seconds ASC)
    WHERE is_active = true AND is_published = true;


-- ============================================================
-- STEP 3 — Drop duplicate indexes (OPTIONAL but recommended)
--
-- The wallpapers table has 40+ indexes — every INSERT/UPDATE
-- maintains ALL of them. Removing exact duplicates speeds up writes.
-- Run each DROP individually. Safe: all use IF EXISTS.
-- ============================================================

-- wallpapers: exact duplicates on single columns
-- Keep: idx_wallpapers_active (simple is_active index)
DROP INDEX CONCURRENTLY IF EXISTS idx_wallpapers_is_active;

-- Keep: idx_wallpapers_premium
DROP INDEX CONCURRENTLY IF EXISTS idx_wallpapers_is_premium;

-- Keep: idx_wallpapers_published
DROP INDEX CONCURRENTLY IF EXISTS idx_wallpapers_is_published;

-- Keep: idx_wallpapers_download_count_desc
-- idx_wallpapers_download_count is identical but uses NULLS LAST (minor diff)
-- Check both exist before dropping — if unsure, skip this one.
-- DROP INDEX CONCURRENTLY IF EXISTS idx_wallpapers_download_count;

-- wallpapers: duplicate (width, height) indexes
-- Keep: idx_wallpapers_aspect_ratio
DROP INDEX CONCURRENTLY IF EXISTS idx_wallpapers_dimensions;

-- live_wallpaper_favorites: duplicate user_id indexes
-- Keep: idx_live_favorites_user_id
DROP INDEX CONCURRENTLY IF EXISTS idx_live_wallpaper_favorites_user;

-- ringtone_favorites: duplicate user_id indexes
-- Keep: idx_ringtone_fav_user
DROP INDEX CONCURRENTLY IF EXISTS idx_ringtone_favorites_user_id;


-- ============================================================
-- VERIFICATION — Run after all steps to confirm indexes exist
-- ============================================================
--
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename IN ('wallpapers', 'live_wallpapers', 'ringtones')
--   AND indexname LIKE '%trgm%'
--    OR indexname LIKE '%pub_downloads%'
--    OR indexname LIKE '%tags_gin%'
-- ORDER BY tablename, indexname;
--
-- SELECT extname, extversion FROM pg_extension WHERE extname = 'pg_trgm';
-- ============================================================

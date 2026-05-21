-- ============================================================
-- Performance indexes for bestfreewallpapers.com
-- Supports 100,000+ rows on wallpapers / live_wallpapers / ringtones
--
-- HOW TO RUN:
--   1. Open Supabase Dashboard → SQL Editor
--   2. Run the pg_trgm extension line first (Section F)
--   3. Run each CREATE INDEX statement individually
--      (CONCURRENTLY cannot run inside a transaction block)
--   4. All statements use IF NOT EXISTS — safe to re-run
--
-- NOTE: No sensitive data, keys, or secrets in this file.
-- ============================================================

-- ============================================================
-- F. Extension required for ILIKE / full-text search indexes
--    Run this FIRST before the *_trgm indexes below
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;


-- ============================================================
-- A. wallpapers
-- ============================================================

-- Popular sort — homepage + /wallpapers (most common query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wallpapers_active_downloads
    ON wallpapers (download_count DESC)
    WHERE is_active = true;

-- Newest / Oldest sort — /wallpapers?sort=newest|oldest
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wallpapers_active_created
    ON wallpapers (created_at DESC)
    WHERE is_active = true;

-- Free / Premium filter + popular sort — /wallpapers?filter=free|premium
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wallpapers_active_premium_downloads
    ON wallpapers (is_premium, download_count DESC)
    WHERE is_active = true;

-- Category page — /category/[slug] filters by category_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wallpapers_active_category
    ON wallpapers (category_id, download_count DESC)
    WHERE is_active = true;

-- Slug lookup — /wallpaper/[slug] detail page
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallpapers_slug
    ON wallpapers (slug);

-- Search — ILIKE '%query%' on title (requires pg_trgm extension)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wallpapers_title_trgm
    ON wallpapers USING gin (title gin_trgm_ops);


-- ============================================================
-- B. live_wallpapers
-- ============================================================

-- Popular sort + active/published filter — /live-wallpapers, homepage
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_live_wallpapers_active_pub_downloads
    ON live_wallpapers (downloads_count DESC)
    WHERE is_active = true AND is_published = true;

-- Slug lookup — /live-wallpaper/[slug] detail page
CREATE UNIQUE INDEX IF NOT EXISTS idx_live_wallpapers_slug
    ON live_wallpapers (slug);

-- Category filter — /live-wallpapers?category=nature etc.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_live_wallpapers_active_pub_category
    ON live_wallpapers (category, downloads_count DESC)
    WHERE is_active = true AND is_published = true;

-- Search — ILIKE '%query%' on title
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_live_wallpapers_title_trgm
    ON live_wallpapers USING gin (title gin_trgm_ops);


-- ============================================================
-- C. ringtones
-- ============================================================

-- Popular sort — /ringtones, homepage
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ringtones_active_pub_downloads
    ON ringtones (downloads_count DESC)
    WHERE is_active = true AND is_published = true;

-- Newest sort — /ringtones?sort=newest
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ringtones_active_pub_created
    ON ringtones (created_at DESC)
    WHERE is_active = true AND is_published = true;

-- Duration sort — /ringtones?sort=duration (Shortest First)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ringtones_active_pub_duration
    ON ringtones (duration_seconds ASC)
    WHERE is_active = true AND is_published = true;

-- Slug lookup — /ringtone/[slug] detail page
CREATE UNIQUE INDEX IF NOT EXISTS idx_ringtones_slug
    ON ringtones (slug);

-- Tags GIN — /ringtones/category/[slug] uses .contains('tags', [...])
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ringtones_tags_gin
    ON ringtones USING gin (tags);

-- Search — ILIKE '%query%' on title
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ringtones_title_trgm
    ON ringtones USING gin (title gin_trgm_ops);


-- ============================================================
-- D. categories & collections
-- ============================================================

-- Categories listing — ORDER BY sort_order ASC WHERE is_active
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_active_sort
    ON categories (sort_order ASC)
    WHERE is_active = true;

-- Category slug lookup — /category/[slug]
CREATE INDEX IF NOT EXISTS idx_categories_slug
    ON categories (slug);

-- Collections listing — ORDER BY sort_order ASC WHERE is_active
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_collections_active_sort
    ON collections (sort_order ASC)
    WHERE is_active = true;

-- Collection slug lookup — /collections/[slug]
CREATE INDEX IF NOT EXISTS idx_collections_slug
    ON collections (slug);


-- ============================================================
-- E. favorites tables (per-user queries)
-- ============================================================

-- .eq('user_id', userId) on each favorites table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_user_id
    ON favorites (user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ringtone_favorites_user_id
    ON ringtone_favorites (user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_live_wallpaper_favorites_user_id
    ON live_wallpaper_favorites (user_id);

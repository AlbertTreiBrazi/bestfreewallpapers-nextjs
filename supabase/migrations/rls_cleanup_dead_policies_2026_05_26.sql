-- =============================================================================
-- RLS CLEANUP — Policies pe tabele moarte (0 rânduri + nefolosite în cod)
-- 2026-05-26 — bazat pe audit complet 181 policies + row count verificat
-- Safe to re-run: toate DROP folosesc IF EXISTS
-- =============================================================================


-- ============================================================
-- GRUP 1: Tabele din proiecte vechi — 0 rânduri, nefolosite
-- ============================================================

-- events (0 rânduri) — MirelaPhotography, events fotografice
DROP POLICY IF EXISTS "Events are admin only" ON public.events;

-- users (0 rânduri) — public.users separat de profiles, sistem vechi de auth
DROP POLICY IF EXISTS "Service role can update subscription tier" ON public.users;
DROP POLICY IF EXISTS "Users can read own subscription tier" ON public.users;
DROP POLICY IF EXISTS "users_admin_all" ON public.users;
DROP POLICY IF EXISTS "users_self_access" ON public.users;
DROP POLICY IF EXISTS "users_self_update" ON public.users;

-- wallpaper_collections (0 rânduri) — înlocuit de collection_wallpapers (care ARE date)
DROP POLICY IF EXISTS "wallpaper_collections_admin_delete" ON public.wallpaper_collections;
DROP POLICY IF EXISTS "wallpaper_collections_admin_insert" ON public.wallpaper_collections;
DROP POLICY IF EXISTS "wallpaper_collections_admin_update" ON public.wallpaper_collections;
DROP POLICY IF EXISTS "wallpaper_collections_public_read" ON public.wallpaper_collections;

-- plans (0 rânduri) — înlocuit de bfw_plans (care ARE 3 rânduri)
DROP POLICY IF EXISTS "plans_admin_delete" ON public.plans;
DROP POLICY IF EXISTS "plans_admin_insert" ON public.plans;
DROP POLICY IF EXISTS "plans_admin_update" ON public.plans;
DROP POLICY IF EXISTS "plans_public_read" ON public.plans;

-- payments (0 rânduri) — sistem vechi de plată
DROP POLICY IF EXISTS "payments_user_access" ON public.payments;

-- bfw_subscriptions (0 rânduri) — tabel gol, înlocuit de alt sistem
DROP POLICY IF EXISTS "Only service role can manage subscriptions" ON public.bfw_subscriptions;
DROP POLICY IF EXISTS "Users can read own subscriptions" ON public.bfw_subscriptions;

-- subscriptions (0 rânduri)
DROP POLICY IF EXISTS "subscriptions_user_access" ON public.subscriptions;

-- user_subscriptions (0 rânduri)
DROP POLICY IF EXISTS "user_subscriptions_select_own" ON public.user_subscriptions;

-- stripe_customers (0 rânduri) — integrare Stripe veche
DROP POLICY IF EXISTS "stripe_customers_select_own" ON public.stripe_customers;

-- wallpaper_tags (0 rânduri)
DROP POLICY IF EXISTS "Wallpaper tags are viewable by everyone" ON public.wallpaper_tags;

-- wallpaper_plans (0 rânduri)
DROP POLICY IF EXISTS "wallpaper_plans_admin_delete" ON public.wallpaper_plans;
DROP POLICY IF EXISTS "wallpaper_plans_admin_insert" ON public.wallpaper_plans;
DROP POLICY IF EXISTS "wallpaper_plans_admin_update" ON public.wallpaper_plans;
DROP POLICY IF EXISTS "wallpaper_plans_public_read" ON public.wallpaper_plans;

-- wallpaper_downloads (0 rânduri) — înlocuit de downloads (57 rânduri)
DROP POLICY IF EXISTS "public_insert_wallpaper_downloads" ON public.wallpaper_downloads;
DROP POLICY IF EXISTS "wallpaper_downloads_admin_only" ON public.wallpaper_downloads;


-- ============================================================
-- GRUP 2: Tabele de logging/tracking — 0 rânduri, înlocuite
-- ============================================================

-- audit_logs (0 rânduri) — înlocuit de cascade_audit_log (590 rânduri)
DROP POLICY IF EXISTS "audit_logs_admin_only" ON public.audit_logs;

-- admin_notifications (0 rânduri)
DROP POLICY IF EXISTS "admin_notifications_admin_only" ON public.admin_notifications;

-- download_logs (0 rânduri) — downloads are tracked în downloads (57 rânduri)
DROP POLICY IF EXISTS "download_logs_admin_all" ON public.download_logs;

-- download_links (0 rânduri)
DROP POLICY IF EXISTS "Allow service role full access on download_links" ON public.download_links;

-- download_rate_limits (0 rânduri) — rate limiting e în rate_limit_config (8 rânduri)
DROP POLICY IF EXISTS "download_rate_limits_admin_only" ON public.download_rate_limits;

-- image_security_metadata (0 rânduri)
DROP POLICY IF EXISTS "Public read access to image_security_metadata" ON public.image_security_metadata;
DROP POLICY IF EXISTS "Service role can manage image_security_metadata" ON public.image_security_metadata;


-- ============================================================
-- GRUP 3: Tabele premium — 0 rânduri, sistem nefinalizat/vechi
-- ============================================================

-- premium_memberships (0 rânduri)
DROP POLICY IF EXISTS "premium_memberships_select_own" ON public.premium_memberships;

-- premium_orders (0 rânduri) — orders are în orders (6 rânduri)
DROP POLICY IF EXISTS "premium_orders_admin_only" ON public.premium_orders;
DROP POLICY IF EXISTS "premium_orders_public_insert" ON public.premium_orders;

-- premium_plans (0 rânduri) — plans are în bfw_plans (3 rânduri)
DROP POLICY IF EXISTS "premium_plans_public_read" ON public.premium_plans;

-- used_tokens (0 rânduri)
DROP POLICY IF EXISTS "Service role can manage used_tokens" ON public.used_tokens;


-- ============================================================
-- GRUP 4: Media tables — toate 0 rânduri
-- ============================================================

-- media_files (0 rânduri)
DROP POLICY IF EXISTS "media_files_admin_only" ON public.media_files;

-- media_items (0 rânduri) — niciodată populat în versiunea actuală
DROP POLICY IF EXISTS "media_items_admin_all" ON public.media_items;
DROP POLICY IF EXISTS "media_items_public_read" ON public.media_items;
DROP POLICY IF EXISTS "media_items_user_access" ON public.media_items;
DROP POLICY IF EXISTS "media_items_user_insert" ON public.media_items;
DROP POLICY IF EXISTS "media_items_user_update" ON public.media_items;

-- media_uploads (0 rânduri)
DROP POLICY IF EXISTS "media_uploads_admin_only" ON public.media_uploads;


-- ============================================================
-- VERIFICARE după cleanup
-- ============================================================
-- SELECT COUNT(*) as policies_ramase FROM pg_policies WHERE schemaname = 'public';
--
-- SELECT tablename, COUNT(*) as nr
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- GROUP BY tablename
-- ORDER BY tablename;

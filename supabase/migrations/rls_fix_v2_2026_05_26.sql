-- =============================================================================
-- RLS FIX v2 — 2026-05-26
-- Bazat pe audit complet al celor 181 policies existente azi
-- Safe to re-run: toate DROP folosesc IF EXISTS
-- =============================================================================


-- ============================================================
-- SECTION 1: 🔴 SECURITATE — policies periculoase
-- ============================================================

-- 1a. cache_invalidations: orice user logat face ALL (INSERT/UPDATE/DELETE)
--     Invalidările de cache sunt operații interne — trebuie admin sau service_role
DROP POLICY IF EXISTS "Allow authenticated users to manage cache invalidations" ON public.cache_invalidations;

CREATE POLICY "admin_manage_cache_invalidations"
  ON public.cache_invalidations
  FOR ALL
  USING (
    (auth.role() = 'service_role'::text)
    OR (auth.uid() IN (SELECT user_id FROM profiles WHERE is_admin = true))
  )
  WITH CHECK (
    (auth.role() = 'service_role'::text)
    OR (auth.uid() IN (SELECT user_id FROM profiles WHERE is_admin = true))
  );


-- 1b. notification_settings: orice user logat face ALL fără filtru user_id
--     "auth.uid() IS NOT NULL" = orice user logat poate modifica setările TUTUROR
--     Există deja notification_settings_admin_only — policy asta e redundantă și periculoasă
DROP POLICY IF EXISTS "Authenticated users can manage notifications" ON public.notification_settings;


-- 1c. redirects: orice user logat adaugă/modifică/șterge redirecturi SEO
--     Redirecturile SEO sunt critice — accesul trebuie restricționat la admin
DROP POLICY IF EXISTS "Allow authenticated users to manage redirects" ON public.redirects;

CREATE POLICY "admin_manage_redirects"
  ON public.redirects
  FOR ALL
  USING (
    auth.uid() IN (SELECT user_id FROM profiles WHERE is_admin = true)
  )
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM profiles WHERE is_admin = true)
  );


-- ============================================================
-- SECTION 2: 🐛 BUG — live_wallpaper_categories admin rupt
-- ============================================================

-- profiles.id este PK auto-increment, NU foreign key spre auth.uid()
-- Trebuie profiles.user_id = auth.uid()
-- Efectul actual: niciun admin nu poate modifica categoriile de live wallpapers din panel!
DROP POLICY IF EXISTS "Only admins can modify live categories" ON public.live_wallpaper_categories;

CREATE POLICY "Only admins can modify live categories"
  ON public.live_wallpaper_categories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()   -- FIX: era profiles.id
        AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()   -- FIX: era profiles.id
        AND profiles.is_admin = true
    )
  );


-- ============================================================
-- SECTION 3: ⚠️ DUPLICATE — policies redundante
-- ============================================================

-- 3a. admin_settings: 2 policies ALL pentru admin
--     "Secure admin settings access" folosește check_admin_status (mai bun)
--     "admin_settings_access" folosește profiles.is_admin (mai vechi) → DROP
DROP POLICY IF EXISTS "admin_settings_access" ON public.admin_settings;


-- 3b. orders: orders_user_access (ALL) există alături de policies separate
--     ALL include DELETE — userii nu ar trebui să poată șterge comenzi
--     Policies separate (SELECT, INSERT, UPDATE) acoperă deja ce trebuie
DROP POLICY IF EXISTS "orders_user_access" ON public.orders;


-- 3c. ringtone_favorites: users_own_ringtone_favorites (ALL) acoperă deja
--     cele 3 policies per-operație — sunt complet redundante
DROP POLICY IF EXISTS "Users delete own ringtone favorites" ON public.ringtone_favorites;
DROP POLICY IF EXISTS "Users insert own ringtone favorites" ON public.ringtone_favorites;
DROP POLICY IF EXISTS "Users view own ringtone favorites" ON public.ringtone_favorites;


-- ============================================================
-- VERIFICARE — decomentează și rulează după migrație
-- ============================================================
-- SELECT tablename, policyname, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename IN (
--     'cache_invalidations', 'notification_settings', 'redirects',
--     'live_wallpaper_categories', 'admin_settings', 'orders', 'ringtone_favorites'
--   )
-- ORDER BY tablename, policyname;

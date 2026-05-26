-- =============================================================================
-- RLS AUDIT FIX — 2026-05-26
-- Identificat din audit CSV 17 (2026-05-22)
-- Rulează în Supabase SQL Editor > New Query > Run All
-- Safe to re-run: toate DROP folosesc IF EXISTS
-- =============================================================================


-- ============================================================
-- SECTION 1: 🔴 URGENTE — Securitate (4 policies)
-- ============================================================

-- 1a. rate_limits: policy cu roles={public} — oricine poate scrie
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;


-- 1b. promotional_offers: orice user logat poate DELETE ofertele
DROP POLICY IF EXISTS "Authenticated users can manage offers" ON public.promotional_offers;

-- Userii pot CITI ofertele (pentru a le afișa pe site)
CREATE POLICY IF NOT EXISTS "public_read_promotional_offers"
  ON public.promotional_offers
  FOR SELECT
  USING (true);

-- Doar adminul poate crea/edita/șterge
CREATE POLICY IF NOT EXISTS "admin_manage_promotional_offers"
  ON public.promotional_offers
  FOR ALL
  USING (check_admin_status(auth.uid()))
  WITH CHECK (check_admin_status(auth.uid()));


-- 1c. cta_button_settings: orice user logat poate modifica setările CTA
DROP POLICY IF EXISTS "Authenticated users can manage CTA settings" ON public.cta_button_settings;

-- Userii pot CITI setările CTA (pentru a le afișa pe site)
CREATE POLICY IF NOT EXISTS "public_read_cta_button_settings"
  ON public.cta_button_settings
  FOR SELECT
  USING (true);

-- Doar adminul poate modifica
CREATE POLICY IF NOT EXISTS "admin_manage_cta_button_settings"
  ON public.cta_button_settings
  FOR ALL
  USING (check_admin_status(auth.uid()))
  WITH CHECK (check_admin_status(auth.uid()));


-- 1d. purchase_requests: orice user logat vede comenzile TUTUROR
DROP POLICY IF EXISTS "Allow authenticated read on purchase_requests" ON public.purchase_requests;

-- Userul vede doar propriile cereri
-- NOTĂ: înlocuiește `user_id` cu coloana corectă dacă se numește altfel
CREATE POLICY IF NOT EXISTS "users_read_own_purchase_requests"
  ON public.purchase_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Userul poate crea cereri noi
CREATE POLICY IF NOT EXISTS "users_insert_own_purchase_requests"
  ON public.purchase_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Adminul vede și gestionează toate
CREATE POLICY IF NOT EXISTS "admin_manage_purchase_requests"
  ON public.purchase_requests
  FOR ALL
  USING (check_admin_status(auth.uid()))
  WITH CHECK (check_admin_status(auth.uid()));


-- ============================================================
-- SECTION 2: ⚠️ Conflicte logice (2 policies)
-- ============================================================

-- 2a. collections: policy cu qual=true câștigă mereu peste is_active=true
--     Efectul: toate colecțiile sunt publice, inclusiv cele inactive
DROP POLICY IF EXISTS "collections_public_read" ON public.collections;

-- 2b. homepage_content: idem — policy cu qual=true câștigă
DROP POLICY IF EXISTS "homepage_content_public_read" ON public.homepage_content;


-- ============================================================
-- SECTION 3: 🔧 Admin rupt — funcționalitate (6 tabele)
-- ============================================================

-- 3a. ringtones: policy admin folosea role='service_role' → adminul nu putea gestiona
--     din panel. DROP + recreare cu check_admin_status.
DROP POLICY IF EXISTS "ringtones_admin_all" ON public.ringtones;

CREATE POLICY "ringtones_admin_all"
  ON public.ringtones
  FOR ALL
  USING (check_admin_status(auth.uid()))
  WITH CHECK (check_admin_status(auth.uid()));


-- 3b–3f. Tabele SEO cu policies jwt role='admin' (nu funcționează niciodată)
--        Pattern: DROP policy veche (indiferent de nume) + CREATE policy nouă

-- content_freshness
DROP POLICY IF EXISTS "Admin can manage content_freshness" ON public.content_freshness;
DROP POLICY IF EXISTS "admin_content_freshness" ON public.content_freshness;
DROP POLICY IF EXISTS "content_freshness_admin" ON public.content_freshness;

CREATE POLICY IF NOT EXISTS "admin_manage_content_freshness"
  ON public.content_freshness
  FOR ALL
  USING (check_admin_status(auth.uid()))
  WITH CHECK (check_admin_status(auth.uid()));

-- internal_links
DROP POLICY IF EXISTS "Admin can manage internal_links" ON public.internal_links;
DROP POLICY IF EXISTS "admin_internal_links" ON public.internal_links;
DROP POLICY IF EXISTS "internal_links_admin" ON public.internal_links;

CREATE POLICY IF NOT EXISTS "admin_manage_internal_links"
  ON public.internal_links
  FOR ALL
  USING (check_admin_status(auth.uid()))
  WITH CHECK (check_admin_status(auth.uid()));

-- related_wallpapers
DROP POLICY IF EXISTS "Admin can manage related_wallpapers" ON public.related_wallpapers;
DROP POLICY IF EXISTS "admin_related_wallpapers" ON public.related_wallpapers;
DROP POLICY IF EXISTS "related_wallpapers_admin" ON public.related_wallpapers;

CREATE POLICY IF NOT EXISTS "admin_manage_related_wallpapers"
  ON public.related_wallpapers
  FOR ALL
  USING (check_admin_status(auth.uid()))
  WITH CHECK (check_admin_status(auth.uid()));

-- structured_data
DROP POLICY IF EXISTS "Admin can manage structured_data" ON public.structured_data;
DROP POLICY IF EXISTS "admin_structured_data" ON public.structured_data;
DROP POLICY IF EXISTS "structured_data_admin" ON public.structured_data;

CREATE POLICY IF NOT EXISTS "admin_manage_structured_data"
  ON public.structured_data
  FOR ALL
  USING (check_admin_status(auth.uid()))
  WITH CHECK (check_admin_status(auth.uid()));

-- voice_search_queries
DROP POLICY IF EXISTS "Admin can manage voice_search_queries" ON public.voice_search_queries;
DROP POLICY IF EXISTS "admin_voice_search_queries" ON public.voice_search_queries;
DROP POLICY IF EXISTS "voice_search_queries_admin" ON public.voice_search_queries;

CREATE POLICY IF NOT EXISTS "admin_manage_voice_search_queries"
  ON public.voice_search_queries
  FOR ALL
  USING (check_admin_status(auth.uid()))
  WITH CHECK (check_admin_status(auth.uid()));


-- ============================================================
-- SECTION 4: 📝 Blog mort — DROP toate policies (12 policies)
-- ============================================================

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE tablename IN ('blog_posts', 'blog_post_tags')
      AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;


-- ============================================================
-- SECTION 5: 🔁 Duplicate / dead policies (7 DROP-uri)
-- ============================================================

-- ad_settings: duplicat (există deja altă policy SELECT)
DROP POLICY IF EXISTS "Allow read access for ad settings" ON public.ad_settings;

-- live_wallpapers: duplicat cu policy activă
DROP POLICY IF EXISTS "public_read_live_wallpapers" ON public.live_wallpapers;

-- ringtone_favorites: 3 policies per-operație acoperite de o policy ALL
DROP POLICY IF EXISTS "Allow delete for own ringtone favorites" ON public.ringtone_favorites;
DROP POLICY IF EXISTS "Allow insert for own ringtone favorites" ON public.ringtone_favorites;
DROP POLICY IF EXISTS "Allow select for own ringtone favorites" ON public.ringtone_favorites;

-- media_items: policy cu email hardcodat (MirelaPhotography — proiect mort)
DROP POLICY IF EXISTS "admin_only_media_items" ON public.media_items;

-- settings: policy cu email hardcodat (proiect vechi)
DROP POLICY IF EXISTS "admin_only_settings" ON public.settings;

-- profiles: qual=false — se aplică la toți, indiferent; practic cod mort
DROP POLICY IF EXISTS "profiles_public_limited_info" ON public.profiles;


-- ============================================================
-- VERIFICARE — rulează după migrație pentru a confirma
-- ============================================================
-- SELECT tablename, policyname, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename IN (
--     'rate_limits', 'promotional_offers', 'cta_button_settings', 'purchase_requests',
--     'collections', 'homepage_content', 'ringtones',
--     'content_freshness', 'internal_links', 'related_wallpapers', 'structured_data', 'voice_search_queries',
--     'blog_posts', 'blog_post_tags',
--     'ad_settings', 'live_wallpapers', 'ringtone_favorites', 'media_items', 'settings', 'profiles'
--   )
-- ORDER BY tablename, policyname;

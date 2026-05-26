-- =============================================================================
-- RLS CLEANUP — Tabele Stripe demo din proiecte vechi
-- 2026-05-26
-- Confirmat: aceste tabele au fost demo Stripe în versiunea Vite anterioară
-- și iterații și mai vechi. Niciuna nu este folosită în Next.js actual.
-- Safe to re-run: toate DROP folosesc IF EXISTS
-- =============================================================================


-- ============================================================
-- orders (6 rânduri demo) — checkout Stripe vechi, absent din Next.js
-- ============================================================
DROP POLICY IF EXISTS "Admins can update order status" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own pending orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
-- Nota: orders_user_access (ALL) a fost deja sters in rls_fix_v2


-- ============================================================
-- order_items (4 rânduri demo)
-- ============================================================
DROP POLICY IF EXISTS "Users can insert items for their orders" ON public.order_items;
DROP POLICY IF EXISTS "Users can view their order items" ON public.order_items;


-- ============================================================
-- order_status_logs (7 rânduri demo)
-- ============================================================
DROP POLICY IF EXISTS "Allow service role full access on order_status_logs" ON public.order_status_logs;


-- ============================================================
-- purchase_requests (7 rânduri demo)
-- Nota: "Allow authenticated read" a fost deja sters in rls_fix_v2
-- ============================================================
DROP POLICY IF EXISTS "Allow public insert on purchase_requests" ON public.purchase_requests;
DROP POLICY IF EXISTS "Allow service role full access on purchase_requests" ON public.purchase_requests;
DROP POLICY IF EXISTS "purchase_requests_admin_only" ON public.purchase_requests;


-- ============================================================
-- premium_membership_requests (7 rânduri demo) — Edge Function veche Vite
-- ============================================================
DROP POLICY IF EXISTS "premium_membership_requests_admin_all" ON public.premium_membership_requests;
DROP POLICY IF EXISTS "premium_membership_requests_public_insert" ON public.premium_membership_requests;


-- ============================================================
-- premium_purchase_requests (2 rânduri demo)
-- ============================================================
DROP POLICY IF EXISTS "premium_purchase_requests_admin_only" ON public.premium_purchase_requests;
DROP POLICY IF EXISTS "premium_purchase_requests_public_insert" ON public.premium_purchase_requests;


-- ============================================================
-- premium_requests (1 rând demo) — folosit în Vite cu premium-request Edge Fn
-- ============================================================
DROP POLICY IF EXISTS "Secure premium requests admin access" ON public.premium_requests;
DROP POLICY IF EXISTS "premium_requests_public_insert" ON public.premium_requests;


-- ============================================================
-- bfw_plans (3 rânduri demo) — planuri Stripe din Vite
-- ============================================================
DROP POLICY IF EXISTS "Plans are publicly readable" ON public.bfw_plans;


-- ============================================================
-- VERIFICARE finala — decomentează după rulare
-- ============================================================
-- SELECT COUNT(*) as total_policies FROM pg_policies WHERE schemaname = 'public';
--
-- -- Tabele fără nicio policy rămasă (complet curate):
-- SELECT t.tablename
-- FROM pg_tables t
-- LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.schemaname = 'public'
-- WHERE t.schemaname = 'public'
--   AND t.tablename IN (
--     'orders','order_items','order_status_logs',
--     'purchase_requests','premium_membership_requests',
--     'premium_purchase_requests','premium_requests','bfw_plans'
--   )
--   AND p.policyname IS NULL
-- ORDER BY t.tablename;

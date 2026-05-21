-- ============================================================
-- BACKUP — Funcții șterse din Supabase pe 2026-05-22
-- Audit: triggere duplicate + funcții zombie + funcții neapelate
--
-- Aceste funcții AU FOST ȘTERSE din baza de date.
-- Fișierul există doar ca referință istorică.
-- NU rula acest fișier — va recrea funcțiile șterse.
-- ============================================================


-- ------------------------------------------------------------
-- GRUP 1: Fostele triggere duplicate de search vector
-- Triggerele au fost șterse la 2026-05-21 (Pasul 1).
-- Funcțiile de mai jos au rămas fără trigger — zombie.
-- Trigger păstrat: update_wallpapers_search_vector_trigger
--   → apelează update_wallpapers_search_vector() (versiunea bogată cu SEO fields)
-- ------------------------------------------------------------

-- Versiune simplă (title + description + tags english) — suprascrisa de altele
CREATE OR REPLACE FUNCTION public.update_wallpaper_search_vector()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$function$;

-- Versiune simplă cu config 'simple' pe tags — suprascrisa de altele
CREATE OR REPLACE FUNCTION public.wallpapers_search_vector_update()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('simple',  coalesce(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$function$;


-- ------------------------------------------------------------
-- GRUP 2: Funcție zombie — scrie în tabelul wallpaper_downloads
-- care nu mai există în baza de date. Niciun trigger nu o apela.
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_wallpaper_downloads()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO wallpaper_downloads (wallpaper_id, download_count)
    VALUES (NEW.wallpaper_id, 1)
    ON CONFLICT (wallpaper_id)
    DO UPDATE SET download_count = wallpaper_downloads.download_count + 1;
    RETURN NEW;
END;
$function$;


-- ------------------------------------------------------------
-- GRUP 3: Funcție de migrație one-time — conține DROP POLICY + CREATE POLICY
-- Nu ar trebui să existe ca funcție permanentă.
-- ÎNAINTE de ștergere: verifică că politicile din storage bucket 'live-videos'
-- sunt deja configurate corect în Supabase Storage.
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.setup_live_videos_policies()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    DROP POLICY IF EXISTS "Admin Insert for live-videos bucket" ON storage.objects;
    DROP POLICY IF EXISTS "Admin Update for live-videos bucket" ON storage.objects;
    DROP POLICY IF EXISTS "Admin Delete for live-videos bucket" ON storage.objects;
    DROP POLICY IF EXISTS "Public Access for live-videos bucket" ON storage.objects;

    CREATE POLICY "Admin Insert for live-videos bucket" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'live-videos' AND
        auth.uid() IN (SELECT user_id FROM profiles WHERE is_admin = true)
    );
    CREATE POLICY "Admin Update for live-videos bucket" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'live-videos' AND
        auth.uid() IN (SELECT user_id FROM profiles WHERE is_admin = true)
    );
    CREATE POLICY "Admin Delete for live-videos bucket" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'live-videos' AND
        auth.uid() IN (SELECT user_id FROM profiles WHERE is_admin = true)
    );
    CREATE POLICY "Public Access for live-videos bucket" ON storage.objects
    FOR SELECT USING (bucket_id = 'live-videos');

    RETURN 'Policies created successfully';
END;
$function$;


-- ------------------------------------------------------------
-- GRUP 4: Funcții neapelate din aplicație — nu afectează nicio funcționalitate
-- ------------------------------------------------------------

-- Versiune simplificată a get_categories_with_counts — returnează doar 4 câmpuri
CREATE OR REPLACE FUNCTION public.get_categories_with_wallpaper_counts()
 RETURNS TABLE(id integer, name character varying, slug character varying, wallpaper_count bigint)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.slug, COUNT(w.id) as wallpaper_count
  FROM categories c
  LEFT JOIN wallpapers w ON c.id = w.category_id AND w.is_published = true AND w.is_active = true
  GROUP BY c.id, c.name, c.slug
  ORDER BY c.name;
END;
$function$;

-- Versiune veche de listing wallpapers cu OFFSET pagination
CREATE OR REPLACE FUNCTION public.get_wallpapers_optimized(
  p_category_id integer DEFAULT NULL,
  p_is_premium boolean DEFAULT NULL,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
 RETURNS TABLE(id integer, title text, slug text, thumbnail_url text, is_premium boolean, download_count integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT w.id, w.title, w.slug, w.thumbnail_url, w.is_premium, w.download_count, w.created_at
  FROM wallpapers w
  WHERE w.is_published = true
    AND (p_category_id IS NULL OR w.category_id = p_category_id)
    AND (p_is_premium IS NULL OR w.is_premium = p_is_premium)
  ORDER BY w.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$function$;

-- Versiune cursor-based pagination cu responsive_images — înlocuită de query direct Supabase JS
CREATE OR REPLACE FUNCTION public.get_wallpapers_infinite_scroll(
  p_last_id integer DEFAULT NULL,
  p_category_id integer DEFAULT NULL,
  p_is_premium boolean DEFAULT NULL,
  p_device_type text DEFAULT NULL,
  p_limit integer DEFAULT 20,
  p_sort_by text DEFAULT 'newest'
)
 RETURNS TABLE(id integer, title text, slug text, thumbnail_url text, is_premium boolean, download_count integer, created_at timestamp with time zone, width integer, height integer, category_name text, category_slug text, responsive_images jsonb, has_more boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    rec RECORD;
    result_count INTEGER := 0;
    max_limit INTEGER := p_limit + 1;
BEGIN
    FOR rec IN
        SELECT w.id, w.title, w.slug, w.thumbnail_url, w.is_premium, w.download_count,
               w.created_at, w.width, w.height, c.name as category_name, c.slug as category_slug,
               CASE WHEN w.thumbnail_url IS NOT NULL THEN
                   jsonb_build_object('small', w.thumbnail_url,
                       'medium', replace(w.thumbnail_url, '.jpg', '_medium.jpg'),
                       'large', replace(w.thumbnail_url, '.jpg', '_large.jpg'),
                       'webp_small', replace(w.thumbnail_url, '.jpg', '_small.webp'),
                       'webp_medium', replace(w.thumbnail_url, '.jpg', '_medium.webp'))
               ELSE NULL END as responsive_images,
               CASE WHEN result_count < p_limit THEN false ELSE true END as has_more
        FROM wallpapers w LEFT JOIN categories c ON c.id = w.category_id
        WHERE w.is_published = true AND w.is_active = true
          AND (p_last_id IS NULL OR (CASE WHEN p_sort_by = 'oldest' THEN w.id > p_last_id ELSE w.id < p_last_id END))
          AND (p_category_id IS NULL OR w.category_id = p_category_id)
          AND (p_is_premium IS NULL OR w.is_premium = p_is_premium)
          AND (p_device_type IS NULL OR w.device_type = p_device_type)
        ORDER BY CASE WHEN p_sort_by = 'popular' THEN w.download_count
                      WHEN p_sort_by = 'oldest' THEN extract(EPOCH FROM w.created_at)
                      ELSE extract(EPOCH FROM w.created_at) END DESC
        LIMIT max_limit
    LOOP
        result_count := result_count + 1;
        IF result_count <= p_limit THEN
            id := rec.id; title := rec.title; slug := rec.slug;
            thumbnail_url := rec.thumbnail_url; is_premium := rec.is_premium;
            download_count := rec.download_count; created_at := rec.created_at;
            width := rec.width; height := rec.height;
            category_name := rec.category_name; category_slug := rec.category_slug;
            responsive_images := rec.responsive_images;
            has_more := result_count = max_limit;
            RETURN NEXT;
        END IF;
    END LOOP;
END;
$function$;

-- Increment plays counter — nu e apelat din aplicație în prezent
CREATE OR REPLACE FUNCTION public.increment_ringtone_plays(ringtone_id_input integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE ringtones
  SET plays_count = COALESCE(plays_count, 0) + 1
  WHERE id = ringtone_id_input AND is_active = true AND is_published = true;
END;
$function$;

-- Collections cu logică seasonală — nu e apelat din aplicație în prezent
-- NOTĂ: Aceasta e o funcție valoroasă cu logică complexă. Poate fi reactivată.
CREATE OR REPLACE FUNCTION public.get_collections_with_stats()
 RETURNS TABLE(id text, name character varying, slug character varying, description text, icon_name character varying, cover_image_url text, color_theme jsonb, is_seasonal boolean, season_start_month integer, season_end_month integer, is_featured boolean, is_active boolean, sort_order integer, wallpaper_count bigint, view_count integer, is_currently_seasonal boolean, seasonal_priority integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT c.id::text, c.name, c.slug, c.description, c.icon_name, c.cover_image_url,
           c.color_theme, c.is_seasonal, c.season_start_month, c.season_end_month,
           c.is_featured, c.is_active, c.sort_order,
           COALESCE(wc.wallpaper_count, 0),
           COALESCE(c.view_count, 0),
           (CASE WHEN c.is_seasonal AND c.season_start_month IS NOT NULL AND c.season_end_month IS NOT NULL THEN
               CASE WHEN c.season_start_month <= c.season_end_month THEN
                   EXTRACT(MONTH FROM CURRENT_DATE) >= c.season_start_month AND EXTRACT(MONTH FROM CURRENT_DATE) <= c.season_end_month
               ELSE
                   EXTRACT(MONTH FROM CURRENT_DATE) >= c.season_start_month OR EXTRACT(MONTH FROM CURRENT_DATE) <= c.season_end_month
               END
           ELSE false END),
           (CASE WHEN c.is_seasonal THEN c.sort_order ELSE 999 END)
    FROM collections c
    LEFT JOIN (
        SELECT cw.collection_id, COUNT(w.id) as wallpaper_count
        FROM collection_wallpapers cw
        INNER JOIN wallpapers w ON cw.wallpaper_id = w.id
        WHERE w.is_published = true AND w.is_active = true
        GROUP BY cw.collection_id
    ) wc ON c.id = wc.collection_id
    WHERE c.is_active = true
    ORDER BY c.is_featured DESC,
        (CASE WHEN c.is_seasonal AND c.season_start_month IS NOT NULL AND c.season_end_month IS NOT NULL THEN
            CASE WHEN c.season_start_month <= c.season_end_month THEN
                EXTRACT(MONTH FROM CURRENT_DATE) >= c.season_start_month AND EXTRACT(MONTH FROM CURRENT_DATE) <= c.season_end_month
            ELSE EXTRACT(MONTH FROM CURRENT_DATE) >= c.season_start_month OR EXTRACT(MONTH FROM CURRENT_DATE) <= c.season_end_month
            END
        ELSE false END) DESC,
        c.sort_order ASC, c.name ASC;
END;
$function$;

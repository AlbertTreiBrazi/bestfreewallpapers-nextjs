-- Verificare qual pentru policies nesigure — rulează rapid în SQL Editor
SELECT
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND (tablename, policyname) IN (
    ('ringtones',              'ringtones_admin_all'),
    ('wallpapers',             'wallpapers_admin_full_access'),
    ('wallpapers',             'wallpapers_service_role_full_access'),
    ('wallpapers',             'wallpapers_authenticated_read'),
    ('wallpapers',             'wallpapers_public_read'),
    ('cache_invalidations',    'Allow authenticated users to manage cache invalidations'),
    ('notification_settings',  'Authenticated users can manage notifications'),
    ('notification_settings',  'notification_settings_admin_only'),
    ('redirects',              'Allow authenticated users to manage redirects'),
    ('orders',                 'orders_user_access'),
    ('admin_settings',         'admin_settings_access'),
    ('live_wallpaper_categories', 'Only admins can modify live categories')
  )
ORDER BY tablename, policyname;

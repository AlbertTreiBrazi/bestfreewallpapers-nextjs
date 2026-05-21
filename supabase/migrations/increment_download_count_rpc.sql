-- RPC: increment_download_count
-- Bypasses RLS via SECURITY DEFINER so anon/authenticated users can increment counters.
-- Run this once in Supabase SQL Editor before deploying the frontend update.

CREATE OR REPLACE FUNCTION public.increment_download_count(
  item_id   INT,
  item_type TEXT   -- 'wallpaper' | 'ringtone' | 'live'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF item_type = 'wallpaper' THEN
    UPDATE wallpapers
    SET download_count = download_count + 1
    WHERE id = item_id;
  ELSIF item_type = 'ringtone' THEN
    UPDATE ringtones
    SET downloads_count = downloads_count + 1
    WHERE id = item_id;
  ELSIF item_type = 'live' THEN
    UPDATE live_wallpapers
    SET downloads_count = downloads_count + 1
    WHERE id = item_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_download_count TO anon;
GRANT EXECUTE ON FUNCTION public.increment_download_count TO authenticated;

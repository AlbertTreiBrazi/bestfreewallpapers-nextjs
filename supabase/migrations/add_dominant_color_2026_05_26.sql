-- Add dominant_color column to wallpapers table
-- Values: 'dark' | 'light' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink'
-- NULL means not yet extracted

ALTER TABLE wallpapers
  ADD COLUMN IF NOT EXISTS dominant_color VARCHAR(20) DEFAULT NULL;

-- Index for filtering
CREATE INDEX IF NOT EXISTS idx_wallpapers_dominant_color
  ON wallpapers (dominant_color)
  WHERE dominant_color IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN wallpapers.dominant_color IS
  'Dominant color bucket extracted from thumbnail. One of: dark, light, red, orange, yellow, green, blue, purple, pink. NULL = not yet extracted.';

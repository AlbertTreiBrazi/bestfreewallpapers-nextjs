export type ColorBucket =
  | 'dark' | 'light'
  | 'red' | 'orange' | 'yellow'
  | 'green' | 'blue' | 'purple' | 'pink'

/** Map an RGB value to one of 9 color buckets */
export function rgbToColorBucket(r: number, g: number, b: number): ColorBucket {
  // Convert to HSL
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2

  // Lightness shortcuts
  if (l < 0.18) return 'dark'
  if (l > 0.88) return 'light'

  // Saturation — very desaturated = near-gray
  const s = max === min ? 0 : l > 0.5
    ? (max - min) / (2 - max - min)
    : (max - min) / (max + min)
  if (s < 0.12) return l < 0.5 ? 'dark' : 'light'

  // Hue
  let h = 0
  const d = max - min
  if (max === rn)       h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
  else if (max === gn)  h = ((bn - rn) / d + 2) / 6
  else                  h = ((rn - gn) / d + 4) / 6

  const deg = h * 360

  if (deg < 20 || deg >= 345) return 'red'
  if (deg < 45)  return 'orange'
  if (deg < 70)  return 'yellow'
  if (deg < 165) return 'green'
  if (deg < 255) return 'blue'
  if (deg < 290) return 'purple'
  return 'pink'
}

export interface ColorMeta {
  value: ColorBucket
  label: string
  /** Tailwind bg class for the swatch */
  bg: string
  /** Tailwind ring/border class for selected state */
  ring: string
  /** Hex preview for inline style fallback */
  hex: string
}

export const COLOR_OPTIONS: ColorMeta[] = [
  { value: 'dark',   label: 'Dark',   bg: 'bg-gray-900',   ring: 'ring-gray-400',   hex: '#111111' },
  { value: 'light',  label: 'Light',  bg: 'bg-gray-100',   ring: 'ring-gray-400',   hex: '#f3f4f6' },
  { value: 'red',    label: 'Red',    bg: 'bg-red-500',    ring: 'ring-red-400',    hex: '#ef4444' },
  { value: 'orange', label: 'Orange', bg: 'bg-orange-400', ring: 'ring-orange-400', hex: '#fb923c' },
  { value: 'yellow', label: 'Yellow', bg: 'bg-yellow-400', ring: 'ring-yellow-400', hex: '#facc15' },
  { value: 'green',  label: 'Green',  bg: 'bg-green-500',  ring: 'ring-green-400',  hex: '#22c55e' },
  { value: 'blue',   label: 'Blue',   bg: 'bg-blue-500',   ring: 'ring-blue-400',   hex: '#3b82f6' },
  { value: 'purple', label: 'Purple', bg: 'bg-purple-500', ring: 'ring-purple-400', hex: '#a855f7' },
  { value: 'pink',   label: 'Pink',   bg: 'bg-pink-400',   ring: 'ring-pink-400',   hex: '#f472b6' },
]

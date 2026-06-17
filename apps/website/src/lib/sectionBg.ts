import type { CSSProperties } from 'react'

export interface SectionBgData {
  type: 'default' | 'color' | 'gradient' | 'image'
  color1?: string
  color2?: string
  dir?: string
  image_url?: string
}

const HEX_RE = /^#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3}(?:[0-9a-fA-F]{2})?)?$/

function safeHex(v: string | null | undefined): string | null {
  if (!v) return null
  const t = v.trim()
  return HEX_RE.test(t) ? t : null
}

// Whitelist prevents any CSS injection from a compromised DB value
const SAFE_DIRS = new Set([
  'to top', 'to bottom', 'to left', 'to right',
  'to top right', 'to top left', 'to bottom right', 'to bottom left',
])

export function parseSectionBg(json?: string | null): {
  style: CSSProperties
  imageUrl: string | null
} {
  if (!json) return { style: {}, imageUrl: null }
  try {
    const bg = JSON.parse(json) as SectionBgData
    if (bg.type === 'color') {
      const c = safeHex(bg.color1)
      if (c) return { style: { backgroundColor: c }, imageUrl: null }
    }
    if (bg.type === 'gradient') {
      const c1 = safeHex(bg.color1)
      const c2 = safeHex(bg.color2)
      const dir = bg.dir && SAFE_DIRS.has(bg.dir) ? bg.dir : 'to bottom right'
      if (c1 && c2) return { style: { background: `linear-gradient(${dir}, ${c1}, ${c2})` }, imageUrl: null }
    }
    if (bg.type === 'image' && bg.image_url) {
      const url = bg.image_url.trim()
      if (/^https?:\/\//.test(url) || url.startsWith('/')) {
        return { style: {}, imageUrl: url }
      }
    }
  } catch { /* ignore */ }
  return { style: {}, imageUrl: null }
}

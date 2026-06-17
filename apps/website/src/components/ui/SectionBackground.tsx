'use client'

import Image from 'next/image'
import { parseSectionBg } from '@/lib/sectionBg'

interface Props {
  bgJson?: string | null
  /** Image opacity 0-100 (default 20) */
  opacity?: number
}

/**
 * Drop this as the first child of any `relative overflow-hidden` section.
 * Renders nothing when the setting is absent or type === 'default'.
 * Visually overlays the section's existing Tailwind background class.
 */
export function SectionBackground({ bgJson, opacity = 20 }: Props) {
  const { style, imageUrl } = parseSectionBg(bgJson)
  const hasColor = style.backgroundColor || style.background
  if (!hasColor && !imageUrl) return null
  return (
    <>
      {hasColor && <div className="absolute inset-0" style={style} />}
      {imageUrl && (
        <Image
          src={imageUrl}
          alt=""
          fill
          className="object-cover"
          style={{ opacity: opacity / 100 }}
          unoptimized
        />
      )}
    </>
  )
}

'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ImageCropperModal } from './ImageCropperModal'
import { uploadMedia } from '@/lib/api'

interface BgData {
  type: 'default' | 'color' | 'gradient' | 'image'
  color1?: string
  color2?: string
  dir?: string
  image_url?: string
}

const DIRS = [
  { label: '↖', value: 'to top left' },
  { label: '↑', value: 'to top' },
  { label: '↗', value: 'to top right' },
  { label: '←', value: 'to left' },
  { label: null, value: null },
  { label: '→', value: 'to right' },
  { label: '↙', value: 'to bottom left' },
  { label: '↓', value: 'to bottom' },
  { label: '↘', value: 'to bottom right' },
]

const TYPES = ['default', 'color', 'gradient', 'image'] as const

function parse(v: string | null): BgData {
  if (!v) return { type: 'default' }
  try { return JSON.parse(v) as BgData } catch { return { type: 'default' } }
}

const TYPE_DEFAULTS: Record<string, Partial<BgData>> = {
  default:  { type: 'default' },
  color:    { type: 'color',    color1: '#0A0F1E' },
  gradient: { type: 'gradient', color1: '#0A0F1E', color2: '#0D1526', dir: 'to bottom right' },
  image:    { type: 'image',    image_url: '' },
}

interface Props {
  value: string | null
  onChange: (json: string) => void
  label: string
  hint?: string
  aspect?: number
}

export function SectionBgEditor({ value, onChange, label, hint, aspect = 21 / 9 }: Props) {
  const bg       = parse(value)
  const fileRef  = useRef<HTMLInputElement>(null)
  const [cropFile,  setCropFile]  = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  function update(patch: Partial<BgData>) {
    onChange(JSON.stringify({ ...bg, ...patch }))
  }

  function setType(t: BgData['type']) {
    onChange(JSON.stringify({ ...TYPE_DEFAULTS[t] }))
  }

  async function doUpload(file: File) {
    setUploading(true)
    try {
      const res = await uploadMedia(file, 'sections')
      update({ type: 'image', image_url: res.url })
    } finally { setUploading(false) }
  }

  /* ── live preview style ── */
  const previewStyle: React.CSSProperties =
    bg.type === 'color'    && bg.color1 ? { backgroundColor: bg.color1 } :
    bg.type === 'gradient' && bg.color1 && bg.color2
      ? { background: `linear-gradient(${bg.dir ?? 'to bottom right'}, ${bg.color1}, ${bg.color2})` }
      : { backgroundColor: '#0c111d' }

  const HEX_INPUT = 'w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-xs font-mono focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100'
  const SWATCH   = 'h-8 w-9 rounded cursor-pointer border border-slate-200 dark:border-slate-600 p-0.5 shrink-0'

  return (
    <div className="border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden">
      {/* Preview strip */}
      <div className="relative h-20 overflow-hidden">
        <div className="absolute inset-0" style={previewStyle} />
        {bg.type === 'image' && bg.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bg.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />
        )}
        {bg.type === 'default' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded">Using theme default</span>
          </div>
        )}
        <div className="absolute bottom-2 left-3">
          <p className="text-white text-xs font-semibold drop-shadow-sm">{label}</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {hint && <p className="text-[11px] text-slate-400">{hint}</p>}

        {/* Type selector */}
        <div className="flex gap-1">
          {TYPES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={[
                'flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                bg.type === t
                  ? 'bg-[#C9A84C] text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600',
              ].join(' ')}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Color */}
        {bg.type === 'color' && (
          <div className="flex items-center gap-2">
            <input type="color" value={bg.color1 ?? '#0A0F1E'} onChange={e => update({ color1: e.target.value })} className={SWATCH} />
            <input type="text" value={bg.color1 ?? ''} onChange={e => update({ color1: e.target.value })} placeholder="#0A0F1E" maxLength={9} className={HEX_INPUT} />
          </div>
        )}

        {/* Gradient */}
        {bg.type === 'gradient' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] text-slate-400 mb-1">From</p>
                <div className="flex items-center gap-1.5">
                  <input type="color" value={bg.color1 ?? '#0A0F1E'} onChange={e => update({ color1: e.target.value })} className={SWATCH} />
                  <input type="text" value={bg.color1 ?? ''} onChange={e => update({ color1: e.target.value })} placeholder="#0A0F1E" maxLength={9} className={HEX_INPUT} />
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 mb-1">To</p>
                <div className="flex items-center gap-1.5">
                  <input type="color" value={bg.color2 ?? '#0D1526'} onChange={e => update({ color2: e.target.value })} className={SWATCH} />
                  <input type="text" value={bg.color2 ?? ''} onChange={e => update({ color2: e.target.value })} placeholder="#0D1526" maxLength={9} className={HEX_INPUT} />
                </div>
              </div>
            </div>

            {/* Direction grid */}
            <div>
              <p className="text-[10px] text-slate-400 mb-1.5">Direction</p>
              <div className="grid grid-cols-3 gap-0.5 w-[88px]">
                {DIRS.map(({ label: dl, value: dv }, idx) =>
                  dv ? (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => update({ dir: dv })}
                      className={[
                        'w-7 h-7 rounded flex items-center justify-center text-sm transition-colors',
                        bg.dir === dv
                          ? 'bg-[#C9A84C] text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600',
                      ].join(' ')}
                    >
                      {dl}
                    </button>
                  ) : (
                    <div key={idx} className="w-7 h-7 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-600" />
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Image */}
        {bg.type === 'image' && (
          <div className="space-y-2">
            {cropFile && (
              <ImageCropperModal
                file={cropFile}
                aspect={aspect}
                maxWidth={1920}
                quality={0.82}
                onDone={f => { setCropFile(null); doUpload(f) }}
                onCancel={() => setCropFile(null)}
              />
            )}
            {bg.image_url && (
              <div className="relative h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600">
                <Image src={bg.image_url} alt="" fill className="object-cover" unoptimized />
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 disabled:opacity-50 transition-colors"
              >
                {uploading ? 'Uploading…' : bg.image_url ? 'Replace' : 'Upload image'}
              </button>
              {bg.image_url && (
                <button type="button" onClick={() => update({ image_url: '' })} className="text-xs text-red-500 hover:underline">
                  Remove
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                aria-label={`Upload image for ${label}`}
                onChange={e => { const f = e.target.files?.[0]; if (f) setCropFile(f); e.target.value = '' }}
              />
            </div>
            <input
              type="url"
              value={bg.image_url ?? ''}
              onChange={e => update({ image_url: e.target.value })}
              placeholder="Or paste an image URL…"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-xs focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
          </div>
        )}
      </div>
    </div>
  )
}

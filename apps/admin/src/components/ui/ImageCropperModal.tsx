'use client'

import { useCallback, useRef, useState } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop, type Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface Props {
  file: File
  aspect?: number     // e.g. 16/9; undefined = free crop
  maxWidth?: number   // output max px wide (default 1920)
  quality?: number    // WebP quality 0-1 (default 0.82)
  onDone: (file: File) => void
  onCancel: () => void
}

function initCrop(w: number, h: number, aspect?: number): Crop {
  if (aspect) {
    return centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, w, h), w, h)
  }
  return { unit: '%', x: 5, y: 5, width: 90, height: 90 }
}

export function ImageCropperModal({ file, aspect, maxWidth = 1920, quality = 0.82, onDone, onCancel }: Props) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [src]  = useState(() => URL.createObjectURL(file))
  const [crop, setCrop] = useState<Crop>()
  const [done, setDone] = useState<Crop>()
  const [busy, setBusy] = useState(false)

  const onLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const c = initCrop(width, height, aspect)
    setCrop(c)
    setDone(c)
  }, [aspect])

  async function apply() {
    const img = imgRef.current
    if (!img || !done?.width) return
    setBusy(true)
    try {
      const sx = img.naturalWidth / img.width
      const sy = img.naturalHeight / img.height
      let cw = done.width * sx
      let ch = done.height * sy
      if (cw > maxWidth) { ch = (ch / cw) * maxWidth; cw = maxWidth }
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(cw)
      canvas.height = Math.round(ch)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, done.x * sx, done.y * sy, done.width * sx, done.height * sy, 0, 0, canvas.width, canvas.height)
      const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/webp', quality))
      if (!blob) throw new Error('Canvas export failed')
      const out = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' })
      onDone(out)
    } finally {
      setBusy(false)
    }
  }

  const aspectLabel = aspect
    ? `${aspect >= 2 ? Math.round(aspect * 10) / 10 : aspect.toFixed(2)}:1 locked`
    : 'free crop'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100">Crop &amp; Compress</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {aspectLabel} · WebP {Math.round(quality * 100)}% quality · max {maxWidth}px wide
            </p>
          </div>
          <button
            onClick={onCancel}
            aria-label="Close cropper"
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Crop area */}
        <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
          <ReactCrop
            crop={crop}
            onChange={setCrop}
            onComplete={setDone}
            aspect={aspect}
            minWidth={50}
            keepSelection
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={src}
              alt="Crop preview"
              onLoad={onLoad}
              className="max-h-[55vh] max-w-full block"
            />
          </ReactCrop>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-400">Drag handles to adjust · output will be compressed to WebP</p>
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={apply}
              disabled={busy || !done?.width}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#C9A84C] text-white hover:bg-[#b8963e] disabled:opacity-50 transition-colors"
            >
              {busy ? 'Processing…' : 'Crop & Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

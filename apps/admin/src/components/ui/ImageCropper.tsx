'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { IconCrop, IconRotateCcw, IconCheck, IconX } from '@/components/ui/icons'

interface Props {
  src: string
  aspect?: number
  onConfirm: (blob: Blob) => void
  onCancel: () => void
}

interface Rect { x: number; y: number; w: number; h: number }

function clamp(v: number, min: number, max: number) { return Math.min(max, Math.max(min, v)) }

export function ImageCropper({ src, aspect, onConfirm, onCancel }: Props) {
  const imgRef     = useRef<HTMLImageElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const boxRef     = useRef<HTMLDivElement>(null)

  const [natural, setNatural] = useState({ w: 1, h: 1 })
  const [display, setDisplay] = useState({ w: 1, h: 1 })
  const [crop,    setCrop]    = useState<Rect>({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 })
  const drag      = useRef<{ edge: string; sx: number; sy: number; cr: Rect } | null>(null)

  const applyAspect = useCallback((r: Rect, dw: number, dh: number, fixed: 'w' | 'h' = 'w'): Rect => {
    if (!aspect) return r
    if (fixed === 'w') {
      const newH = (r.w * dw) / (aspect * dh) * dh / dh
      return { ...r, h: clamp(newH, 0.1, 1 - r.y) }
    }
    const newW = (r.h * dh * aspect) / dh
    return { ...r, w: clamp(newW, 0.1, 1 - r.x) }
  }, [aspect])

  useEffect(() => {
    const img = imgRef.current
    if (!img) return
    function onLoad() {
      const nw = img!.naturalWidth || 1
      const nh = img!.naturalHeight || 1
      const dw = img!.offsetWidth  || 1
      const dh = img!.offsetHeight || 1
      setNatural({ w: nw, h: nh })
      setDisplay({ w: dw, h: dh })
      if (aspect) {
        const rh = (0.8 * dw) / (aspect * dh) * 1
        setCrop({ x: 0.1, y: 0.1, w: 0.8, h: clamp(rh, 0.1, 0.8) })
      } else {
        setCrop({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 })
      }
    }
    if (img.complete) { onLoad() } else { img.addEventListener('load', onLoad) }
    return () => img.removeEventListener('load', onLoad)
  }, [src, aspect])

  function getEdge(e: React.PointerEvent): string {
    const box = boxRef.current
    if (!box) return 'move'
    const r   = box.getBoundingClientRect()
    const px  = (e.clientX - r.left) / r.width
    const py  = (e.clientY - r.top)  / r.height
    const thr = 0.15
    const edges = [
      px < thr && py < thr ? 'nw' : null,
      px > (1 - thr) && py < thr ? 'ne' : null,
      px < thr && py > (1 - thr) ? 'sw' : null,
      px > (1 - thr) && py > (1 - thr) ? 'se' : null,
    ]
    return edges.find(Boolean) ?? 'move'
  }

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { edge: getEdge(e), sx: e.clientX, sy: e.clientY, cr: { ...crop } }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return
    const { edge, sx, sy, cr } = drag.current
    const dx = (e.clientX - sx) / display.w
    const dy = (e.clientY - sy) / display.h
    let { x, y, w, h } = cr

    if (edge === 'move') {
      x = clamp(x + dx, 0, 1 - w)
      y = clamp(y + dy, 0, 1 - h)
    } else {
      if (edge.includes('e')) w = clamp(w + dx, 0.05, 1 - x)
      if (edge.includes('s')) h = clamp(h + dy, 0.05, 1 - y)
      if (edge.includes('w')) { const nx = clamp(x + dx, 0, x + w - 0.05); w = x + w - nx; x = nx }
      if (edge.includes('n')) { const ny = clamp(y + dy, 0, y + h - 0.05); h = y + h - ny; y = ny }
    }

    let r: Rect = { x, y, w, h }
    if (aspect) {
      if (edge.includes('e') || edge.includes('w') || edge === 'move') {
        r = applyAspect(r, display.w, display.h, 'w')
      } else {
        r = applyAspect(r, display.w, display.h, 'h')
      }
    }
    setCrop(r)
  }

  function onPointerUp() { drag.current = null }

  function confirm() {
    const canvas = canvasRef.current
    if (!canvas) return
    const { w: nw, h: nh } = natural
    const sx = Math.round(crop.x * nw)
    const sy = Math.round(crop.y * nh)
    const sw = Math.round(crop.w * nw)
    const sh = Math.round(crop.h * nh)
    canvas.width  = sw
    canvas.height = sh
    const ctx = canvas.getContext('2d')!
    const img = imgRef.current!
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)
    canvas.toBlob(blob => { if (blob) onConfirm(blob) }, 'image/png', 0.95)
  }

  const CURSOR: Record<string, string> = {
    nw: 'nw-resize', ne: 'ne-resize', sw: 'sw-resize', se: 'se-resize', move: 'move'
  }

  const boxStyle = {
    left:   `${crop.x * 100}%`,
    top:    `${crop.y * 100}%`,
    width:  `${crop.w * 100}%`,
    height: `${crop.h * 100}%`,
  } as const

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/80">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold text-sm">
            <IconCrop size={16} />
            Crop Image
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
            <IconX size={16} />
          </button>
        </div>

        <div className="p-5">
          <div className="relative inline-block w-full select-none overflow-hidden rounded-lg bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={src}
              alt="Crop source"
              draggable={false}
              className="block w-full max-h-[60vh] object-contain opacity-50"
            />

            {/* overlay outside crop */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-black/50" style={{ clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 ${crop.y * 100}%, ${crop.x * 100}% ${crop.y * 100}%, ${crop.x * 100}% ${(crop.y + crop.h) * 100}%, ${(crop.x + crop.w) * 100}% ${(crop.y + crop.h) * 100}%, ${(crop.x + crop.w) * 100}% ${crop.y * 100}%, 0 ${crop.y * 100}%)` }} />
            </div>

            {/* crop box */}
            <div
              ref={boxRef}
              className="absolute border-2 border-white/90 shadow-lg"
              style={{ ...boxStyle, cursor: drag.current ? (CURSOR[drag.current.edge] ?? 'move') : 'move' }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
              {/* rule of thirds */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="border border-white/20" />
                ))}
              </div>
              {/* corner handles */}
              {(['nw', 'ne', 'sw', 'se'] as const).map(c => (
                <div
                  key={c}
                  className="absolute w-3 h-3 bg-white rounded-sm shadow"
                  style={{
                    top:    c.includes('n') ? -5 : undefined,
                    bottom: c.includes('s') ? -5 : undefined,
                    left:   c.includes('w') ? -5 : undefined,
                    right:  c.includes('e') ? -5 : undefined,
                    cursor: `${c}-resize`,
                  }}
                />
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-2 text-center">Drag to move &bull; Drag corners to resize</p>
        </div>

        <div className="flex justify-end gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-slate-700">
          <button type="button" onClick={onCancel} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
            <IconRotateCcw size={13} /> Cancel
          </button>
          <button type="button" onClick={confirm} className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 text-sm font-semibold">
            <IconCheck size={13} /> Apply Crop
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

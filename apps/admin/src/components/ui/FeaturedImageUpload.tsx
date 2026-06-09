'use client'

import { useRef, useState } from 'react'
import { ImageCropper } from './ImageCropper'
import { uploadMedia } from '@/lib/api'

interface Props {
  value: string
  onChange: (url: string) => void
}

export function FeaturedImageUpload({ value, onChange }: Props) {
  const inputRef  = useRef<HTMLInputElement>(null)
  const [cropSrc, setCropSrc]   = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError]       = useState('')

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setCropSrc(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function onCropConfirm(blob: Blob) {
    setCropSrc(null)
    setError('')
    setUploading(true)
    try {
      const file = new File([blob], 'featured.png', { type: 'image/png' })
      const res  = await uploadMedia(file, 'blog')
      onChange(res.url)
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          aspect={16 / 9}
          onConfirm={onCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}

      <div className="space-y-2">
        {value ? (
          <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Featured" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600 hover:border-[#C9A84C] dark:hover:border-[#C9A84C] transition-colors flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-[#C9A84C] bg-slate-50 dark:bg-slate-700/50 disabled:opacity-50 group"
          >
            {uploading ? (
              <>
                <span className="w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Uploading…</span>
              </>
            ) : (
              <>
                <svg className="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">Click to upload featured image</span>
                <span className="text-xs">PNG, JPG, WebP · 16:9 crop</span>
              </>
            )}
          </button>
        )}
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileSelected} />
    </>
  )
}

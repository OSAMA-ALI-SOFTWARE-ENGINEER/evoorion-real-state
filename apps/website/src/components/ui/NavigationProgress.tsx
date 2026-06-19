'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function NavigationProgress() {
  const pathname           = usePathname()
  const searchParams       = useSearchParams()
  const [visible, setVisible] = useState(false)
  const [width, setWidth]     = useState(0)
  const timerRef           = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevUrl            = useRef(`${pathname}${searchParams}`)

  useEffect(() => {
    const url = `${pathname}${searchParams}`
    if (url === prevUrl.current) return
    prevUrl.current = url

    // Navigation completed — finish the bar
    setWidth(100)
    timerRef.current = setTimeout(() => setVisible(false), 300)
  }, [pathname, searchParams])

  // Intercept link clicks to start the bar
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return
      const href = target.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return
      if (target.target === '_blank') return
      // Only internal links
      if (href.startsWith('http') && !href.startsWith(window.location.origin)) return

      if (timerRef.current) clearTimeout(timerRef.current)
      setVisible(true)
      setWidth(0)
      // Animate to ~70% to signal in-progress
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setWidth(70))
      })
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] h-0.5 pointer-events-none"
      style={{ background: 'transparent' }}
    >
      <div
        className="h-full bg-gold transition-all ease-out"
        style={{
          width: `${width}%`,
          transitionDuration: width === 100 ? '150ms' : '600ms',
          boxShadow: '0 0 8px rgba(200, 160, 80, 0.6)',
        }}
      />
    </div>
  )
}

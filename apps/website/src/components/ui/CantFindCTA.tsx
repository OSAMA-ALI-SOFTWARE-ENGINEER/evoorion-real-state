'use client'

import { useState, useEffect } from 'react'
import { HelpCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { PropertyRequirementModal } from '@/components/ui/PropertyRequirementModal'

export function CantFindCTA() {
  const [visible, setVisible] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  // Appear after 5 seconds
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 5000)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <AnimatePresence>
        {visible && !modalOpen && (
          <motion.button
            type="button"
            onClick={() => setModalOpen(true)}
            initial={{ opacity: 0, y: 16, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="fixed bottom-8 left-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-brand-section border border-gold-border rounded-sm shadow-xl hover:border-gold/50 hover:bg-brand transition-all duration-200 group"
            aria-label="Can't find what you're looking for?"
          >
            <div className="w-7 h-7 rounded-sm bg-gold/10 flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
              <HelpCircle size={14} className="text-gold" />
            </div>
            <div className="text-left">
              <p className="text-white text-xs font-semibold leading-tight">Can&apos;t find what you need?</p>
              <p className="text-muted text-[11px] leading-tight">We&apos;ll match you in 24h</p>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <PropertyRequirementModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}


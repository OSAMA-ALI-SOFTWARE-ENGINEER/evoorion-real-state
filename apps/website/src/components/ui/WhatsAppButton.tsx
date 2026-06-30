'use client'

import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

const WA_NUMBER = '971000000000'
const WA_MESSAGE = 'Hello, I\'m interested in learning more about Dubai real estate investment opportunities with EVOORION.'

export function WhatsAppButton() {
  const href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.5, type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-black/40 bg-[#25D366] hover:bg-[#20bf5b] transition-colors duration-300"
    >
      <MessageCircle size={26} className="text-white fill-white" />
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full border-2 border-brand animate-pulse" />
    </motion.a>
  )
}


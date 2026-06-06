'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import type { AuthUser } from '@/types'

function CallbackHandler() {
  const { setSession } = useAuth()
  const router         = useRouter()
  const params         = useSearchParams()
  const [status, setStatus] = useState<'processing' | 'error'>('processing')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const token    = params.get('token')
    const userData = params.get('user')
    const error    = params.get('error')

    if (error || !token || !userData) {
      const messages: Record<string, string> = {
        account_disabled: 'Your account has been disabled. Please contact support.',
        auth_failed: 'Social login failed. Please try again or use email login.',
      }
      setErrorMsg(messages[error ?? ''] ?? 'Authentication failed. Please try again.')
      setStatus('error')
      return
    }

    try {
      const user = JSON.parse(decodeURIComponent(userData)) as AuthUser
      setSession(token, user)
      router.replace('/')
    } catch {
      setErrorMsg('Failed to complete sign-in. Please try again.')
      setStatus('error')
    }
  }, [params, setSession, router])

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-2xl">!</span>
          </div>
          <h2 className="font-serif text-2xl text-white mb-2">Sign-in failed</h2>
          <p className="text-muted mb-6">{errorMsg}</p>
          <button
            type="button"
            onClick={() => router.replace('/')}
            className="px-6 py-2.5 rounded-lg bg-gold text-brand font-semibold text-sm hover:bg-gold/90 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-gold animate-spin mx-auto mb-4" />
        <p className="text-muted text-sm">Completing sign-in…</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-gold animate-spin" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  )
}

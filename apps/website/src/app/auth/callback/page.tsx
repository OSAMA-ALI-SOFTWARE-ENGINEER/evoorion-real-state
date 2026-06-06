'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import type { AuthUser } from '@/types'

const ERROR_MESSAGES: Record<string, string> = {
  account_disabled:   'Your account has been disabled. Please contact support.',
  auth_failed:        'Social login failed. Please try again or use email login.',
  email_not_verified: 'Your email address was not verified by the provider. Please use email login instead.',
  email_exists:       'An account with this email already exists. Please sign in with your email and password, then link your social account in settings.',
  no_email:           'The provider did not share your email address. Please use email login instead.',
}

function CallbackHandler() {
  const { setSession } = useAuth()
  const router         = useRouter()
  const params         = useSearchParams()
  const [status, setStatus]   = useState<'processing' | 'error'>('processing')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const code  = params.get('code')
    const error = params.get('error')

    if (error || !code) {
      setErrorMsg(ERROR_MESSAGES[error ?? ''] ?? 'Authentication failed. Please try again.')
      setStatus('error')
      return
    }

    // POST the short-lived exchange code to get the actual bearer token in the response body.
    // The token is never in the URL.
    api
      .post<{ success: boolean; data: { token: string } }>('/auth/social/exchange', { code })
      .then(async (res) => {
        const token = res.data.data.token

        // Fetch user profile using the new token (don't trust URL params for PII)
        const meRes = await api.get<{ success: boolean; data: AuthUser }>('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })

        setSession(token, meRes.data.data)
        router.replace('/')
      })
      .catch(() => {
        setErrorMsg('Sign-in failed — the link may have expired. Please try again.')
        setStatus('error')
      })
  }, [params, setSession, router])

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-2xl">!</span>
          </div>
          <h2 className="font-serif text-2xl text-white mb-2">Sign-in failed</h2>
          <p className="text-muted mb-6 text-sm leading-relaxed">{errorMsg}</p>
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

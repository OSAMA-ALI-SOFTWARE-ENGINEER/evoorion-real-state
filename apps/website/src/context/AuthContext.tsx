'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { getMe, logoutUser } from '@/lib/api'
import type { AuthUser } from '@/types'

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  setSession: (token: string, user: AuthUser) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'evoorion_token'
const USER_KEY  = 'evoorion_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null)
  const [token, setToken]     = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    const storedUser  = localStorage.getItem(USER_KEY)

    if (!storedToken) {
      setIsLoading(false)
      return
    }

    if (storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      setIsLoading(false)
      return
    }

    // Rehydrate from API if user data is missing
    getMe()
      .then((res) => {
        setToken(storedToken)
        setUser(res.data)
        localStorage.setItem(USER_KEY, JSON.stringify(res.data))
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const setSession = useCallback((newToken: string, newUser: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }, [])

  const logout = useCallback(async () => {
    try { await logoutUser() } catch { /* ignore network errors on logout */ }
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, token, isLoading, setSession, logout }),
    [user, token, isLoading, setSession, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

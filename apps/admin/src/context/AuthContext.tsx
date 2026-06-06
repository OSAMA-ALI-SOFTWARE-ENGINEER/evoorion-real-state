'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { getMe, logoutUser } from '@/lib/api'
import type { AuthUser } from '@/types'

const TOKEN_KEY = 'evoorion_admin_token'
const USER_KEY  = 'evoorion_admin_user'

interface AuthContextValue {
  user:       AuthUser | null
  token:      string | null
  isLoading:  boolean
  setSession: (token: string, user: AuthUser) => void
  logout:     () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<AuthUser | null>(null)
  const [token,     setToken]     = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const setSession = useCallback((tok: string, usr: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, tok)
    localStorage.setItem(USER_KEY, JSON.stringify(usr))
    setToken(tok)
    setUser(usr)
  }, [])

  const logout = useCallback(async () => {
    try { await logoutUser() } catch { /* token may already be invalid */ }
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    const storedUser  = localStorage.getItem(USER_KEY)

    if (!storedToken) {
      setIsLoading(false)
      return
    }

    if (storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser) as AuthUser)
      setIsLoading(false)
      // Refresh user data in the background
      getMe(storedToken)
        .then(res => {
          setUser(res.data)
          localStorage.setItem(USER_KEY, JSON.stringify(res.data))
        })
        .catch(() => {
          // Token is invalid — clear session
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
          setToken(null)
          setUser(null)
        })
    } else {
      getMe(storedToken)
        .then(res => {
          setToken(storedToken)
          setUser(res.data)
          localStorage.setItem(USER_KEY, JSON.stringify(res.data))
        })
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY)
        })
        .finally(() => setIsLoading(false))
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

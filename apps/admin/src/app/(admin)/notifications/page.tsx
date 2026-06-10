'use client'

import { useCallback, useEffect, useState } from 'react'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/api'
import type { Notification } from '@/types'
import { IconBell, IconCheck, IconCheckCircle } from '@/components/ui/icons'

function fmtTime(d: string) {
  const date = new Date(d)
  const now   = new Date()
  const diff  = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function notifTitle(n: Notification): string {
  const d = n.data as Record<string, string>
  if (d.title) return d.title
  const type = n.type.split('\\').pop() ?? n.type
  return type.replace(/([A-Z])/g, ' $1').trim()
}

function notifMessage(n: Notification): string {
  const d = n.data as Record<string, string>
  return d.message ?? d.body ?? d.text ?? ''
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading,  setLoading]  = useState(true)
  const [marking,  setMarking]  = useState<string | null>(null)
  const [markingAll, setMarkingAll] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    getNotifications()
      .then(res => setNotifications((res.data as Notification[]) ?? []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  async function handleMarkRead(id: string) {
    setMarking(id)
    try {
      await markNotificationRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    } finally { setMarking(null) }
  }

  async function handleMarkAll() {
    setMarkingAll(true)
    try {
      await markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })))
    } finally { setMarkingAll(false) }
  }

  const unreadCount = notifications.filter(n => !n.read_at).length

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Notifications</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-slate-400 dark:text-slate-500">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={markingAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <IconCheckCircle size={14} />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-4 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-slate-100 dark:bg-slate-700 rounded w-2/3" />
                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-full" />
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center">
            <IconBell size={36} className="text-slate-200 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No notifications yet.</p>
          </div>
        ) : (
          notifications.map(n => {
            const isRead = !!n.read_at
            return (
              <div
                key={n.id}
                className={`flex items-start gap-4 p-4 transition-colors ${
                  isRead ? 'bg-transparent' : 'bg-[#C9A84C]/5 dark:bg-[#C9A84C]/10'
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  isRead ? 'bg-slate-100 dark:bg-slate-700' : 'bg-[#C9A84C]/20'
                }`}>
                  <IconBell size={16} className={isRead ? 'text-slate-400' : 'text-[#C9A84C]'} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium leading-tight ${
                      isRead ? 'text-slate-600 dark:text-slate-300' : 'text-slate-800 dark:text-slate-100'
                    }`}>
                      {notifTitle(n)}
                    </p>
                    <span className="text-[11px] text-slate-400 shrink-0">{fmtTime(n.created_at)}</span>
                  </div>
                  {notifMessage(n) && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{notifMessage(n)}</p>
                  )}
                </div>

                {!isRead && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(n.id)}
                    disabled={marking === n.id}
                    title="Mark as read"
                    className="p-1.5 rounded-md text-slate-400 hover:text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors disabled:opacity-50 shrink-0"
                  >
                    <IconCheck size={14} />
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getAreas, updateArea } from '@/lib/api'
import { AreaForm } from '@/components/ui/AreaForm'
import { IconChevronRight, IconLoader } from '@/components/ui/icons'
import Link from 'next/link'
import type { Area } from '@/types'

export default function EditAreaPage() {
  const { id }   = useParams<{ id: string }>()
  const router   = useRouter()
  const [area,   setArea]   = useState<Area | null>(null)
  const [loading,setLoading]= useState(true)

  useEffect(() => {
    getAreas()
      .then(res => setArea((res.data ?? []).find(a => String(a.id) === id) ?? null))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSave(data: Partial<Area>) {
    await updateArea(Number(id), data)
    router.push('/areas')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <IconLoader size={28} className="text-[#C9A84C] animate-spin" />
      </div>
    )
  }

  if (!area) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-400">Area not found.</p>
        <Link href="/areas" className="mt-3 inline-block text-sm text-[#C9A84C] hover:underline">Back to Areas</Link>
      </div>
    )
  }

  return (
    <div>
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/areas" className="hover:text-[#C9A84C] transition-colors">Areas</Link>
        <IconChevronRight size={14} />
        <span className="text-slate-600 dark:text-slate-300 font-medium">Edit: {area.name}</span>
      </nav>
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Edit Area</h1>
      <AreaForm mode="edit" saveLabel="Save Changes" initial={area} onSave={handleSave} />
    </div>
  )
}

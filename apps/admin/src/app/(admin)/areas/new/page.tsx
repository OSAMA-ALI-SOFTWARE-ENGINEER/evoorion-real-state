'use client'

import { useRouter } from 'next/navigation'
import { createArea } from '@/lib/api'
import { AreaForm } from '@/components/ui/AreaForm'
import { IconChevronRight } from '@/components/ui/icons'
import Link from 'next/link'
import type { Area } from '@/types'

export default function NewAreaPage() {
  const router = useRouter()

  async function handleSave(data: Partial<Area>) {
    await createArea(data)
    router.push('/areas')
  }

  return (
    <div>
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/areas" className="hover:text-[#C9A84C] transition-colors">Areas</Link>
        <IconChevronRight size={14} />
        <span className="text-slate-600 dark:text-slate-300 font-medium">New Area</span>
      </nav>
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">New Area</h1>
      <AreaForm mode="new" saveLabel="Create Area" onSave={handleSave} />
    </div>
  )
}

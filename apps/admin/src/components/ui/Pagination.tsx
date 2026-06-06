interface PaginationProps {
  currentPage: number
  lastPage: number
  total: number
  perPage: number
  onPage: (page: number) => void
}

export function Pagination({ currentPage, lastPage, total, perPage, onPage }: PaginationProps) {
  if (lastPage <= 1) return null

  const from = (currentPage - 1) * perPage + 1
  const to   = Math.min(currentPage * perPage, total)

  // Build page number array (show at most 7 pages around current)
  const pages: (number | '...')[] = []
  if (lastPage <= 7) {
    for (let i = 1; i <= lastPage; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    const start = Math.max(2, currentPage - 1)
    const end   = Math.min(lastPage - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < lastPage - 2) pages.push('...')
    pages.push(lastPage)
  }

  const btn = (active: boolean, disabled: boolean, label: React.ReactNode, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'px-3 py-1.5 rounded text-sm font-medium transition-colors',
        active   ? 'bg-[#C9A84C] text-white' : '',
        disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100',
        !active && !disabled ? 'text-slate-700' : '',
      ].join(' ')}
    >
      {label}
    </button>
  )

  return (
    <div className="flex items-center justify-between px-1 py-3">
      <p className="text-sm text-slate-500">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-1">
        {btn(false, currentPage === 1, '‹', () => onPage(currentPage - 1))}
        {pages.map((p, i) =>
          p === '...'
            ? <span key={`dots-${i}`} className="px-2 text-slate-400 text-sm">…</span>
            : btn(p === currentPage, false, p, () => onPage(p as number))
        )}
        {btn(false, currentPage === lastPage, '›', () => onPage(currentPage + 1))}
      </div>
    </div>
  )
}

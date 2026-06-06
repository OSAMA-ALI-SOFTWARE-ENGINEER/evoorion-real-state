export function SkeletonCard() {
  return (
    <div className="rounded-sm overflow-hidden border border-white/5 animate-pulse">
      <div className="h-56 bg-white/5" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-white/5 rounded w-1/3" />
        <div className="h-5 bg-white/5 rounded w-3/4" />
        <div className="h-4 bg-white/5 rounded w-1/2" />
        <div className="flex justify-between pt-2">
          <div className="h-6 bg-white/5 rounded w-1/3" />
          <div className="h-6 bg-white/5 rounded w-1/4" />
        </div>
      </div>
    </div>
  )
}

import { PropertyForm } from '@/components/ui/PropertyForm'

export default function NewPropertyPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-slate-800">New Property</h1>
        <p className="text-sm text-slate-500 mt-0.5">Fill in the details to create a new listing.</p>
      </div>
      <PropertyForm />
    </div>
  )
}

import * as Dialog from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import type { MenuItem } from "@/types"

interface EditMenuItemModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menuItem: MenuItem | null
  onSave: (values: Partial<MenuItem>) => void
  isLoading?: boolean
}

export default function EditMenuItemModal({ open, onOpenChange, menuItem, onSave, isLoading }: EditMenuItemModalProps) {
  const [form, setForm] = useState<Partial<MenuItem>>({})

  useEffect(() => {
    if (menuItem) setForm(menuItem)
  }, [menuItem])

  if (!menuItem) return null

  const handleChange = (field: keyof MenuItem, value: string | number | boolean | string[]) => {
    setForm(f => ({ ...f, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <Dialog.Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.DialogContent>
        <Dialog.DialogHeader>
          <Dialog.DialogTitle>Edit Menu Item</Dialog.DialogTitle>
        </Dialog.DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="w-full border p-2" value={form.name || ''} onChange={e => handleChange('name', e.target.value)} placeholder="Name" required />
          <textarea className="w-full border p-2" value={form.description || ''} onChange={e => handleChange('description', e.target.value)} placeholder="Description" />
          <input className="w-full border p-2" type="number" value={form.price ?? ''} onChange={e => handleChange('price', Number(e.target.value))} placeholder="Full Price (cents)" required />
          <input className="w-full border p-2" type="number" value={form.halfPrice ?? ''} onChange={e => handleChange('halfPrice', Number(e.target.value))} placeholder="Half Price (cents)" />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!form.hasHalfOrder} onChange={e => handleChange('hasHalfOrder', e.target.checked)} /> Half Order Available
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!form.active} onChange={e => handleChange('active', e.target.checked)} /> Active
          </label>
          <input className="w-full border p-2" value={form.imageUrl || ''} onChange={e => handleChange('imageUrl', e.target.value)} placeholder="Image URL" />
          <div className="flex gap-2 flex-wrap">
            {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => (
              <label key={day} className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={form.availableDays?.includes(day) || false} onChange={e => {
                  const days = new Set(form.availableDays || [])
                  if (e.target.checked) {
                    days.add(day)
                  } else {
                    days.delete(day)
                  }
                  handleChange('availableDays', Array.from(days))
                }} /> {day.slice(0,3)}
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </Dialog.DialogContent>
    </Dialog.Dialog>
  )
} 
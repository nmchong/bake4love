import * as Dialog from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import type { MenuItem } from "@/types"
import { ConfirmationDialog } from "@/components/admin/shared/ConfirmationDialog"

interface EditMenuItemModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menuItem: MenuItem | null
  onSave: (values: Partial<MenuItem>) => void
  isLoading?: boolean
}

function isEqualMenuItem(a: Partial<MenuItem>, b: Partial<MenuItem>, ingredientsTextA: string, ingredientsTextB: string) {
  // compare all fields used in the form, including ingredients as text
  return (
    (a.name || "") === (b.name || "") &&
    (a.description || "") === (b.description || "") &&
    (a.price ?? "") === (b.price ?? "") &&
    (a.halfPrice ?? "") === (b.halfPrice ?? "") &&
    !!a.hasHalfOrder === !!b.hasHalfOrder &&
    !!a.active === !!b.active &&
    (a.imageUrl || "") === (b.imageUrl || "") &&
    JSON.stringify(a.availableDays || []) === JSON.stringify(b.availableDays || []) &&
    ingredientsTextA === ingredientsTextB
  )
}

export default function EditMenuItemModal({ open, onOpenChange, menuItem, onSave, isLoading }: EditMenuItemModalProps) {
  const [form, setForm] = useState<Partial<MenuItem>>({})
  const [ingredientsText, setIngredientsText] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)
  const initialForm = useRef<Partial<MenuItem>>({})
  const initialIngredientsText = useRef("")
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (menuItem) {
      setForm(menuItem)
      setIngredientsText((menuItem.ingredients || []).join("\n"))
      initialForm.current = menuItem
      initialIngredientsText.current = (menuItem.ingredients || []).join("\n")
    } else {
      setForm({})
      setIngredientsText("")
      initialForm.current = {}
      initialIngredientsText.current = ""
    }
    setDirty(false)
  }, [menuItem, open])

  useEffect(() => {
    setDirty(!isEqualMenuItem(form, initialForm.current, ingredientsText, initialIngredientsText.current))
  }, [form, ingredientsText])

  if (!open) return null

  const handleChange = (field: keyof MenuItem, value: string | number | boolean | string[]) => {
    setForm(f => ({ ...f, [field]: value }))
  }

  const handleIngredientsChange = (value: string) => {
    setIngredientsText(value)
    setForm(f => ({ ...f, ingredients: value.split("\n").map(s => s.trim()).filter(Boolean) }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...form, ingredients: ingredientsText.split("\n").map(s => s.trim()).filter(Boolean) })
    setDirty(false)
  }

  const handleCancel = () => {
    if (dirty) {
      setShowConfirm(true)
    } else {
      onOpenChange(false)
    }
  }

  const handleConfirmCancel = () => {
    setShowConfirm(false)
    setDirty(false)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog.Dialog open={open} onOpenChange={onOpenChange}>
        <Dialog.DialogContent>
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>{menuItem ? "Edit Menu Item" : "Add Menu Item"}</Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input className="w-full border p-2" value={form.name || ''} onChange={e => handleChange('name', e.target.value)} placeholder="Name" required />
            <textarea className="w-full border p-2" value={form.description || ''} onChange={e => handleChange('description', e.target.value)} placeholder="Description" />
            <textarea className="w-full border p-2" value={ingredientsText} onChange={e => handleIngredientsChange(e.target.value)} placeholder="Ingredients (one per line)" rows={4} />
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
              {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(day => (
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
              <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? (menuItem ? 'Saving...' : 'Adding...') : (menuItem ? 'Save' : 'Add')}</Button>
            </div>
          </form>
        </Dialog.DialogContent>
      </Dialog.Dialog>
      <ConfirmationDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Discard changes?"
        message="You have unsaved changes. Are you sure you want to cancel?"
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowConfirm(false)}
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
      />
    </>
  )
} 
import { useState, useEffect } from "react"

interface MenuItemToggle {
  id: string
  name: string
  active: boolean
  availableDays: string[]
}

interface CompactMenuToggleTableProps {
  menuItems: MenuItemToggle[]
  onChange: (items: MenuItemToggle[]) => void
  isDirty: boolean
  onSave: () => void
  isSaving: boolean
  dayNames: string[]
}

export default function CompactMenuToggleTable({ menuItems, onChange, isDirty, onSave, isSaving, dayNames }: CompactMenuToggleTableProps) {
  const [localItems, setLocalItems] = useState<MenuItemToggle[]>([])

  useEffect(() => {
    setLocalItems(menuItems)
  }, [menuItems])

  const handleToggle = (id: string, field: 'active' | 'day', day?: string) => {
    let updated: MenuItemToggle[] = [];
    setLocalItems(items => {
      updated = items.map(item => {
        if (item.id !== id) return item
        if (field === 'active') return { ...item, active: !item.active }
        if (field === 'day' && day) {
          const set = new Set(item.availableDays)
          if (set.has(day)) {
            set.delete(day)
          } else {
            set.add(day)
          }
          return { ...item, availableDays: Array.from(set) }
        }
        return item
      })
      return updated
    })
    onChange(updated)
  }

  return (
    <div className="border rounded p-4 mt-4">
      <div className="font-semibold mb-2">Menu Toggles</div>
      {isDirty && <div className="bg-orange-100 text-orange-700 px-2 py-1 rounded mb-2 text-xs">You have unsaved changes</div>}
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left">Item</th>
            <th>Active</th>
            {dayNames.map(day => <th key={day}>{day}</th>)}
          </tr>
        </thead>
        <tbody>
          {localItems.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>
                <input type="checkbox" checked={item.active} onChange={() => handleToggle(item.id, 'active')} />
              </td>
              {dayNames.map(day => (
                <td key={day}>
                  <input type="checkbox" checked={item.availableDays.includes(day)} onChange={() => handleToggle(item.id, 'day', day)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end mt-2">
        <button className="px-4 py-2 rounded bg-black text-white" onClick={onSave} disabled={!isDirty || isSaving}>{isSaving ? 'Saving...' : 'Save'}</button>
      </div>
    </div>
  )
} 
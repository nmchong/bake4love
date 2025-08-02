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
    // compute new value based on the current localItems
    const updated = localItems.map(item => {
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
    setLocalItems(updated)
    onChange(updated)
  }

  // convert full day names to abbreviated versions
  const abbreviatedDays = dayNames.map(day => {
    const dayMap: { [key: string]: string } = {
      'Sunday': 'Su',
      'Monday': 'Mo', 
      'Tuesday': 'Tu',
      'Wednesday': 'We',
      'Thursday': 'Th',
      'Friday': 'Fr',
      'Saturday': 'Sa'
    }
    return dayMap[day] || day
  })


  return (
    <div className="border border-[#E5DED6] rounded-lg p-6 mt-4 bg-[#FAF7ED]">
      <div className="font-semibold mb-4 text-lg text-[#4A2F1B]">Menu Toggles</div>
      {isDirty && <div className="bg-orange-100 text-orange-700 px-3 py-2 rounded mb-4 text-sm">You have unsaved changes</div>}

      <table className="w-full text-sm">
        {/* table header */}
        <thead>
          <tr className="border-b border-[#E5DED6]">
            <th className="text-left py-3 text-[#4A2F1B] font-semibold">Item</th>
            <th className="py-3 text-[#4A2F1B] font-semibold text-center border-l border-[#E5DED6] border-r border-[#E5DED6]">Active</th>
            <th className="py-3 text-[#4A2F1B] font-semibold text-center border-l border-[#E5DED6] px-1"></th>
            {abbreviatedDays.map((day, index) => (
              <th key={`${day}-${index}`} className="py-3 text-[#4A2F1B] font-semibold text-center">{day}</th>
            ))}
          </tr>
        </thead>

        {/* table body */}
        <tbody>
          {localItems.map(item => (
            <tr key={item.id} className="border-b border-[#E5DED6] hover:bg-[#F3E9D7]">
              <td className="py-3 text-[#4A2F1B] font-medium text-base leading-tight">{item.name}</td>
              <td className="py-3 text-center border-l border-[#E5DED6] border-r border-[#E5DED6]">
                <input 
                  type="checkbox" 
                  checked={item.active} 
                  onChange={() => handleToggle(item.id, 'active')}
                  className="w-5 h-5 text-[#A4551E] bg-[#FAF7ED] border-[#E5DED6] rounded focus:ring-[#A4551E] focus:ring-2"
                />
              </td>
              <td className="py-3 text-center border-l border-[#E5DED6] text-[#6B4C32] px-1"></td>
              {dayNames.map(day => (
                <td key={day} className="py-3 text-center">
                  <input 
                    type="checkbox" 
                    checked={item.availableDays.includes(day)} 
                    onChange={() => handleToggle(item.id, 'day', day)}
                    className="w-5 h-5 text-[#A4551E] bg-[#FAF7ED] border-[#E5DED6] rounded focus:ring-[#A4551E] focus:ring-2"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* save button */}
      <div className="flex justify-end mt-4">
        <button 
          className="px-5 py-2.5 rounded-lg bg-[#A4551E] text-[#FFFDF5] hover:bg-[#843C12] disabled:opacity-50 disabled:cursor-not-allowed font-medium" 
          onClick={onSave} 
          disabled={!isDirty || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
} 
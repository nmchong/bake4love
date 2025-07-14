interface DateDetailsPaneProps {
  date: Date
  ordersCount: number
  isAvailable: boolean
  hasOrders: boolean
  menuItems: { id: string; name: string }[]
  selectedTimeSlots: string[]
  onToggleAvailable: (available: boolean) => void
  onTimeSlotChange: (slot: string) => void
  onSave: () => void
  isDirty: boolean
  isSaving: boolean
}

function generateTimeSlots() {
  const slots: string[] = []
  for (let h = 5; h < 23; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`)
    slots.push(`${h.toString().padStart(2, '0')}:30`)
  }
  slots.push("23:00")
  return slots
}

export default function DateDetailsPane({ date, ordersCount, isAvailable, hasOrders, menuItems, selectedTimeSlots, onToggleAvailable, onTimeSlotChange, onSave, isDirty, isSaving }: DateDetailsPaneProps) {
  const slots = generateTimeSlots()
  return (
    <div className="border rounded p-4 mt-4">
      <div className="mb-2 font-semibold">{date.toDateString()}</div>
      <div className="mb-2">Orders: {ordersCount}</div>
      <div className="mb-2">
        {hasOrders ? (
          <>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isAvailable} onChange={e => onToggleAvailable(e.target.checked)} /> Available (uncheck to close)
            </label>
          </>
        ) : (
          <>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isAvailable} onChange={e => onToggleAvailable(e.target.checked)} /> Available (uncheck to set unavailable)
            </label>
          </>
        )}
      </div>
      <div className="mb-2">
        <div className="font-semibold text-sm mb-1">Menu Preview</div>
        <ul className="text-xs">
          {menuItems.map(item => <li key={item.id}>{item.name}</li>)}
        </ul>
      </div>
      <div className="mb-2">
        <div className="font-semibold text-sm mb-1">Timeslots</div>
        <div className="grid grid-cols-6 gap-1">
          {slots.map(slot => (
            <button
              key={slot}
              className={`text-xs px-1 py-1 rounded ${selectedTimeSlots.includes(slot) ? 'bg-green-400 text-white' : 'bg-gray-100'}`}
              onClick={() => onTimeSlotChange(slot)}
              type="button"
            >
              {slot}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-2">
        {isDirty && <span className="text-orange-500 text-xs self-center">You have unsaved changes</span>}
        <button className="px-4 py-2 rounded bg-black text-white" onClick={onSave} disabled={!isDirty || isSaving}>{isSaving ? 'Saving...' : 'Save'}</button>
      </div>
    </div>
  )
} 
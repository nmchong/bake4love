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

// generate time slots for the day (8am to 10pm)
function generateTimeSlots() {
  const slots: string[] = []
  for (let h = 8; h <= 22; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`)
    slots.push(`${h.toString().padStart(2, '0')}:30`)
  }
  return slots
}

// format time slot (e.g. 08:00-08:30)
function formatTimeSlot(slot: string): string {
  const [hours, minutes] = slot.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'pm' : 'am'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  
  // calculate end time for timeslot (30 minutes later)
  const endHour = minutes === '30' ? hour + 1 : hour
  const endMinutes = minutes === '30' ? '00' : '30'
  const endDisplayHour = endHour === 0 ? 12 : endHour > 12 ? endHour - 12 : endHour
  
  return `${displayHour}:${minutes}-${endDisplayHour}:${endMinutes}${ampm}`
}



export default function DateDetailsPane({ date, ordersCount, isAvailable, hasOrders, menuItems, selectedTimeSlots, onToggleAvailable, onTimeSlotChange, onSave, isDirty, isSaving }: DateDetailsPaneProps) {
  const slots = generateTimeSlots()
  
  // check if date is in the unorderable range (within 3 days from now or before)
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const threeDaysFromNow = new Date(startOfToday)
  threeDaysFromNow.setDate(startOfToday.getDate() + 3)
  const isDateUnorderable = date <= threeDaysFromNow
  
  // only allow editing timeslots if date is available AND in orderable range
  const canEditTimeSlots = isAvailable && !isDateUnorderable
  const hasValidTimeSlots = isAvailable ? selectedTimeSlots.length > 0 : true

  return (
    <div className="border rounded p-4 mt-4">
      <div className="mb-4 text-2xl font-bold text-[#4A2F1B]">{date.toDateString()}</div>
      <div className="mb-4 text-lg font-bold text-[#6B4C32]">Orders: {ordersCount}</div>

      {/* availability toggle */}
      <div className="mb-4">
        {hasOrders ? (
          <>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={isAvailable} 
                onChange={e => onToggleAvailable(e.target.checked)}
                disabled={isDateUnorderable}
              /> 
              Available (uncheck to close)
              {isDateUnorderable && <span className="text-sm text-gray-500 ml-2">- Date not in orderable range</span>}
            </label>
          </>
        ) : (
          <>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={isAvailable} 
                onChange={e => onToggleAvailable(e.target.checked)}
                disabled={isDateUnorderable}
              /> 
              Available (uncheck to set unavailable)
              {isDateUnorderable && <span className="text-sm text-gray-500 ml-2">- Date not in orderable range</span>}
            </label>
          </>
        )}
      </div>

      {/* menu preview */}
      <div className="mb-4">
        <div className="font-semibold text-base mb-2 text-[#4A2F1B]">Menu Preview</div>
        <ul className="text-sm text-[#6B4C32]">
          {menuItems.map(item => <li key={item.id}>- {item.name}</li>)}
        </ul>
      </div>

      {/* timeslots */}
      <div className="mb-4">
        <div className="font-semibold text-base mb-2 text-[#4A2F1B]">Timeslots</div>
        {!canEditTimeSlots && (
          <p className="text-sm text-gray-500 mb-2">
            {isDateUnorderable ? "Date not in orderable range" : "Enable availability to edit timeslots"}
          </p>
        )}
        <div className="grid grid-cols-4 gap-2">
          {slots.map(slot => (
            <button
              key={slot}
              className={`text-sm px-2 py-2 rounded border transition-colors ${
                selectedTimeSlots.includes(slot) 
                  ? 'bg-[#A4551E] text-white border-[#A4551E]' 
                  : canEditTimeSlots 
                    ? 'bg-[#FAF7ED] text-[#4A2F1B] border-[#E5DED6] hover:bg-[#FAE6C8]' 
                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              }`}
              onClick={() => canEditTimeSlots && onTimeSlotChange(slot)}
              type="button"
              disabled={!canEditTimeSlots}
            >
              {formatTimeSlot(slot)}
            </button>
          ))}
        </div>
        {isAvailable && selectedTimeSlots.length === 0 && (
          <p className="text-sm text-red-500 mt-2">Please select at least one timeslot when date is available</p>
        )}
      </div>

      {/* save button */}
      <div className="flex justify-end gap-2 mt-4">
        {isDirty && <span className="text-orange-500 text-sm self-center">You have unsaved changes</span>}
        <button 
          className="px-4 py-2 rounded bg-[#A4551E] text-white hover:bg-[#843C12] disabled:opacity-50" 
          onClick={onSave} 
          disabled={!isDirty || isSaving || !hasValidTimeSlots}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
} 
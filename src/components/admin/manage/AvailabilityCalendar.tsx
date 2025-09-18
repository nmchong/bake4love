interface AvailabilityCalendarProps {
  selectedDate: Date
  onSelectDate: (date: Date) => void
  ordersByDate: Record<string, number>
  availabilityByDate: Record<string, { timeSlots: string[] } | undefined>
  customerViewRange: { start: Date; end: Date }
  formatDateLocal: (date: Date) => string
}

export default function AvailabilityCalendar({ selectedDate, onSelectDate, ordersByDate, availabilityByDate, customerViewRange, formatDateLocal }: AvailabilityCalendarProps) {
  // rolling 5-week (35-day) grid, aligned to correct day of week, based on PST
  const tz = 'America/Los_Angeles'
  const todayLocal = new Date()
  const todayLa = new Date(todayLocal.toLocaleString('en-US', { timeZone: tz }))
  // build the start of the grid from LA perspective
  const startRaw = new Date(todayLa.getFullYear(), todayLa.getMonth(), todayLa.getDate() - 7)
  const startLaWeekday = new Date(startRaw.toLocaleString('en-US', { timeZone: tz })).getDay()
  const start = new Date(startRaw)
  start.setDate(start.getDate() - startLaWeekday)

  const days: Date[] = [];
  for (let i = 0; i < 35; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }

  // helper to determine color
  function getColor(date: Date) {
    const key = formatDateLocal(date)
    const inCustomerRange = date >= customerViewRange.start && date <= customerViewRange.end
    const isPastCustomerRange = date < customerViewRange.start
    const isFutureCustomerRange = date > customerViewRange.end
    const hasAvailability = !!availabilityByDate[key]
    const hasOrders = !!ordersByDate[key]
    if (inCustomerRange) {
      if (hasAvailability) return "bg-green-300"
      if (hasOrders) return "bg-purple-300"
      return ""
    } else if (isPastCustomerRange) {
      if (hasAvailability || hasOrders) return "bg-purple-200"
      return ""
    } else if (isFutureCustomerRange) {
      if (hasAvailability) return "bg-green-200"
      return ""
    }
    return ""
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-2 text-xs text-center">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map(date => {
          // compute LA-based date for keys and comparisons
          const laDate = new Date(date.toLocaleString('en-US', { timeZone: tz }))
          const key = laDate.toLocaleDateString('en-CA', { timeZone: tz })
          const color = getColor(laDate)
          const isSelected = formatDateLocal(laDate) === formatDateLocal(selectedDate)
          const inCustomerRange = laDate >= customerViewRange.start && laDate <= customerViewRange.end
          return (
            <button
              key={key}
              className={`aspect-square rounded flex flex-col items-center justify-center border ${color} ${isSelected ? 'ring-2 ring-black' : ''} ${inCustomerRange ? 'border-1 border-black' : ''}`}
              onClick={() => onSelectDate(laDate)}
            >
              {/* render day number in PST so label matches PST key */}
              <span>{laDate.getDate()}</span>
              {ordersByDate[key] ? <span className="text-xs text-gray-600">{ordersByDate[key]}</span> : null}
            </button>
          )
        })}
      </div>
    </div>
  )
} 
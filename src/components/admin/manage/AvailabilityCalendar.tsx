interface AvailabilityCalendarProps {
  selectedDate: Date
  onSelectDate: (date: Date) => void
  ordersByDate: Record<string, number>
  availabilityByDate: Record<string, { timeSlots: string[] } | undefined>
  customerViewRange: { start: Date; end: Date }
}

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

export default function AvailabilityCalendar({ selectedDate, onSelectDate, ordersByDate, availabilityByDate, customerViewRange }: AvailabilityCalendarProps) {
  // calculate the days in the current month
  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days: Date[] = []
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d))
  }

  // helper to determine color
  function getColor(date: Date) {
    const key = getDateKey(date)
    const inCustomerRange = date >= customerViewRange.start && date <= customerViewRange.end
    const isPastCustomerRange = date < customerViewRange.start
    const isFutureCustomerRange = date > customerViewRange.end
    const hasAvailability = !!availabilityByDate[key]
    const hasOrders = !!ordersByDate[key]
    if (inCustomerRange) {
      if (hasAvailability) return "bg-green-200"
      if (hasOrders) return "bg-purple-200"
      return ""
    } else if (isPastCustomerRange) {
      if (hasAvailability || hasOrders) return "bg-purple-100"
      return ""
    } else if (isFutureCustomerRange) {
      if (hasAvailability) return "bg-green-100"
      return ""
    }
    return ""
  }

  // render calendar grid
  const firstWeekday = firstDay.getDay()
  const blanks = Array.from({ length: firstWeekday })

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-2 text-xs text-center">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, i) => <div key={i} />)}
        {days.map(date => {
          const key = getDateKey(date)
          const color = getColor(date)
          const isSelected = getDateKey(date) === getDateKey(selectedDate)
          return (
            <button
              key={key}
              className={`aspect-square rounded flex flex-col items-center justify-center border ${color} ${isSelected ? 'ring-2 ring-black' : ''}`}
              onClick={() => onSelectDate(new Date(date))}
            >
              <span>{date.getDate()}</span>
              {ordersByDate[key] ? <span className="text-xs text-gray-600">{ordersByDate[key]}</span> : null}
            </button>
          )
        })}
      </div>
    </div>
  )
} 
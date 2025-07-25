'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { format, parse, addMinutes, format as formatDate } from 'date-fns'
import { useCart } from '@/components/customer/CartContext'

type TimeSlotsProps = {
  selectedDate: Date; 
  onSelectTime?: (time: string) => void
}

export default function TimeSlots({ selectedDate }: TimeSlotsProps) {
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { pickupTime, setPickupTime } = useCart()

  // show timeslots for selected date
  useEffect(() => {
    if (!selectedDate) return

    setLoading(true)
    setError(false)

    const iso = format(selectedDate, 'yyyy-MM-dd')
    fetch(`/api/availability?date=${iso}`)
      .then(res => res.json())
      .then(data => {
        if (data.available) {
          setTimeSlots(data.timeSlots)
        } else {
          setTimeSlots([])
        }
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [selectedDate])

  if (loading) return <p className="mt-4">Loading times...</p>
  if (error) return <p className="mt-4 text-[#843C12]">Failed to load time slots.</p>
  if (timeSlots.length === 0) return <p className="mt-4 text-[#6B4C32]">No available time slots for this day.</p>

  // sort and format time slots as ranges
  const sortedTimeSlots = [...timeSlots].sort((a, b) => {
    const dateA = parse(a, 'HH:mm', new Date())
    const dateB = parse(b, 'HH:mm', new Date())
    return dateA.getTime() - dateB.getTime()
  })

  function getTimeRangeLabel(time: string) {
    const start = parse(time, 'HH:mm', new Date())
    const end = addMinutes(start, 30)
    return `${formatDate(start, 'h:mm')}-${formatDate(end, 'h:mm')}${formatDate(end, 'a').toLowerCase()}`
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {sortedTimeSlots.map((time) => (
        <Button
          key={time}
          variant={pickupTime === time ? "default" : "outline"}
          onClick={() => setPickupTime(time)}
        >
          {getTimeRangeLabel(time)}
        </Button>
      ))}
    </div>
  )
}

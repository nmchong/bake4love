'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

type TimeSlotsProps = {
  selectedDate: Date; 
  onSelectTime?: (time: string) => void
}

export default function TimeSlots({ selectedDate, onSelectTime }: TimeSlotsProps) {
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!selectedDate) return

    setLoading(true)
    setError(false)

    fetch(`/api/availability?date=${selectedDate.toISOString().split('T')[0]}`)
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
  if (error) return <p className="mt-4 text-red-500">Failed to load time slots.</p>
  if (timeSlots.length === 0) return <p className="mt-4">No available time slots for this day.</p>

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {timeSlots.map((time) => (
        <Button
          key={time}
          variant="outline"
          onClick={() => onSelectTime?.(time)}
        >
          {time}
        </Button>
      ))}
    </div>
  )
}

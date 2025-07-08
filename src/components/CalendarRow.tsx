"use client"

import { useEffect, useState } from "react"
import clsx from "clsx"
import { format, addDays } from "date-fns"

type CalendarRowProps = {
  selectedDate: Date
  onSelect: (date: Date) => void
  availableDates: { [isoDate: string]: boolean }
}

export default function CalendarRow({
  selectedDate,
  onSelect,
  availableDates
}: CalendarRowProps) {
  const [dates, setDates] = useState<Date[]>([])

  useEffect(() => {
    const today = new Date()
    const next14 = Array.from({ length: 14 }, (_, i) => addDays(today, i))
    setDates(next14)
  }, [])

  return (
    <div className="flex overflow-x-auto gap-2 py-4 px-2">
      {dates.map((date) => {
        const iso = format(date, "yyyy-MM-dd")
        const isAvailable = availableDates[iso] ?? false
        const isSelected = format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")

        return (
          <button
            key={iso}
            disabled={!isAvailable}
            onClick={() => onSelect(date)}
            className={clsx(
              "min-w-[100px] rounded-md p-3 text-sm border flex flex-col items-center justify-center",
              isAvailable ? "bg-white text-black" : "bg-gray-100 text-gray-400 cursor-not-allowed",
              isSelected && "border-black font-bold"
            )}
          >
            <div>{format(date, "EEE")}</div>
            <div>{format(date, "MMM d")}</div>
            {!isAvailable && <div className="text-xs mt-1">Unavailable</div>}
          </button>
        )
      })}
    </div>
  )
}

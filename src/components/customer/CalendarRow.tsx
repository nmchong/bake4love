"use client"

import { useEffect, useState } from "react"
import clsx from "clsx"
import { format, addDays } from "date-fns"

type CalendarRowProps = {
  selectedDate: Date
  onSelect: (date: Date) => void
  availableDates: { [isoDate: string]: boolean } // format: {date: bool, ...}
}


export default function CalendarRow({
  selectedDate,
  onSelect,
  availableDates
}: CalendarRowProps) {
  const [dates, setDates] = useState<Date[]>([])

  // set calendar dates
  useEffect(() => {
    const today = new Date()
    const start = addDays(today, 4)
    const next14 = Array.from({ length: 14 }, (_, i) => addDays(start, i))
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
              isAvailable
                ? (isSelected
                    ? "bg-[#A4551E] text-[#FFFDF5] border-[#A4551E] shadow-sm font-bold"
                    : "bg-[#FAE6C8] text-[#4A2F1B] border-[#E5DED6]")
                : "bg-[#FAF7ED] text-[#6B4C32] cursor-not-allowed border-[#E5DED6]",
              isSelected && "border-[#A4551E] font-bold"
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

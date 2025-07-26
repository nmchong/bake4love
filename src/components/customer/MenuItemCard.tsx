"use client"

import { MenuItem } from "@/types"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

interface Props {
  item: MenuItem
  onClick: () => void
}

// helper func to format available days
function formatAvailableDays(days: string[] | undefined): string {
  if (!days || days.length === 0) return ""
  
  const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const dayMap: { [key: string]: string } = {
    "Sunday": "Sun",
    "Monday": "Mon", 
    "Tuesday": "Tue",
    "Wednesday": "Wed",
    "Thursday": "Thu",
    "Friday": "Fri",
    "Saturday": "Sat"
  }
  
  // convert full names to short names and sort by day order
  const shortDays = days.map(day => dayMap[day] || day)
  const sortedDays = shortDays.sort((a, b) => 
    dayOrder.indexOf(a) - dayOrder.indexOf(b)
  )
  
  return sortedDays.join(", ")
}

// single menu item
export default function MenuItemCard({ item, onClick }: Props) {
  // determine price display (price vs starting at price)
  const displayPrice = item.halfPrice && item.hasHalfOrder 
    ? `Starting at $${(item.halfPrice / 100).toFixed(2)}`
    : `$${(item.price / 100).toFixed(2)}`

  return (
    <Card onClick={onClick} className="cursor-pointer hover:shadow-lg bg-[#F3E9D7]">
      <CardContent className="p-4">
        <Image
          src={item.imageUrl || "https://placehold.co/300x180"}
          alt={item.name}
          width={300}
          height={180}
          className="w-full h-36 object-cover rounded-md mb-2"
        />

        <h3 className="text-lg font-bold text-[#4A2F1B]">{item.name}</h3>
        <p className="text-sm text-[#6B4C32]">
          {formatAvailableDays(item.availableDays)}
        </p>
        <div className="mt-2 flex items-center justify-between px-2 py-1 border border-[#6B4C32] rounded text-sm text-[#4A2F1B]">
          <span>{displayPrice}</span>
          <span>›</span>
        </div>
      </CardContent>
    </Card>
  )
}

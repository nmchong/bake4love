"use client"
import { useState, useEffect } from "react"
import CalendarRow from "@/components/CalendarRow"
import HeroSection from "@/components/HeroSection"
import TimeSlots from "@/components/TimeSlots"
import MenuSection from "@/components/MenuSection"
import { MenuItem } from "@prisma/client"
import { format } from "date-fns"
import Cart from "@/components/Cart"

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [availableDates, setAvailableDates] = useState<{ [key: string]: boolean }>({})
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])

  // fetch availability for the next 14 days
  useEffect(() => {
    const fetchAvailability = async () => {
      const result: { [key: string]: boolean } = {}
      for (let i = 0; i < 14; i++) {
        const date = new Date()
        date.setDate(date.getDate() + i)
        const iso = format(date, 'yyyy-MM-dd')

        const res = await fetch(`/api/availability?date=${iso}`)
        const data = await res.json()
        result[iso] = data.available
      }
      setAvailableDates(result)
    }

    fetchAvailability()
  }, [])

  // fetch menu items for selectedDate
  useEffect(() => {
    const fetchMenuItems = async () => {
      const iso = format(selectedDate, 'yyyy-MM-dd')
      const res = await fetch(`/api/menu?date=${iso}`)
      const data = await res.json()
      setMenuItems(data || [])
    }

    fetchMenuItems()
  }, [selectedDate])




  return (
    <>
      <HeroSection />
      <CalendarRow
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
        availableDates={availableDates}
      />
      <TimeSlots selectedDate={selectedDate} />
      <MenuSection items={menuItems}/>
      <Cart />
    </>
  )
}

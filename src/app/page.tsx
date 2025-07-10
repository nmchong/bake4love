"use client"
import { useState, useEffect } from "react"
import CalendarRow from "@/components/CalendarRow"
import HeroSection from "@/components/HeroSection"
import TimeSlots from "@/components/TimeSlots"
import MenuSection from "@/components/MenuSection"
import { MenuItem } from "@prisma/client"
import { format } from "date-fns"
import Cart from "@/components/Cart"
import { CartProvider, useCart } from "@/components/CartContext"

function HomePageInner() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [availableDates, setAvailableDates] = useState<{ [key: string]: boolean }>({})
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [showDateWarning, setShowDateWarning] = useState(false)
  const [pendingDate, setPendingDate] = useState<Date | null>(null)
  const { setPickupDate, resetCart } = useCart()

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

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  const confirmSwitchDate = () => {
    if (pendingDate) {
      const iso = format(pendingDate, 'yyyy-MM-dd')
      resetCart()
      setSelectedDate(pendingDate)
      setPickupDate(iso)
      setShowDateWarning(false)
      setPendingDate(null)
    }
  }

  const cancelSwitchDate = () => {
    setShowDateWarning(false)
    setPendingDate(null)
  }

  return (
    <>
      <HeroSection />
      <CalendarRow
        selectedDate={selectedDate}
        onSelect={handleDateSelect}
        availableDates={availableDates}
      />
      <TimeSlots selectedDate={selectedDate} />
      <MenuSection items={menuItems} selectedDate={format(selectedDate, 'yyyy-MM-dd')} />
      <Cart />
      {showDateWarning && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold mb-2">Switch delivery date?</h2>
            <p className="mb-4">Switching your delivery date will reset your cart. Continue?</p>
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={cancelSwitchDate}>Cancel</button>
              <button className="px-4 py-2 rounded bg-black text-white" onClick={confirmSwitchDate}>Switch Date</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function HomePage() {
  return (
    <CartProvider>
      <HomePageInner />
    </CartProvider>
  )
}

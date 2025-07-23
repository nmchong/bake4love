"use client"
import { useState, useEffect } from "react"
import CalendarRow from "@/components/customer/CalendarRow"
import HeroSection from "@/components/customer/HeroSection"
import TimeSlots from "@/components/customer/TimeSlots"
import MenuSection from "@/components/customer/MenuSection"
import { MenuItem } from "@prisma/client"
import { format } from "date-fns"
import Cart from "@/components/customer/Cart"
import { useCart } from "@/components/customer/CartContext"


export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [availableDates, setAvailableDates] = useState<{ [key: string]: boolean }>({})
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [showDateWarning, setShowDateWarning] = useState(false)
  const [pendingDate, setPendingDate] = useState<Date | null>(null)
  const { setPickupDate, resetCart } = useCart()

  // fetch availability for the next 14 days
  useEffect(() => {
    const fetchAvailability = async () => {
      const today = new Date();
      const start = format(today, 'yyyy-MM-dd');
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 13);
      const end = format(endDate, 'yyyy-MM-dd');
      const res = await fetch(`/api/availability-range?start=${start}&end=${end}`);
      const data = await res.json();
      // data is an array of { date, timeSlots }
      // treat as available if timeSlots is not null
      const result: { [key: string]: boolean } = {};
      for (const entry of data) {
        result[entry.date] = entry.timeSlots !== null;
      }
      setAvailableDates(result);
    };
    fetchAvailability();
  }, []);

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

  // handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }


  // confirm switch pickup date
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
        <div className="fixed inset-0 flex items-center justify-center bg-[#4A2F1B] bg-opacity-40 z-50">
          <div className="bg-[#FAF7ED] p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold mb-2 text-[#4A2F1B]">Switch delivery date?</h2>
            <p className="mb-4 text-[#6B4C32]">Switching your delivery date will reset your cart. Continue?</p>
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 rounded bg-[#FAF7ED] text-[#4A2F1B] border" onClick={cancelSwitchDate}>Cancel</button>
              <button className="px-4 py-2 rounded bg-[#A4551E] text-[#FFFDF5] hover:bg-[#843C12]" onClick={confirmSwitchDate}>Switch Date</button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}

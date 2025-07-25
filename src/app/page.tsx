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
import NoAvailabilityBanner from "@/components/customer/NoAvailabilityBanner";
import MenuItemModal from "@/components/customer/MenuItemModal";


export default function HomePage() {
  // Use null for selectedDate when All Items is selected
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableDates, setAvailableDates] = useState<{ [key: string]: boolean }>({})
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [showDateWarning, setShowDateWarning] = useState(false)
  const [pendingDate, setPendingDate] = useState<Date | null>(null)
  const { setPickupDate, resetCart } = useCart()
  // show "all items" by default
  const [showAllItems, setShowAllItems] = useState(true);
  const [allItemsModal, setAllItemsModal] = useState<{ open: boolean, item: MenuItem | null }>({ open: false, item: null });
  const [allActiveMenuItems, setAllActiveMenuItems] = useState<MenuItem[]>([]);

  // fetch availability for the next 14 days
  useEffect(() => {
    const fetchAvailability = async () => {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + 4); // start 4 days from now
      const start = format(startDate, 'yyyy-MM-dd');
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 13); // 14 days from new start
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


  // fetch all active menu items for All Items view
  useEffect(() => {
    if (showAllItems) {
      const fetchAllActiveMenuItems = async () => {
        const res = await fetch(`/api/menu`)
        const data = await res.json()
        setAllActiveMenuItems(data || [])
      }
      fetchAllActiveMenuItems()
    }
  }, [showAllItems])

  // fetch menu items for selectedDate
  useEffect(() => {
    const fetchMenuItems = async () => {
      const iso = format(selectedDate || new Date(), 'yyyy-MM-dd')
      const res = await fetch(`/api/menu?date=${iso}`)
      const data = await res.json()
      setMenuItems(data || [])
    }
    fetchMenuItems()
  }, [selectedDate])

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

  // determine if all visible days are unavailable (to show no availability banner)
  const visibleDates = (() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() + 4);
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  })();
  const allUnavailable = visibleDates.every(date => {
    const iso = format(date, 'yyyy-MM-dd');
    return !availableDates[iso];
  });


  return (
    <>
      <HeroSection />
      {allUnavailable && <NoAvailabilityBanner />}

      <CalendarRow
        selectedDate={selectedDate ?? new Date()}
        onSelect={date => { setSelectedDate(date); setShowAllItems(false); }}
        availableDates={availableDates}
        allItemsSelected={showAllItems}
        onSelectAllItems={() => { setShowAllItems(true); setSelectedDate(null); }}
      />
      {/* show TimeSlots only when a date is selected (not All Items) */}
      {!showAllItems && selectedDate && (
        <TimeSlots selectedDate={selectedDate} />
      )}

      <MenuSection
        items={showAllItems ? allActiveMenuItems : menuItems}
        selectedDate={showAllItems || !selectedDate ? "" : format(selectedDate, 'yyyy-MM-dd')}
        {...(showAllItems
          ? {
              onMenuItemClick: (item: MenuItem) => setAllItemsModal({ open: true, item }),
              disableAddToCart: true,
            }
          : {})}
      />
      {allItemsModal.open && allItemsModal.item && (
        <MenuItemModal
          menuItem={allItemsModal.item}
          onClose={() => setAllItemsModal({ open: false, item: null })}
          disableAddToCart={showAllItems}
        />
      )}

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

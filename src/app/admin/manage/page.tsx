"use client"

import { useEffect, useState, useCallback } from "react"
import { toZonedTime, format as formatTz, fromZonedTime } from "date-fns-tz"
import AdminSidebar from "@/components/admin/shared/AdminSidebar"
import AvailabilityCalendar from "@/components/admin/manage/AvailabilityCalendar"
import DateDetailsPane from "@/components/admin/manage/DateDetailsPane"
import CompactMenuToggleTable from "@/components/admin/manage/CompactMenuToggleTable"
import UnsavedChangesBanner from "@/components/admin/manage/UnsavedChangesBanner"

interface MenuItemToggle {
  id: string
  name: string
  active: boolean
  availableDays: string[]
}

interface Availability {
  timeSlots: string[]
}

const TIMEZONE = "America/Los_Angeles"
const DAY_NAMES = ['Sun','Mon','Tues','Wed','Thurs','Fri','Sat']

export default function AdminManagePage() {
  // state
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [ordersByDate, setOrdersByDate] = useState<Record<string, number>>({})
  const [availabilityByDate, setAvailabilityByDate] = useState<Record<string, Availability | undefined>>({})
  const [menuItems, setMenuItems] = useState<MenuItemToggle[]>([])
  const [menuItemsDraft, setMenuItemsDraft] = useState<MenuItemToggle[]>([])
  const [menuDirty, setMenuDirty] = useState(false)
  const [menuSaving, setMenuSaving] = useState(false)
  const [availabilityDraft, setAvailabilityDraft] = useState<{ isAvailable: boolean; selectedTimeSlots: string[] }>({ isAvailable: false, selectedTimeSlots: [] })
  const [availabilityDirty, setAvailabilityDirty] = useState(false)
  const [availabilitySaving, setAvailabilitySaving] = useState(false)
  const [menuError, setMenuError] = useState<string | null>(null)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // customer view range: today to 14 days from today
  const today = new Date()
  const customerViewRange = {
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 13)
  }

  // helper: get all dates in current month (in local timezone)
  function getMonthDates(date: Date) {
    const zoned = toZonedTime(date, TIMEZONE)
    const year = zoned.getFullYear()
    const month = zoned.getMonth()
    const firstDay = toZonedTime(new Date(year, month, 1), TIMEZONE)
    const lastDay = toZonedTime(new Date(year, month + 1, 0), TIMEZONE)
    const days: Date[] = []
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d))
    }
    return days
  }

  // format date as yyyy-mm-dd in local timezone
  function formatDateLocal(date: Date) {
    return formatTz(toZonedTime(date, TIMEZONE), 'yyyy-MM-dd', { timeZone: TIMEZONE })
  }

  // fetch all data for the current month
  const fetchMonthData = useCallback(async (monthDate: Date) => {
    // 1. fetch menu items
    const menuRes = await fetch("/api/admin/menu")
    if (!menuRes.ok) throw new Error("Failed to fetch menu items")
    const menuData = await menuRes.json()
    setMenuItems(menuData)
    setMenuItemsDraft(menuData)

    // 2. fetch availability and orders for each date in the month
    const monthDates = getMonthDates(monthDate)
    const dateStrs = monthDates.map(d => formatDateLocal(d))
    // availability
    const availResults = await Promise.all(dateStrs.map(async date => {
      const res = await fetch(`/api/availability?date=${date}`)
      if (!res.ok) return [date, undefined]
      const data = await res.json()
      return [date, data.available ? { timeSlots: data.timeSlots } : undefined]
    }))
    setAvailabilityByDate(Object.fromEntries(availResults))
    // orders
    const orderResults = await Promise.all(dateStrs.map(async date => {
      const res = await fetch(`/api/admin/orders?date=${date}`)
      if (!res.ok) return [date, 0]
      const data = await res.json()
      return [date, Array.isArray(data.orders) ? data.orders.length : 0]
    }))
    setOrdersByDate(Object.fromEntries(orderResults))
  }, [])

  useEffect(() => {
    setLoading(true)
    setMenuError(null)
    setAvailabilityError(null)
    fetchMonthData(selectedDate)
      .catch(() => {
        setMenuError("Failed to load data")
        setAvailabilityError("Failed to load data")
      })
      .finally(() => setLoading(false))
  }, [fetchMonthData, selectedDate])

  // when selectedDate or availabilityByDate changes, update availabilityDraft
  useEffect(() => {
    const key = formatDateLocal(selectedDate)
    const avail = availabilityByDate[key]
    setAvailabilityDraft({
      isAvailable: !!avail,
      selectedTimeSlots: avail?.timeSlots || []
    })
    setAvailabilityDirty(false)
  }, [selectedDate, availabilityByDate])

  // menu dirty tracking
  useEffect(() => {
    setMenuDirty(JSON.stringify(menuItems) !== JSON.stringify(menuItemsDraft))
  }, [menuItems, menuItemsDraft])

  // availability dirty tracking
  useEffect(() => {
    const key = formatDateLocal(selectedDate)
    const avail = availabilityByDate[key]
    setAvailabilityDirty(
      availabilityDraft.isAvailable !== !!avail ||
      JSON.stringify(availabilityDraft.selectedTimeSlots) !== JSON.stringify(avail?.timeSlots || [])
    )
  }, [availabilityDraft, availabilityByDate, selectedDate])

  // handlers for calendar/date details
  const handleSelectDate = (date: Date) => setSelectedDate(date)
  const handleToggleAvailable = (available: boolean) => setAvailabilityDraft(draft => ({ ...draft, isAvailable: available }))
  const handleTimeSlotChange = (slot: string) => {
    setAvailabilityDraft(draft => {
      const set = new Set(draft.selectedTimeSlots)
      if (set.has(slot)) set.delete(slot)
      else set.add(slot)
      return { ...draft, selectedTimeSlots: Array.from(set) }
    })
  }
  const handleAvailabilitySave = async () => {
    setAvailabilitySaving(true)
    setAvailabilityError(null)
    try {
      // save availability for selectedDate
      const key = formatDateLocal(selectedDate)
      // convert to UTC midnight for the business timezone
      const utcDate = fromZonedTime(key, TIMEZONE)
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: utcDate.toISOString(), timeSlots: availabilityDraft.isAvailable ? availabilityDraft.selectedTimeSlots : [] })
      })
      if (!res.ok) throw new Error("Failed to save availability")
      // refetch availability for the month
      await fetchMonthData(selectedDate)
      setAvailabilityDirty(false)
    } catch {
      setAvailabilityError("Failed to save availability")
    } finally {
      setAvailabilitySaving(false)
    }
  }

  // handlers for menu toggles
  const handleMenuChange = useCallback((items: MenuItemToggle[]) => {
    setMenuItemsDraft(items)
  }, [])
  const handleMenuSave = async () => {
    setMenuSaving(true)
    setMenuError(null)
    try {
      // save only changed menu items
      const menuItemsById = Object.fromEntries(menuItems.map(item => [item.id, item]));
      const changed = menuItemsDraft.filter(item => {
        const orig = menuItemsById[item.id];
        return (
          orig &&
          (item.active !== orig.active || JSON.stringify(item.availableDays) !== JSON.stringify(orig.availableDays))
        );
      });
      await Promise.all(changed.map(item =>
        fetch(`/api/admin/menu/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: item.active, availableDays: item.availableDays })
        })
      ))
      setMenuItems(menuItemsDraft)
      setMenuDirty(false)
    } catch {
      setMenuError("Failed to save menu toggles")
    } finally {
      setMenuSaving(false)
    }
  }

  // menu preview for selected date (active and available that day)
  const dayOfWeek = DAY_NAMES[selectedDate.getDay()]
  const menuPreview = menuItems.filter(item => item.active && item.availableDays.includes(dayOfWeek))
  const key = formatDateLocal(selectedDate)
  const ordersCount = ordersByDate[key] || 0
  const hasOrders = ordersCount > 0

  return (
    <div className="flex min-h-screen">
      <div className="border-r bg-gray-50 min-h-screen">
        <AdminSidebar />
      </div>
      <main className="flex-1 max-w-5xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Manage Availability & Menu</h1>
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
        <div className="flex gap-8">
          <div className="flex-1 min-w-[350px]">
            <AvailabilityCalendar
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              ordersByDate={ordersByDate}
              availabilityByDate={availabilityByDate}
              customerViewRange={customerViewRange}
              formatDateLocal={formatDateLocal}
            />
            <UnsavedChangesBanner message={availabilityError || "You have unsaved changes"} visible={availabilityDirty || !!availabilityError} />
            <DateDetailsPane
              date={selectedDate}
              ordersCount={ordersCount}
              isAvailable={availabilityDraft.isAvailable}
              hasOrders={hasOrders}
              menuItems={menuPreview}
              selectedTimeSlots={availabilityDraft.selectedTimeSlots}
              onToggleAvailable={handleToggleAvailable}
              onTimeSlotChange={handleTimeSlotChange}
              onSave={handleAvailabilitySave}
              isDirty={availabilityDirty}
              isSaving={availabilitySaving}
            />
          </div>
          <div className="flex-1 min-w-[350px]">
            <UnsavedChangesBanner message={menuError || "You have unsaved changes"} visible={menuDirty || !!menuError} />
            <CompactMenuToggleTable
              menuItems={menuItemsDraft}
              onChange={handleMenuChange}
              isDirty={menuDirty}
              onSave={handleMenuSave}
              isSaving={menuSaving}
              dayNames={DAY_NAMES}
            />
          </div>
        </div>
        )}
      </main>
    </div>
  )
} 
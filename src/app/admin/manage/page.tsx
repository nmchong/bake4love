"use client"

import { useEffect, useState, useCallback } from "react"
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

  // helper: get all dates in current month
  function getMonthDates(date: Date) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: Date[] = []
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d))
    }
    return days
  }

  // fetch all data for the current month
  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      setMenuError(null)
      setAvailabilityError(null)
      try {
        // 1. fetch menu items
        const menuRes = await fetch("/api/admin/menu")
        if (!menuRes.ok) throw new Error("Failed to fetch menu items")
        const menuData = await menuRes.json()
        setMenuItems(menuData)
        setMenuItemsDraft(menuData)

        // 2. fetch availability and orders for each date in the month
        const monthDates = getMonthDates(selectedDate)
        const dateStrs = monthDates.map(d => d.toISOString().slice(0, 10))
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
          return [date, Array.isArray(data) ? data.length : 0]
        }))
        setOrdersByDate(Object.fromEntries(orderResults))
      } catch {
        setMenuError("Failed to load data")
        setAvailabilityError("Failed to load data")
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [selectedDate]);

  // when selectedDate or availabilityByDate changes, update availabilityDraft
  useEffect(() => {
    const key = selectedDate.toISOString().slice(0, 10)
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
    const key = selectedDate.toISOString().slice(0, 10)
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
      const key = selectedDate.toISOString().slice(0, 10)
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: key, timeSlots: availabilityDraft.isAvailable ? availabilityDraft.selectedTimeSlots : [] })
      })
      if (!res.ok) throw new Error("Failed to save availability")
      // refetch availability for this date
      const data = await res.json()
      setAvailabilityByDate(prev => ({
        ...prev,
        [key]: data.available ? { timeSlots: data.timeSlots } : undefined
      }))
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
  const dayOfWeek = selectedDate.toLocaleDateString("en-US", { weekday: "short" })
  const menuPreview = menuItems.filter(item => item.active && item.availableDays.includes(dayOfWeek))
  const key = selectedDate.toISOString().slice(0, 10)
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
            />
          </div>
        </div>
        )}
      </main>
    </div>
  )
} 
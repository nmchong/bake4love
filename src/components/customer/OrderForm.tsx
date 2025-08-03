"use client"

import { useCart } from "./CartContext"
import { parseISO, format } from "date-fns"
import { toZonedTime } from "date-fns-tz"

export interface OrderFormValues {
  name: string
  email: string
  notes: string
}

interface OrderFormProps {
  values: OrderFormValues
  onChange: (values: OrderFormValues) => void
}

export default function OrderForm({ values, onChange }: OrderFormProps) {
  const { pickupDate, pickupTime } = useCart()

  const handleChange = (field: keyof OrderFormValues, value: string) => {
    onChange({ ...values, [field]: value })
  }

  // format date for display
  const formatPickupDate = (dateString: string | null) => {
    if (!dateString) return "Not selected"
    // use the same timezone handling as Cart.tsx
    const date = toZonedTime(parseISO(dateString), 'America/Los_Angeles')
    return format(date, 'EEEE, MMMM d, yyyy')
  }

  // format time for display
  const formatPickupTime = (timeString: string | null) => {
    if (!timeString) return "Not selected"
    
    // parse the time and format as 30-minute timeslot with AM/PM
    const time = new Date(`2000-01-01T${timeString}`)
    const startTime = time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
    
    // calculate end time (30 minutes later)
    const endTime = new Date(time.getTime() + 30 * 60 * 1000)
    const endTimeFormatted = endTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
    
    return `${startTime} - ${endTimeFormatted}`
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-[#4A2F1B]">Customer Info</h2>

      {/* pickup information */}
      <div className="bg-[#FFFDF5] rounded-lg p-4 space-y-2">
        <h3 className="font-medium text-[#4A2F1B]">Pickup Details</h3>
        <div className="text-sm text-gray-700">
          <p><span className="font-semibold">Date:</span> {formatPickupDate(pickupDate)}</p>
          <p><span className="font-semibold">Time:</span> {formatPickupTime(pickupTime)}</p>
        </div>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Name"
          className="w-full border rounded-lg p-4 text-lg"
          value={values.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded-lg p-4 text-lg"
          value={values.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />
        <textarea
          placeholder="Notes (optional)"
          className="w-full border rounded-lg p-4 text-lg"
          rows={4}
          value={values.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
        />
      </div>

    </div>
  )
}

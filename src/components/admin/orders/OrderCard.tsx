import { format, parseISO } from "date-fns"
import { toZonedTime, format as formatTz } from "date-fns-tz"
import FulfillButton from "./FulfillButton"
import type { Order } from "@/types/order"

const TIMEZONE = "America/Los_Angeles"

interface OrderCardProps {
  order: Order
  onFulfilled: () => void
}

export default function OrderCard({ order, onFulfilled }: OrderCardProps) {
  const laPickupDate = toZonedTime(order.pickupDate, TIMEZONE)
  const displayPickupDate = formatTz(laPickupDate, "PPP", { timeZone: TIMEZONE })
  return (
    <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="font-bold text-lg">Order #{order.id.slice(0, 8)}</div>
        <div className="text-sm text-gray-500">{format(parseISO(order.createdAt), 'PPP p')}</div>
      </div>
      <div className="mb-2">
        <span className="font-semibold">Customer:</span> {order.customerName} ({order.customerEmail})
      </div>
      <div className="mb-2">
        <span className="font-semibold">Pickup:</span> {displayPickupDate} at {order.pickupTime}
      </div>
      {order.notes && (
        <div className="mb-2"><span className="font-semibold">Notes:</span> {order.notes}</div>
      )}
      <div className="mb-2">
        <span className="font-semibold">Status:</span> <span className="capitalize">{order.status}</span>
      </div>
      <div className="mb-2">
        <span className="font-semibold">Total:</span> ${(order.cost / 100).toFixed(2)}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Items:</span>
        <ul className="ml-4 mt-1 list-disc text-sm">
          {order.orderItems.map(item => (
            <li key={item.id}>
              {item.menuItem.name} ({item.variant}) × {item.quantity}
            </li>
          ))}
        </ul>
      </div>
      {order.status !== "fulfilled" && (
        <div className="mt-4">
          <FulfillButton orderId={order.id} onFulfilled={onFulfilled} />
        </div>
      )}
    </div>
  )
} 
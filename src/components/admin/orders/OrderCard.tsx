import { format, parseISO, addMinutes, parse } from "date-fns"
import { toZonedTime, format as formatTz } from "date-fns-tz"
import type { Order } from "@/types/order"

const TIMEZONE = "America/Los_Angeles"

interface OrderCardProps {
  order: Order
}

export default function OrderCard({ order }: OrderCardProps) {
  const laPickupDate = toZonedTime(order.pickupDate, TIMEZONE)
  const displayPickupDate = formatTz(laPickupDate, "PPP", { timeZone: TIMEZONE })
  
  // format pickup time as timeslot with am/pm
  function getTimeRangeLabel(time: string) {
    const start = parse(time, 'HH:mm', new Date())
    const end = addMinutes(start, 30)
    return `${format(start, 'h:mm')}-${format(end, 'h:mm')}${format(end, 'a').toLowerCase()}`
  }


  return (
    <div className="border rounded-lg p-6 mb-4 bg-white shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* first column */}
        <div className="space-y-2">
          <div className="font-bold text-lg">Order #{order.id.slice(0, 8)}</div>
          
          <div>
            <span className="font-semibold">Pickup Timeslot:</span> {displayPickupDate} at {getTimeRangeLabel(order.pickupTime)}
          </div>
          
          <div>
            <span className="font-semibold">Customer:</span> {order.customerName} ({order.customerEmail})
          </div>
          
          <div>
            <span className="font-semibold">Status:</span> <span className="capitalize">{order.status}</span>
          </div>
          
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div>
              <span className="font-semibold">Subtotal:</span> ${(order.subtotalCents / 100).toFixed(2)}
            </div>
            
            {order.discountCents > 0 && (
              <div>
                <span className="font-semibold">Discount:</span> -${(order.discountCents / 100).toFixed(2)}
              </div>
            )}
            
            {order.discountCode && (
              <div>
                <span className="font-semibold">Discount Code:</span> {order.discountCode}
              </div>
            )}
            
            <div>
              <span className="font-semibold">Tips:</span> ${(order.tipCents / 100).toFixed(2)}
            </div>
            
            <div>
              <span className="font-semibold">Total:</span> ${(order.totalCents / 100).toFixed(2)}
            </div>
          </div>
        </div>

        {/* second column */}
        <div className="space-y-2">
          <div>
            <span className="font-semibold">Ordered At:</span> {format(parseISO(order.createdAt), 'PPP p')}
          </div>
          
          <div>
            <span className="font-semibold">Customer Notes:</span> {order.notes || "(no notes)"}
          </div>
          
          <div>
            <span className="font-semibold">Items:</span>
            <ul className="ml-4 mt-1 list-disc text-base">
              {order.orderItems.map(item => (
                <li key={item.id}>
                  {item.menuItem.name} ({item.variant}) × {item.quantity}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 
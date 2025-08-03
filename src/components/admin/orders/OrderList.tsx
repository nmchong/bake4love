import OrderCard from "./OrderCard"
import type { Order } from "@/types/order"
import { format } from "date-fns"

interface OrderListProps {
  orders: Order[]
}

export default function OrderList({ orders }: OrderListProps) {
  // sort orders by pickup date first, then by pickup time
  const sortedOrders = [...orders].sort((a, b) => {
    // first sort by date (closest to today on top)
    const dateA = new Date(a.pickupDate)
    const dateB = new Date(b.pickupDate)
    const dateComparison = dateA.getTime() - dateB.getTime()
    
    // if dates are the same, sort by time (earliest first)
    if (dateComparison === 0) {
      return a.pickupTime.localeCompare(b.pickupTime)
    }
    
    return dateComparison
  })

  // group orders by pickup date
  const groupedOrders = sortedOrders.reduce((groups, order) => {
    const pickupDate = new Date(order.pickupDate)
    const dateKey = pickupDate.toISOString().split('T')[0] // YYYY-MM-DD format
    const dateHeader = format(pickupDate, 'MMMM d (EEE)') // date header for grouping
    
    if (!groups[dateKey]) {
      groups[dateKey] = {
        header: dateHeader,
        orders: []
      }
    }
    groups[dateKey].orders.push(order)
    return groups
  }, {} as Record<string, { header: string; orders: Order[] }>)


  return (
    <div>
      {orders.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No orders found.</div>
      ) : (
        Object.values(groupedOrders).map((group, groupIndex) => (
          <div key={groupIndex}>
            <h3 className="text-lg font-semibold text-[#4A2F1B] mb-3 mt-6 first:mt-0">
              {group.header}
            </h3>
            {group.orders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
              />
            ))}
          </div>
        ))
      )}
    </div>
  )
} 
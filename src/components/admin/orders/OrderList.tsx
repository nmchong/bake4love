import OrderCard from "./OrderCard"
import type { Order } from "@/types/order"

interface OrderListProps {
  orders: Order[]
}

export default function OrderList({ orders }: OrderListProps) {
  return (
    <div>
      {orders.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No orders found.</div>
      ) : (
        orders.map(order => (
          <OrderCard
            key={order.id}
            order={order}
          />
        ))
      )}
    </div>
  )
} 
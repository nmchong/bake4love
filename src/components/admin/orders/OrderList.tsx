import OrderCard from "./OrderCard"

interface OrderItem {
  id: string
  quantity: number
  variant: string
  menuItem: {
    id: string
    name: string
    price: number
    halfPrice?: number
  }
}

interface Order {
  id: string
  customerName: string
  customerEmail: string
  pickupDate: string
  pickupTime: string
  notes?: string
  cost: number
  status: string
  createdAt: string
  orderItems: OrderItem[]
}

interface OrderListProps {
  orders: Order[]
  onOrderFulfilled: (orderId: string) => void
}

export default function OrderList({ orders, onOrderFulfilled }: OrderListProps) {
  return (
    <div>
      {orders.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No orders found.</div>
      ) : (
        orders.map(order => (
          <OrderCard
            key={order.id}
            order={order}
            onFulfilled={() => onOrderFulfilled(order.id)}
          />
        ))
      )}
    </div>
  )
} 
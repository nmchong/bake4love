import { useEffect, useState, useCallback } from "react"
import OrderList from "@/components/admin/orders/OrderList"
import type { Order } from "@/types/order"

interface OrdersForDateProps {
  date: Date
}

export default function OrdersForDate({ date }: OrdersForDateProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const iso = date.toISOString().slice(0, 10)
      const res = await fetch(`/api/admin/orders?date=${iso}`)
      if (!res.ok) throw new Error("Failed to fetch orders")
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Unknown error")
      }
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleOrderFulfilled = () => {
    fetchOrders()
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold mb-2">Orders for {date.toLocaleDateString()}</h2>
      {loading ? (
        <div className="text-gray-500 py-4">Loading orders...</div>
      ) : error ? (
        <div className="text-red-500 py-4">{error}</div>
      ) : (
        <OrderList orders={orders} onOrderFulfilled={handleOrderFulfilled} />
      )}
    </div>
  )
} 
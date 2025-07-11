"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { format, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

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

export default function OrderPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const orderId = params.id as string
  const isSuccess = searchParams.get("success") === "1"
  const isCanceled = searchParams.get("canceled") === "1"

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/order/${orderId}`)
        if (!res.ok) {
          if (res.status === 404) {
            setError("Order not found")
          } else {
            setError("Failed to load order")
          }
          setLoading(false)
          return
        }
        const data = await res.json()
        setOrder(data)
      } catch {
        setError("Failed to load order")
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">Loading order...</div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center text-red-500 mb-4">{error || "Order not found"}</div>
        <Button onClick={() => router.push("/")}>Back to Menu</Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Status Messages */}
      {isSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-green-800 font-semibold mb-2">Payment Successful!</h2>
          <p className="text-green-700">Your order has been confirmed. We&apos;ll see you soon!</p>
        </div>
      )}
      
      {isCanceled && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="text-yellow-800 font-semibold mb-2">Payment Canceled</h2>
          <p className="text-yellow-700">Your order is still pending. You can complete payment later.</p>
        </div>
      )}

      {/* Order Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Order #{order.id.slice(0, 8)}</h1>
        <div className="text-gray-600">
          <p>Status: <span className="font-semibold capitalize">{order.status}</span></p>
          <p>Placed: {format(parseISO(order.createdAt), 'PPP')}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="font-semibold mb-2">Customer Information</h2>
        <p><strong>Name:</strong> {order.customerName}</p>
        <p><strong>Email:</strong> {order.customerEmail}</p>
        <p><strong>Pickup Date:</strong> {format(parseISO(order.pickupDate), 'EEEE, MMMM d, yyyy')}</p>
        <p><strong>Pickup Time:</strong> {order.pickupTime}</p>
        {order.notes && <p><strong>Notes:</strong> {order.notes}</p>}
      </div>

      {/* Order Items */}
      <div className="mb-6">
        <h2 className="font-semibold mb-4">Order Items</h2>
        <div className="space-y-3">
          {order.orderItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <p className="font-medium">{item.menuItem.name}</p>
                <p className="text-sm text-gray-600">
                  {item.variant} • Qty: {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  ${((item.variant === "half" ? item.menuItem.halfPrice ?? 0 : item.menuItem.price) * item.quantity / 100).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Total:</span>
          <span>${(order.cost / 100).toFixed(2)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={() => router.push("/")} variant="outline">
          Back to Menu
        </Button>
      </div>
    </div>
  )
} 
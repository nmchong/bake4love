"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { format, parseISO, addMinutes, parse, format as formatDate } from "date-fns"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toZonedTime } from "date-fns-tz"
import Image from "next/image"
import { useCart } from "@/components/customer/CartContext"


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
  const { resetCart, restoreCartFromOrder } = useCart()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingCancel, setProcessingCancel] = useState(false)

  const orderId = params.id as string
  const isSuccess = searchParams.get("success") === "1"
  const isCanceled = searchParams.get("canceled") === "1"

  useEffect(() => {
    // get order (using id) from api
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

  // handle order cancellation (cancel when on Stripe checkout page) - restore cart & delete order
  useEffect(() => {
    const handleCancellation = async () => {
      if (isCanceled && order && !processingCancel) {
        setProcessingCancel(true)
        try {
          // restore cart from order data
          restoreCartFromOrder(order.orderItems, order.pickupDate, order.pickupTime)
          
          // del cancelled order form db
          await fetch(`/api/order/${orderId}`, { method: "DELETE" })
          
          // redirect back to menu
          router.push("/checkout")
        } catch (error) {
          console.error("Error handling cancellation:", error)
          setError("Failed to restore cart. Please try again.")
        } finally {
          setProcessingCancel(false)
        }
      }
    }

    handleCancellation()
  }, [isCanceled, order, orderId, router, restoreCartFromOrder, processingCancel])

  // handle successful payment - reset cart
  useEffect(() => {
    if (isSuccess) {
      resetCart()
    }
  }, [isSuccess, resetCart])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center text-[#6B4C32]">Loading order...</div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center text-[#843C12] mb-4">{error || "Order not found"}</div>
        <Button onClick={() => router.push("/")} variant="outline">
          Back to Menu
        </Button>
      </div>
    )
  }

  // show loading state while processing cancellation
  if (processingCancel) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center text-[#6B4C32]">Restoring your cart...</div>
      </div>
    )
  }

  function getTimeRangeLabel(time: string) {
    const start = parse(time, 'HH:mm', new Date())
    const end = addMinutes(start, 30)
    return `${formatDate(start, 'h:mm')}-${formatDate(end, 'h:mm')}${formatDate(end, 'a').toLowerCase()}`
  }


  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      {/* bakery icon/header & success/cancel msg */}
      <div className="flex flex-col items-center mb-6">
        <Image src="/globe.svg" alt="Bakery Logo" width={48} height={48} className="mb-2" />
        <h1 className="text-2xl md:text-3xl font-bold text-[#A4551E] mb-4">Thank you for your order!</h1>
        {isSuccess && (
          <div className="mb-2 px-4 py-4 rounded bg-green-50 border border-green-200 text-green-800 text-center w-full max-w-md">
            <span className="font-semibold">Payment Successful!</span><br />Your order has been confirmed. We&apos;ll see you soon!
          </div>
        )}
        {isCanceled && (
          <div className="mb-2 px-4 py-2 rounded bg-yellow-50 border border-yellow-200 text-yellow-800 text-center w-full max-w-md">
            <span className="font-semibold">Payment Canceled</span><br />Your cart has been restored. You can complete your order later.
          </div>
        )}
      </div>

      {/* main card */}
      <div className="bg-[#FAF7ED] rounded-2xl shadow-md p-6 md:p-8 border border-[#E5DED6]">
        {/* order header */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <div className="text-lg font-bold text-[#4A2F1B] mb-1">Order <span className="text-[#A4551E]">#{order.id.slice(0, 8)}</span></div>
            <div className="text-sm text-[#6B4C32]">Status: <span className="font-semibold capitalize text-[#A4551E]">{order.status}</span></div>
            <div className="text-sm text-[#6B4C32]">Placed: {format(parseISO(order.createdAt), 'PPP')}</div>
          </div>
        </div>

        {/* customer info */}
        <div className="mb-6 p-4 rounded-xl bg-[#FFFDF5] border border-[#E5DED6]">
          <h2 className="font-semibold mb-2 text-[#4A2F1B]">Customer Information</h2>
          <p><span className="font-semibold">Name:</span> {order.customerName}</p>
          <p><span className="font-semibold">Email:</span> {order.customerEmail}</p>
          <p><span className="font-semibold">Pickup Date:</span> {format(toZonedTime(parseISO(order.pickupDate), 'America/Los_Angeles'), 'EEEE, MMMM d, yyyy')}</p>
          <p><span className="font-semibold">Pickup Time:</span> {getTimeRangeLabel(order.pickupTime)}</p>
          {order.notes && <p><span className="font-semibold">Notes:</span> {order.notes}</p>}
        </div>

        {/* order items */}
        <div className="mb-6">
          <h2 className="font-semibold mb-4 text-[#4A2F1B]">Order Items</h2>
          <div className="space-y-3">
            {order.orderItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 rounded-lg border border-[#E5DED6] bg-[#FFFDF5]">
                <div>
                  <p className="font-medium text-[#4A2F1B]">{item.menuItem.name}</p>
                  <p className="text-sm text-[#6B4C32]">{item.variant} • Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#4A2F1B]">
                    ${((item.variant === "half" ? item.menuItem.halfPrice ?? 0 : item.menuItem.price) * item.quantity / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* total cost */}
        <div className="mb-6 p-4 rounded-xl bg-[#FFFDF5] border border-[#E5DED6] flex justify-between items-center text-lg font-semibold text-[#4A2F1B]">
          <span>Total:</span>
          <span>${(order.cost / 100).toFixed(2)}</span>
        </div>

        {/* back to menu */}
        <div className="flex gap-4 justify-end">
          <Button onClick={() => router.push("/")}>
            Back to Menu
          </Button>
        </div>
      </div>
    </div>
  )
} 
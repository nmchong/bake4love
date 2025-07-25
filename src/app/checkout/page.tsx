"use client"

import OrderForm, { OrderFormValues } from "@/components/customer/OrderForm"
import OrderSummary from "@/components/customer/OrderSummary"
import { useCart } from "@/components/customer/CartContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useState } from "react"


export default function CheckoutPage() {
  const { cartItems, pickupDate, pickupTime } = useCart()
  const router = useRouter()
  const [form, setForm] = useState<OrderFormValues>({ name: "", email: "", notes: "" })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit =
    cartItems.length > 0 &&
    pickupDate &&
    pickupTime &&
    form.email.trim() !== "" &&
    !submitting

  const handleSubmit = async () => {
    setError(null)
    setSubmitting(true)
    try {
      // create the order
      const orderRes = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: form.email,
          customerName: form.name,
          pickupDate,
          pickupTime,
          notes: form.notes,
          cart: cartItems.map(item => ({
            menuItemId: item.id,
            quantity: item.quantity,
            variant: item.variant
          }))
        })
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok || !orderData.success) {
        setError(orderData.error || "Failed to place order.")
        setSubmitting(false)
        return
      }

      // create stripe checkout session
      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData.orderId })
      })
      const checkoutData = await checkoutRes.json()
      if (!checkoutRes.ok || !checkoutData.url) {
        setError(checkoutData.error || "Failed to create checkout session.")
        setSubmitting(false)
        return
      }

      // redirect to stripe checkout
      window.location.href = checkoutData.url
    } catch {
      setError("Something went wrong. Please try again.")
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      <button className="mb-4 text-[#4B5B66] underline" onClick={() => router.push("/")}>← Back to Menu</button>

      <OrderForm values={form} onChange={setForm} />
      <OrderSummary cartItems={cartItems} />

      <Button className="mt-4" onClick={handleSubmit} disabled={!canSubmit}>
        {submitting ? "Creating Checkout Session..." : "Proceed to Payment"}
      </Button>

      {error && <div className="col-span-2 text-[#843C12] mt-2">{error}</div>}
    </div>
  )
}

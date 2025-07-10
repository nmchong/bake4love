"use client"

import OrderForm from "@/components/OrderForm"
import OrderSummary from "@/components/OrderSummary"
import { useCart } from "@/components/CartContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

function CheckoutPageContent() {
  const { cartItems } = useCart()
  const router = useRouter()

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      <button className="mb-4 text-blue-600 underline" onClick={() => router.back()}>← Back to Menu</button>
      <OrderForm />
      <OrderSummary cartItems={cartItems} />
      <Button disabled className="mt-4">Proceed to Payment (coming soon)</Button>
    </div>
  )
}

export default function CheckoutPage() {
  return <CheckoutPageContent />
}

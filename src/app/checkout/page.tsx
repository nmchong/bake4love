"use client"

import { useState } from "react"
import OrderForm from "@/components/OrderForm"
import OrderSummary from "@/components/OrderSummary"
import { Button } from "@/components/ui/button"

export default function CheckoutPage() {

  // mock cart for now
  const [cartItems] = useState<{ id: string; name: string; price: number; quantity: number; variant: "full" | "half" }[]>([
    { id: "1", name: "Veggie Pizza", price: 1000, quantity: 1, variant: "full" },
    { id: "2", name: "Tandoori Roll", price: 700, quantity: 2, variant: "half" }
  ])



  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      <OrderForm />
      <OrderSummary cartItems={cartItems} />
      <Button disabled>Proceed to Payment (coming soon)</Button>
    </div>
  )
}

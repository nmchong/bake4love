import React from "react"

interface OrderSummaryProps {
  cartItems: {
    id: string
    name: string
    quantity: number
    price: number
    variant: "full" | "half"
  }[]
  tipCents?: number
}


export default function OrderSummary({ cartItems, tipCents = 0 }: OrderSummaryProps) {
  const subtotal = cartItems.reduce((acc, item) => {
    return acc + item.price * item.quantity
  }, 0)
  
  const totalCost = subtotal + tipCents

  return (
    <div className="p-4 border rounded-md shadow-md bg-[#FAF7ED] text-[#4A2F1B]">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>

      {/* cart items */}
      <ul>
        {cartItems.map((item) => (
          <li key={`${item.id}-${item.variant}`} className="py-2 flex justify-between">
            <span>
              {item.name} ({item.variant}) x{item.quantity}
            </span>
            <span>${((item.price * item.quantity) / 100).toFixed(2)}</span>
          </li>
        ))}
      </ul>

      {/* subtotal, tip, total */}
      <div className="mt-4 space-y-2 py-4 border-t border-gray-200">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${(subtotal / 100).toFixed(2)}</span>
        </div>
        {tipCents > 0 && (
          <div className="flex justify-between">
            <span>Tip:</span>
            <span>${(tipCents / 100).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-lg border-t pt-2">
        <span>Total:</span>
        <span>${(totalCost / 100).toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}


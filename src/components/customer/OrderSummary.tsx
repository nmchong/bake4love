import React from "react"

interface OrderSummaryProps {
  cartItems: {
    id: string
    name: string
    quantity: number
    price: number
    variant: "full" | "half"
  }[]
}


export default function OrderSummary({ cartItems }: OrderSummaryProps) {
  const totalCost = cartItems.reduce((acc, item) => {
    return acc + item.price * item.quantity
  }, 0)

  return (
    <div className="p-4 border rounded-md shadow-md bg-[#FAF7ED] text-[#4A2F1B]">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>

      <ul className="divide-y divide-gray-200">
        {cartItems.map((item) => (
          <li key={`${item.id}-${item.variant}`} className="py-2 flex justify-between">
            <span>
              {item.name} ({item.variant}) x{item.quantity}
            </span>
            <span>${((item.price * item.quantity) / 100).toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between font-semibold text-lg">
        <span>Total:</span>
        <span>${(totalCost / 100).toFixed(2)}</span>
      </div>
    </div>
  )
}


import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "./CartContext"

interface OrderSummaryProps {
  cartItems: {
    id: string
    name: string
    quantity: number
    price: number
    variant: "full" | "half"
  }[]
  subtotalCents: number
  discountCents: number
  tipCents: number
  totalCents: number
  discountCode: string
  discountDescription?: string | null
  onValidateDiscount: (code: string) => Promise<void>
  onClearDiscount?: () => void
  isValidatingDiscount: boolean
  discountError: string | null
}

export default function OrderSummary({ 
  cartItems, 
  subtotalCents,
  discountCents,
  tipCents = 0,
  totalCents,
  discountCode,
  discountDescription,
  onValidateDiscount,
  onClearDiscount,
  isValidatingDiscount,
  discountError
}: OrderSummaryProps) {
  const { setDiscountCode, setDiscountCents, setDisplayDiscountCode } = useCart()
  const [discountInput, setDiscountInput] = useState("") // display the user-entered code
  const [displayDiscountCode, setLocalDisplayDiscountCode] = useState(discountCode) // the code user entered (like SAVE20)

  // recalculate discount when cart items change
  useEffect(() => {
    if (discountCode && discountCode !== displayDiscountCode) {
      // this means we have a stored promotion code ID, but need to re-validate with new subtotal
      if (displayDiscountCode) {
        onValidateDiscount(displayDiscountCode)
      }
    }
  }, [subtotalCents, discountCode, displayDiscountCode, onValidateDiscount])

  // update local display when prop changes
  useEffect(() => {
    setLocalDisplayDiscountCode(discountCode)
  }, [discountCode])

  const handleDiscountSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (discountInput.trim()) {
      onValidateDiscount(discountInput.trim())
    }
  }

  const handleClearDiscount = () => {
    setDiscountCode("")
    setDiscountCents(0)
    setDisplayDiscountCode("")
    setLocalDisplayDiscountCode("")
    setDiscountInput("")
    // Call parent's clear function if provided
    if (onClearDiscount) {
      onClearDiscount()
    }
  }

  const handleDiscountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDiscountInput(value)
  }

  // update display when discount code changes from external source
  useEffect(() => {
    if (!discountCode) {
      setLocalDisplayDiscountCode("")
    }
  }, [discountCode])

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

      {/* discount code input/display */}
      <div className="mt-4 py-4 border-t border-gray-200">
        {!displayDiscountCode ? (
          // show input when no discount code
          <form onSubmit={handleDiscountSubmit} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Discount code"
                value={discountInput}
                onChange={handleDiscountInputChange}
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
              />
              <Button 
                type="submit" 
                size="sm"
                disabled={isValidatingDiscount}
              >
                {isValidatingDiscount ? "Validating..." : "Apply"}
              </Button>
            </div>
            {discountError && (
              <p className="text-red-600 text-sm">{discountError}</p>
            )}
          </form>
        ) : (
          // show read-only display with remove button
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Discount Code:</span>
                <span className="text-sm text-green-600">{displayDiscountCode.toUpperCase()}</span>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleClearDiscount}
              >
                Remove
              </Button>
            </div>
            {discountDescription && (
              <p className="text-sm text-green-600">{discountDescription}</p>
            )}
          </div>
        )}
      </div>

      {/* pricing breakdown */}
      <div className="mt-4 space-y-2 py-4 border-t border-gray-200">
        {discountCents > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount:</span>
            <span>-${(discountCents / 100).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${((subtotalCents - discountCents) / 100).toFixed(2)}</span>
        </div>
        {tipCents > 0 && (
          <div className="flex justify-between">
            <span>Tip:</span>
            <span>${(tipCents / 100).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-lg border-t pt-2">
          <span>Total:</span>
          <span>${(totalCents / 100).toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}


"use client"

import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"


// mock for now
const mockCartItems = [
  { id: "1", name: "Paneer Tikka", price: 1200, quantity: 1 },
  { id: "2", name: "Samosa", price: 500, quantity: 2 }
]




export default function Cart() {
  const cartItems = mockCartItems
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline" className="fixed top-4 right-4 z-50">
          🛒 Cart ({cartItems.length})
        </Button>
      </DrawerTrigger>
      <DrawerContent className="w-full max-w-sm ml-auto h-full p-6">
        <DrawerTitle>Your Cart</DrawerTitle>

        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <ul className="space-y-2">
            {cartItems.map(item => (
              <li key={item.id} className="flex justify-between">
                <span>{item.name} x{item.quantity}</span>
                <span>${(item.price * item.quantity / 100).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex justify-between font-semibold">
          <span>Total:</span>
          <span>${(total / 100).toFixed(2)}</span>
        </div>

        <Button className="mt-6 w-full">Proceed to Checkout</Button>
      </DrawerContent>
    </Drawer>
  )
}

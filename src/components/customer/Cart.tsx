"use client"

import { useRouter } from "next/navigation"
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/customer/CartContext"
import { format, parseISO, addMinutes, parse, format as formatDate, addDays, isBefore, isAfter, startOfDay } from "date-fns"
import { toZonedTime } from "date-fns-tz"
import { useState } from "react"


export default function Cart() {
  const { cartItems, increment, decrement, removeItem, pickupDate, pickupTime } = useCart()
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const router = useRouter()
  const canCheckout = cartItems.length > 0 && pickupDate && pickupTime
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function getTimeRangeLabel(time: string) {
    const start = parse(time, 'HH:mm', new Date())
    const end = addMinutes(start, 30)
    return `${formatDate(start, 'h:mm')}-${formatDate(end, 'h:mm')}${formatDate(end, 'a').toLowerCase()}`
  }

  // determine if date is in orderable window (4-17 days from today)
  function isOrderableDate(dateStr: string | null) {
    if (!dateStr) return false;
    const today = startOfDay(new Date());
    const date = startOfDay(parseISO(dateStr));
    const minDate = addDays(today, 4);
    const maxDate = addDays(today, 17);
    return !isBefore(date, minDate) && !isAfter(date, maxDate);
  }


  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline" className="fixed top-4 right-4 z-50">
          🛒 Cart ({cartItems.length})
        </Button>
      </DrawerTrigger>

      <DrawerContent className="w-full max-w-sm ml-auto h-full p-6 bg-[#FAF7ED]">
        <DrawerTitle className="text-xl mb-2">Your Cart</DrawerTitle>
        <div className="mb-4 p-2 bg-[#FAF7ED] rounded text-base text-[#4A2F1B]">
          {cartItems.length === 0 ? (
            <div className="text-[#6B4C32]">Add items to cart to select a pickup date and time.</div>
          ) : (
            <>
              <div className="text-lg">
                <span className="font-semibold text-[#4A2F1B]">Pickup Date:</span> {pickupDate ? format(toZonedTime(parseISO(pickupDate), 'America/Los_Angeles'), 'EEEE, MMMM d, yyyy') : <span className="text-red-500">Not selected</span>}
              </div>
              <div className="text-lg">
                <span className="font-semibold text-[#4A2F1B]">Pickup Time:</span> {pickupTime ? getTimeRangeLabel(pickupTime) : <span className="text-red-500">Not selected</span>}
              </div>
            </>
          )}
        </div>

        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <ul className="space-y-2">
            {cartItems.map(item => (
              <li key={item.id + item.variant} className="flex justify-between items-center gap-2">
                <span>{item.name} ({item.variant})</span>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="outline" onClick={() => decrement(item.id, item.variant)}>-</Button>
                  <span className="w-6 text-center text-[#4A2F1B]">{item.quantity}</span>
                  <Button size="icon" variant="outline" onClick={() => increment(item.id, item.variant)}>+</Button>
                  <Button size="icon" variant="ghost" onClick={() => removeItem(item.id, item.variant)}>&times;</Button>
                </div>
                <span>${((item.price * item.quantity) / 100).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex justify-between font-semibold">
          <span>Total:</span>
          <span>${(total / 100).toFixed(2)}</span>
        </div>

        {/* error messages */}
        {!canCheckout && (
          <div className="mt-2 text-red-500 text-sm">Select a pickup date and time to proceed to checkout.</div>
        )}
        {errorMsg && (
          <div className="mt-2 text-red-500 text-sm">{errorMsg}</div>
        )}

        <Button className="mt-6 w-full" onClick={() => {
          setErrorMsg(null);
          if (!canCheckout) return;
          if (!isOrderableDate(pickupDate)) {
            setErrorMsg('Unable to order for this date.');
            return;
          }
          router.push("/checkout")
        }} disabled={!canCheckout}>Proceed to Checkout</Button>

      </DrawerContent>

    </Drawer>
  )
}

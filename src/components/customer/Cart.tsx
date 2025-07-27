"use client"

import { useRouter } from "next/navigation"
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/customer/CartContext"
import { format, parseISO, addMinutes, parse, format as formatDate, addDays, isBefore, isAfter, startOfDay } from "date-fns"
import { toZonedTime } from "date-fns-tz"
import { useState, useEffect } from "react"


export default function Cart() {
  const { cartItems, increment, decrement, removeItem, pickupDate, pickupTime } = useCart()
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const router = useRouter()
  const canCheckout = cartItems.length > 0 && pickupDate && pickupTime
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<{ [key: string]: boolean }>({})

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

  // check if date is still available (has time slots)
  function isDateAvailable(dateStr: string | null) {
    if (!dateStr) return false;
    return availableDates[dateStr] === true;
  }

  // fetch current availability
  useEffect(() => {
    const fetchAvailability = async () => {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + 4);
      const start = format(startDate, 'yyyy-MM-dd');
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 13);
      const end = format(endDate, 'yyyy-MM-dd');
      const res = await fetch(`/api/availability-range?start=${start}&end=${end}`);
      const data = await res.json();
      const result: { [key: string]: boolean } = {};
      for (const entry of data) {
        result[entry.date] = entry.timeSlots !== null;
      }
      setAvailableDates(result);
    };
    fetchAvailability();
  }, []);

  // clear error message when pickup date changes to a valid date
  useEffect(() => {
    if (pickupDate && isOrderableDate(pickupDate) && isDateAvailable(pickupDate)) {
      setErrorMsg(null);
    }
  }, [pickupDate, availableDates, isDateAvailable]);


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
              <li key={item.id + item.variant} className="flex items-center">
                {/* item name */}
                <div className="flex-1 min-w-0">
                  <span className="text-[#4A2F1B] font-medium">{item.name} ({item.variant})</span>
                </div>
                
                {/* quantity */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button size="icon" variant="outline" className="w-8 h-8" onClick={() => decrement(item.id, item.variant)}>-</Button>
                  <span className="w-8 text-center text-[#4A2F1B] font-medium">{item.quantity}</span>
                  <Button size="icon" variant="outline" className="w-8 h-8" onClick={() => increment(item.id, item.variant)}>+</Button>
                  <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => removeItem(item.id, item.variant)}>&times;</Button>
                </div>
                
                {/* price */}
                <div className="flex-shrink-0 w-16 text-right">
                  <span className="text-[#4A2F1B] font-medium">${((item.price * item.quantity) / 100).toFixed(2)}</span>
                </div>
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
            setErrorMsg('Unable to order for this date. Date is either closed or no longer available.');
            return;
          }
          if (!isDateAvailable(pickupDate)) {
            setErrorMsg('This date is no longer available. Please select a different pickup date.');
            return;
          }
          router.push("/checkout")
        }} disabled={!canCheckout}>Proceed to Checkout</Button>

      </DrawerContent>

    </Drawer>
  )
}

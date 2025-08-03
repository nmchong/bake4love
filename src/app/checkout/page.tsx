"use client"

import OrderForm, { OrderFormValues } from "@/components/customer/OrderForm"
import OrderSummary from "@/components/customer/OrderSummary"
import TipsSection from "@/components/customer/TipsSection"
import { useCart } from "@/components/customer/CartContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useCallback } from "react"
import { format, addDays, isBefore, isAfter, startOfDay } from "date-fns"

export default function CheckoutPage() {
  const { cartItems, pickupDate, pickupTime, customerInfo, tipCents, setCustomerInfo, setTipCents } = useCart()
  const router = useRouter()
  const [form, setForm] = useState<OrderFormValues>(customerInfo)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableDates, setAvailableDates] = useState<{ [key: string]: boolean }>({})

  const canSubmit =
    cartItems.length > 0 &&
    pickupDate &&
    pickupTime &&
    form.email.trim() !== "" &&
    !submitting

  // determine if date is in orderable window (4-17 days from today)
  function isOrderableDate(dateStr: string | null) {
    if (!dateStr) return false;
    const today = startOfDay(new Date());
    const date = startOfDay(new Date(dateStr));
    const minDate = addDays(today, 4);
    const maxDate = addDays(today, 17);
    return !isBefore(date, minDate) && !isAfter(date, maxDate);
  }

  // check if date is still available (has time slots)
  const isDateAvailable = useCallback((dateStr: string | null) => {
    if (!dateStr) return false;
    return availableDates[dateStr] === true;
  }, [availableDates]);

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

  const handleSubmit = async () => {
    setError(null)
    
    // check date availability before proceeding
    if (!isOrderableDate(pickupDate) || !isDateAvailable(pickupDate)) {
      setError('Unable to order for this date. Date is either closed or no longer available. Please remove all items from cart and select a different pickup date.');
      return;
    }
    
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
          tipCents,
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
        body: JSON.stringify({ orderId: orderData.orderId, tipCents })
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
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* left column */}
        <div className="space-y-6">
          {/* back to menu */}
          <Button 
            variant="outline" 
            onClick={() => router.push("/")}
            className="mb-6"
          >
            ← Back to Menu
          </Button>

          {/* order summary & tips */}
          <OrderSummary cartItems={cartItems} tipCents={tipCents} />
          <TipsSection tipCents={tipCents} onTipChange={setTipCents} />
        </div>

        {/* right column */}
        <div className="space-y-6">
          {/* customer info */}
          <OrderForm values={form} onChange={(newForm) => {
            setForm(newForm)
            setCustomerInfo(newForm)
          }} />

          {/* text above button */}
          <p className="text-sm text-[#6B4C32] text-center">
            General pickup location is Mountain View. Exact pickup address will be revealed upon payment and sent to your email. By submitting payment, you understand that all sales are final.
          </p>

          {/* proceed to payment */}
          <Button 
            className="w-full h-12 text-lg" 
            onClick={handleSubmit} 
            disabled={!canSubmit}
          >
            {submitting ? "Creating Checkout Session..." : "Proceed to Payment"}
          </Button>

          {error && <div className="text-[#843C12] mt-2">{error}</div>}
        </div>
      </div>
    </div>
  )
}

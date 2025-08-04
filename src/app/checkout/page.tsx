"use client"

import { useState, useEffect, useCallback } from "react"
import { useCart } from "@/components/customer/CartContext"
import { format, addDays, isBefore, isAfter, startOfDay, parseISO } from "date-fns"
import { toZonedTime } from "date-fns-tz"
import OrderForm, { OrderFormValues } from "@/components/customer/OrderForm"
import OrderSummary from "@/components/customer/OrderSummary"
import TipsSection from "@/components/customer/TipsSection"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {
  const { 
    cartItems, 
    pickupDate, 
    pickupTime, 
    tipCents, 
    setTipCents,
    customerInfo,
    setCustomerInfo,
    discountCode,
    setDiscountCode,
    discountCents,
    setDiscountCents
  } = useCart()
  const router = useRouter()
  const [form, setForm] = useState<OrderFormValues>(customerInfo)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableDates, setAvailableDates] = useState<{ [key: string]: boolean }>({})
  const [discountError, setDiscountError] = useState<string | null>(null)
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false)

  const subtotalCents = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalCents = subtotalCents - discountCents + tipCents

  const canSubmit =
    cartItems.length > 0 &&
    pickupDate &&
    pickupTime &&
    form.email.trim() !== "" &&
    !submitting

  // determine if date is in orderable window (4-17 days from today)
  function isOrderableDate(dateStr: string | null) {
    if (!dateStr) return false;
    // use PST timezone for consistent date comparison
    const today = toZonedTime(startOfDay(new Date()), 'America/Los_Angeles');
    const date = toZonedTime(startOfDay(parseISO(dateStr)), 'America/Los_Angeles');
    const minDate = toZonedTime(addDays(today, 4), 'America/Los_Angeles');
    const maxDate = toZonedTime(addDays(today, 17), 'America/Los_Angeles');
    return !isBefore(date, minDate) && !isAfter(date, maxDate);
  }

  // check if date is still available (has time slots)
  const isDateAvailable = useCallback((dateStr: string | null) => {
    if (!dateStr) return false;
    return availableDates[dateStr] === true;
  }, [availableDates]);

  // validate discount code
  const validateDiscountCode = async (code: string) => {
    if (!code.trim()) {
      setDiscountCents(0)
      setDiscountError(null)
      return
    }

    setIsValidatingDiscount(true)
    setDiscountError(null)

    try {
      const res = await fetch(`/api/validate-promo?code=${encodeURIComponent(code)}&subtotal=${subtotalCents}`)
      const data = await res.json()
      
      if (data.valid) {
        setDiscountCents(data.discountCents)
        setDiscountError(null)
      } else {
        setDiscountCents(0)
        setDiscountError(data.error || "Invalid discount code")
      }
    } catch {
      setDiscountCents(0)
      setDiscountError("Failed to validate discount code")
    } finally {
      setIsValidatingDiscount(false)
    }
  }

  // update customer info in context when form changes
  const handleFormChange = (newForm: OrderFormValues) => {
    setForm(newForm)
    setCustomerInfo(newForm)
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
          discountCode: discountCode || undefined,
          discountCents,
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
    <div className="max-w-4xl mx-auto p-6">
      

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* left side */}
        <div className="space-y-6">

          {/* back to menu */}
          <Button 
            variant="outline" 
            onClick={() => router.push("/")}
            className="mb-6"
          >
            ← Back to Menu
          </Button>
          <OrderSummary 
            cartItems={cartItems} 
            subtotalCents={subtotalCents}
            discountCents={discountCents}
            tipCents={tipCents}
            totalCents={totalCents}
            discountCode={discountCode}
            onDiscountCodeChange={setDiscountCode}
            onValidateDiscount={validateDiscountCode}
            isValidatingDiscount={isValidatingDiscount}
            discountError={discountError}
          />
          
          <TipsSection tipCents={tipCents} onTipChange={setTipCents} />
        </div>

        {/* right side */}
        <div className="space-y-3">
          <OrderForm values={form} onChange={handleFormChange} />

          {/* text above button */}
          <p className="text-sm text-[#6B4C32] text-center">
            General pickup location is Mountain View. Exact pickup address will be revealed upon payment and sent to your email. By submitting payment, you understand that all sales are final.
          </p>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          <Button 
            className="w-full h-12 text-lg" 
            onClick={handleSubmit} 
            disabled={!canSubmit || submitting}
          >
            {submitting ? "Processing..." : "Proceed to Payment"}
          </Button>
        </div>
      </div>
    </div>
  )
}

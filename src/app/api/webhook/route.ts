import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { headers } from "next/headers"
import { addMinutes, parse } from "date-fns"
import { toZonedTime, format as tzFormat } from "date-fns-tz"
import { sendOrderEmail } from "@/lib/mailer"

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

function formatPickupRangeLA(pickupDate: Date, pickupTime: string) {
  const TIMEZONE = 'America/Los_Angeles'
  const laDate = toZonedTime(pickupDate, TIMEZONE)
  const dateStr = tzFormat(laDate, 'MM/dd/yyyy (EEEE)', { timeZone: TIMEZONE })

  const start = parse(pickupTime, 'HH:mm', new Date())
  const end = addMinutes(start, 30)
  const startStr = tzFormat(start, 'h:mm', { timeZone: TIMEZONE })
  const endStr = tzFormat(end, 'h:mm', { timeZone: TIMEZONE })
  const ampm = tzFormat(end, 'a', { timeZone: TIMEZONE }).toLowerCase()

  return { dateStr, timeStr: `${startStr}-${endStr}${ampm}` }
}

function formatOrderPlacedDate(orderDate: Date) {
  const TIMEZONE = 'America/Los_Angeles'
  const laDate = toZonedTime(orderDate, TIMEZONE)
  return tzFormat(laDate, 'MM/dd', { timeZone: TIMEZONE })
}

async function processOrderPayment(orderId: string, customerEmail: string, totalCents: number, discountCents: number, chargeId?: string, isCheckoutSession: boolean = false) {
  console.log("Processing order payment for:", orderId, "Customer:", customerEmail, "Total:", totalCents, "Discount:", discountCents, "Is checkout session:", isCheckoutSession)
  
  // get the order to access current values
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  })

  if (!order) {
    console.log("Order not found:", orderId)
    return false
  }

  console.log("Order found:", order.id, "Status:", order.status, "Customer email:", order.customerEmail, "Current total:", order.totalCents)

  // check if order is already fully processed (paid status means emails were already sent)
  if (order.status === "paid") {
    console.log("Order already paid - checking if emails were sent")
    
    // if this is checkout session completion, we should still send emails even if order is marked as paid
    // bc the charge.succeeded event might have processed first and marked it as paid
    if (isCheckoutSession) {
      console.log("Order marked as paid but this is checkout session completion - proceeding with email sending")
    } else {
      console.log("Order already paid and processed - completely skipping to avoid duplicate emails")
      return true
    }
  }

  // only update order status if not already paid
  if (order.status !== "paid") {
    console.log("Updating order status from", order.status, "to paid")
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: "paid",
        discountCents: discountCents,
        totalCents: totalCents
      }
    })
    console.log("Order marked as paid. New status:", updatedOrder.status, "New total:", updatedOrder.totalCents)
  } else {
    console.log("Order already marked as paid, skipping status update")
  }

  // get receipt URL if available
  let receiptUrl: string | undefined
  if (chargeId) {
    try {
      console.log("Retrieving charge for receipt URL:", chargeId)
      const charge = await stripe.charges.retrieve(chargeId)
      if (charge.receipt_url) {
        receiptUrl = charge.receipt_url
        console.log("Found receipt URL:", receiptUrl)
      } else {
        console.log("No receipt URL found for charge")
      }
    } catch (e) {
      console.error('Failed to get charge receipt URL:', e)
    }
  }

  // only send emails if this is the checkout session completion (to avoid duplicates)
  if (isCheckoutSession) {
    console.log("Processing checkout session - sending emails")
    
        // send customer email
    if (customerEmail) {
      try {
        const address = process.env.PICKUP_ADDRESS || "[Address not configured]"
        const { dateStr, timeStr } = formatPickupRangeLA(order.pickupDate as unknown as Date, order.pickupTime)
        const orderPlacedDate = formatOrderPlacedDate(order.createdAt)
        const orderUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/order/${order.id}`
        
        await sendOrderEmail(customerEmail, {
          address,
          dateStr,
          timeStr,
          totalCents,
          orderId: order.id,
          orderPlacedDate,
          orderUrl,
          receiptUrl,
          customerNotes: order.notes || undefined,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone
        })
        console.log("Customer email sent to:", customerEmail)
      } catch (e) {
        console.error('Failed to send customer email:', e)
      }
    }

    // send admin email copy
    try {
      const adminEnv = process.env.EMAILS_TO_ADMINS || ""
      const adminEmails = adminEnv.split(",").map(e => e.trim()).filter(Boolean)
      if (adminEmails.length > 0) {
        const address = process.env.PICKUP_ADDRESS || "[Address not configured]"
        const { dateStr, timeStr } = formatPickupRangeLA(order.pickupDate as unknown as Date, order.pickupTime)
        const orderPlacedDate = formatOrderPlacedDate(order.createdAt)
        const orderUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/order/${order.id}`
        
        // send to each admin individually to ensure proper formatting
        for (const adminEmail of adminEmails) {
          await sendOrderEmail(adminEmail, {
            address,
            dateStr,
            timeStr,
            totalCents,
            orderId: order.id,
            orderPlacedDate,
            orderUrl,
            receiptUrl,
            customerNotes: order.notes || undefined,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone
          })
        }
        console.log("Admin emails sent to:", adminEmails)
      } else {
        console.log("No admin emails configured")
      }
    } catch (err) {
      console.error('Failed to send admin email:', err)
    }

    // mark that emails have been sent by updating the order with a flag
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: "paid",
          discountCents: discountCents,
          totalCents: totalCents
        }
      })
    } catch (e) {
      console.error('Failed to update order after email sending:', e)
    }
  } else {
    console.log("Skipping emails (not checkout session)")
  }

  console.log("Order payment processing completed for:", orderId)
  return true
}



// webhook for stripe
// POST /api/webhook
export async function POST(req: Request) {
  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get("stripe-signature")

    // verify webhook signature
    if (!signature) {
      return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 })
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 })
    }

    console.log("Webhook event received:", event.type, "Event ID:", event.id)

    // handle checkout.session.completed event FIRST (priority)
    if (event.type === "checkout.session.completed") {
      console.log("=== PROCESSING CHECKOUT.SESSION.COMPLETED ===")
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.orderId

      console.log("Checkout session completed for order:", orderId)
      console.log("Session customer_email:", session.customer_email)
      console.log("Session payment_intent:", session.payment_intent)
      console.log("Session amount_total:", session.amount_total)
      console.log("Session total_details:", session.total_details)

      if (!orderId) {
        console.log("No orderId in metadata")
        return NextResponse.json({ error: "No orderId in metadata" }, { status: 400 })
      }

      // calculate discount amount from Stripe session
      let discountCents = 0
      if (session.total_details?.amount_discount) {
        discountCents = session.total_details.amount_discount
        console.log("Discount amount from session:", discountCents)
      }

      // calculate total correctly: subtotalCents - discountCents + tipCents
      const totalCents = (session.amount_total || 0)
      console.log("Total amount from session:", totalCents)

      // get charge ID from payment intent if available
      let chargeId: string | undefined
      if (session.payment_intent) {
        try {
          const piId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent.id
          console.log("Retrieving payment intent:", piId)
          const pi = await stripe.paymentIntents.retrieve(piId, { expand: ['latest_charge'] })
          const latestCharge = pi.latest_charge as Stripe.Charge | string | null
          if (latestCharge && typeof latestCharge !== 'string') {
            chargeId = latestCharge.id
            console.log("Found charge ID from payment intent:", chargeId)
          } else {
            console.log("No charge found in payment intent")
          }
        } catch (e) {
          console.error('Failed to get charge ID from payment intent:', e)
        }
      } else {
        console.log("No payment_intent in session")
      }

      const success = await processOrderPayment(orderId, session.customer_email || "", totalCents, discountCents, chargeId, true)
      
      if (!success) {
        console.log("Checkout session processing failed")
      }
      console.log("=== END CHECKOUT.SESSION.COMPLETED ===")

      return NextResponse.json({ success: true, orderId })
    }

    // handle charge.succeeded event as fallback (only if checkout.session.completed wasn't processed)
    if (event.type === "charge.succeeded") {
      console.log("=== PROCESSING CHARGE.SUCCEEDED ===")
      const charge = event.data.object as Stripe.Charge
      
      // try to find order from charge metadata or description
      let orderId = charge.metadata?.orderId
      
      if (!orderId && charge.description) {
        // extract order ID from description if it contains the pickup note
        const orderIdMatch = charge.description.match(/order ID: ([a-f0-9-]+)/i)
        if (orderIdMatch) {
          orderId = orderIdMatch[1]
        }
      }

      if (orderId) {
        console.log("Found orderId from charge:", orderId)
        
        // check if order was already processed by checkout.session.completed
        const order = await prisma.order.findUnique({ where: { id: orderId } })
        if (order && order.status === "paid") {
          console.log("Order already processed by checkout.session.completed, completely skipping charge.succeeded processing")
          console.log("=== END CHARGE.SUCCEEDED (SKIPPED) ===")
          return NextResponse.json({ received: true })
        }
        
        // only process if order is not already paid
        console.log("Order not yet paid, processing charge.succeeded as fallback")
        const success = await processOrderPayment(orderId, charge.receipt_email || "", charge.amount, 0, charge.id, false)
        
        if (!success) {
          console.log("Charge processing failed")
        }
      } else {
        console.log("No orderId found in charge metadata or description")
      }
      console.log("=== END CHARGE.SUCCEEDED ===")

      return NextResponse.json({ received: true })
    }

    // ignore all other events
    console.log("Ignoring event type:", event.type)
    return NextResponse.json({ received: true })

  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

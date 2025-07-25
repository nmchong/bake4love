import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { headers } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

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


    // handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.orderId

      if (!orderId) {
        return NextResponse.json({ error: "No orderId in metadata" }, { status: 400 })
      }

      // update order status to "paid"
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "paid" }
      })

      // cart will be reset on client-side when user visits success page
      return NextResponse.json({ success: true, orderId })
    }

    // ignore all other events
    return NextResponse.json({ received: true })

  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

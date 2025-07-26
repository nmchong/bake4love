import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import Stripe from "stripe"

// Check if required environment variables are set
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set")
}

if (!process.env.NEXT_PUBLIC_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not set")
}


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)



// stripe checkout session
// POST /api/checkout { orderId }
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { orderId, tipCents = 0 } = body
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 })
    }

    console.log("Creating checkout session for order:", orderId)

    // fetch order & items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: { include: { menuItem: true } } },
    })
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    if (order.status !== "pending") {
      return NextResponse.json({ error: "Order is not pending" }, { status: 400 })
    }

    console.log("Order found:", order.id, "Items:", order.orderItems.length)

    // stripe line items
    const line_items = order.orderItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: `${item.menuItem.name} (${item.variant})`,
        },
        unit_amount: item.variant === "half"
          ? item.menuItem.halfPrice ?? 0
          : item.menuItem.price,
      },
      quantity: item.quantity,
    }))

    // add tip if provided
    if (tipCents > 0) {
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Tip (optional)' },
          unit_amount: tipCents,
        },
        quantity: 1,
      });
    }

    console.log("Line items created:", line_items.length)

    // create stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: line_items,
      mode: "payment",
      customer_email: order.customerEmail,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order/${order.id}?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order/${order.id}?canceled=1`,
      metadata: {
        orderId: order.id,
      },
    })

    console.log("Stripe session created:", session.id)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Error creating Stripe session:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 
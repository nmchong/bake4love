import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { fromZonedTime } from "date-fns-tz"
import Stripe from "stripe"

// create new order
// POST /api/order
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { customerEmail, customerPhone, customerName, pickupDate, pickupTime, notes, cart, tipCents = 0, discountCode, promotionCodeId, discountDescription }: 
          { customerEmail: string;
            customerPhone?: string;
            customerName: string;
            pickupDate: string;
            pickupTime: string;
            notes?: string;
            cart: { menuItemId: string; quantity: number; variant: "full" | "half" }[]
            tipCents?: number
            discountCode?: string
            promotionCodeId?: string
            discountDescription?: string
          } = body

    if (!customerEmail ||
        !customerName ||
        !pickupDate ||
        !pickupTime ||
        !Array.isArray(cart) ||
        cart.some(item => !item.menuItemId || !item.quantity || !item.variant)
    ) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    // get total cost
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: {
          in: cart.map((item) => item.menuItemId)
        }
      }
    })
    const itemMap = new Map(menuItems.map(item => [item.id, item]))
    let subtotalCents = 0
    for (const item of cart) {
      const menuItem = itemMap.get(item.menuItemId)
      if (!menuItem) {
        return NextResponse.json({ error: "Invalid menu item in cart" }, { status: 400 })
      }

      const price = item.variant === "half"
        ? menuItem.halfPrice ?? 0
        : menuItem.price
      subtotalCents += price * item.quantity
    }

    // calculate discount amount if promotion code is provided
    let discountCents = 0
    if (promotionCodeId) {
      // fetch the promotion code to calculate discount
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
      const promotionCode = await stripe.promotionCodes.retrieve(promotionCodeId)
      const coupon = promotionCode.coupon
      
      if (coupon.percent_off) {
        discountCents = Math.floor(subtotalCents * (coupon.percent_off / 100))
      } else if (coupon.amount_off) {
        discountCents = coupon.amount_off
      }
    }

    // calculate total (subtotal - discount + tip)
    const totalCents = subtotalCents - discountCents + tipCents

    // Store the current time - it will be displayed in PST by the admin components
    const now = new Date()

    // create order
    const order = await prisma.order.create({
      data: {
        customerEmail,
        customerPhone,
        customerName,
        pickupDate: fromZonedTime(pickupDate, "America/Los_Angeles"),
        pickupTime,
        notes,
        subtotalCents,
        discountCents: discountCents, // store the calculated discount amount
        tipCents,
        totalCents,
        discountCode: discountCode, // store the user-friendly code (ex. SAVE20)
        promotionCodeId: promotionCodeId, // store the Stripe promotion code ID
        discountDescription: discountDescription, // store the discount description (ex. $5.00 off when you spend $30.00)
        status: "pending",
        createdAt: now, // store current time - will be displayed in PST
        orderItems: {
          create: cart.map((item) => ({
            menuItem: { connect: { id: item.menuItemId } },
            quantity: item.quantity,
            variant: item.variant
          }))
        }
      }
    })

    return NextResponse.json({ success: true, orderId: order.id })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
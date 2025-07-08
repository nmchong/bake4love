import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// create new order
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { customerEmail, pickupDate, pickupTime, notes, cart }: 
          { customerEmail: string;
            pickupDate: string;
            pickupTime: string;
            notes?: string;
            cart: { menuItemId: string; quantity: number }[]
          } = body
    if (!customerEmail || !pickupDate || !pickupTime || !Array.isArray(cart)) {
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
    let totalCost = 0
    for (const item of cart) {
      const menuItem = itemMap.get(item.menuItemId)
      if (!menuItem) {
        return NextResponse.json({ error: "Invalid menu item in cart" }, { status: 400 })
      }
      totalCost += menuItem.price * item.quantity
    }

    // create order
    const order = await prisma.order.create({
      data: {
        customerEmail,
        pickupDate: new Date(pickupDate),
        pickupTime,
        notes,
        cost: totalCost,
        status: "pending",
        orderItems: {
          create: cart.map((item) => ({
            menuItem: { connect: { id: item.menuItemId } },
            quantity: item.quantity
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
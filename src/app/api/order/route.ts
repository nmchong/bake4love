import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// create new order
// POST /api/order
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { customerEmail, customerName, pickupDate, pickupTime, notes, cart }: 
          { customerEmail: string;
            customerName: string;
            pickupDate: string;
            pickupTime: string;
            notes?: string;
            cart: { menuItemId: string; quantity: number; variant: "full" | "half" }[]
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
    let totalCost = 0
    for (const item of cart) {
      const menuItem = itemMap.get(item.menuItemId)
      if (!menuItem) {
        return NextResponse.json({ error: "Invalid menu item in cart" }, { status: 400 })
      }

      const price = item.variant === "half"
        ? menuItem.halfPrice ?? 0
        : menuItem.price
      totalCost += price * item.quantity
    }

    // create order
    const order = await prisma.order.create({
      data: {
        customerEmail,
        customerName,
        pickupDate: new Date(pickupDate),
        pickupTime,
        notes,
        cost: totalCost,
        status: "pending",
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
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// UUID validation for Prisma-generated UUIDs
function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}


// GET /api/order/[id]
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || !isUuid(id)) {
      return NextResponse.json({ error: "Invalid or missing id" }, { status: 400 });
    }

    // fetch order with only the specific ID - prevents table-wide access
    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        createdAt: true,
        customerName: true,
        customerEmail: true,
        pickupDate: true,
        pickupTime: true,
        notes: true,
        subtotalCents: true,
        discountCents: true,
        tipCents: true,
        totalCents: true,
        discountCode: true,
        discountDescription: true,
        orderItems: {
          select: {
            id: true,
            quantity: true,
            variant: true,
            menuItem: {
              select: {
                name: true,
                price: true,
                halfPrice: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // pickup address (in env)
    const payload = {
      ...order,
      pickupAddress: process.env.PICKUP_ADDRESS || "[Address not configured]",
    };

    // no caching for dynamic/PII data
    const res = NextResponse.json(payload, { status: 200 });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


// DELETE /api/order/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // check if order exists first
    const order = await prisma.order.findUnique({
      where: { id }
    })
    if (!order) {
      return NextResponse.json({ success: true, message: "Order not found or already deleted" })
    }

    // del order & all order items
    await prisma.order.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
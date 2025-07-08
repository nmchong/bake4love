import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Params {
  params: { id: string };
}


// get details for order
// GET /api/order/[id]
export async function GET(req: Request, { params }: Params) {
  const orderId = params.id;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            menuItem: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const formatted = {
      id: order.id,
      customerEmail: order.customerEmail,
      pickupDate: order.pickupDate,
      pickupTime: order.pickupTime,
      status: order.status,
      notes: order.notes,
      cost: order.cost,
      orderItems: order.orderItems.map((item) => ({
        name: item.menuItem.name,
        quantity: item.quantity,
        price: item.menuItem.price
      }))
    };

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Error fetching order:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
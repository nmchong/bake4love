import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// mark order as complete
// PATCH /api/admin/order/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: "Missing order ID" }, { status: 400 })
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: "fulfilled"
      }
    })

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
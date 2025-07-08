import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// display all orders for a given date /api/admin/orders?date=
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dateParam = searchParams.get("date")

  if (!dateParam) {
    return NextResponse.json({ error: "Missing date parameter" }, { status: 400 })
  }

  const date = new Date(dateParam)
  if (isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 })
  }

  // get all orders for that date
  const orders = await prisma.order.findMany({
    where: {
      pickupDate: {
        equals: date
      }
    },
    include: {
      orderItems: {
        include: {
          menuItem: true
        }
      }
    },
    orderBy: {
      pickupTime: 'asc'
    }
  })

  return NextResponse.json({ orders })
}
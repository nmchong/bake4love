import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { startOfDay, addDays } from "date-fns"

// display all orders upcoming or past, or for a specific date
// GET /api/admin/orders?tab=upcoming|past or /api/admin/orders?date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tab = searchParams.get("tab") || "upcoming"
  const dateParam = searchParams.get("date")
  const today = startOfDay(new Date())

  let where = {}

  if (dateParam) {
    // if date is provided, filter orders for that date
    const date = new Date(dateParam)
    where = {
      pickupDate: {
        gte: startOfDay(date),
        lt: startOfDay(addDays(date, 1))
      }
    }
  } else if (tab === "upcoming") {
    where = {
      status: "paid",
      pickupDate: {
        gte: today
      }
    }
  } else if (tab === "past") {
    where = {
      OR: [
        { status: "fulfilled" },
        { pickupDate: { lt: today } }
      ]
    }
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      orderItems: {
        include: {
          menuItem: true
        }
      }
    },
    orderBy: {
      pickupDate: 'asc',
    }
  })

  return NextResponse.json({ orders })
}
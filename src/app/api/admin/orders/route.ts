import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { fromZonedTime } from "date-fns-tz"

// display all orders upcoming or past, or for a specific date
// GET /api/admin/orders?tab=upcoming|past or /api/admin/orders?date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tab = searchParams.get("tab") || "upcoming"
  const dateParam = searchParams.get("date")

  let where = {}
  const TIMEZONE = "America/Los_Angeles"

  if (dateParam) {
    const dayStart = fromZonedTime(dateParam, TIMEZONE)
    const nextDay = new Date(dayStart)
    nextDay.setDate(nextDay.getDate() + 1)
    where = {
      pickupDate: {
        gte: dayStart,
        lt: nextDay
      }
    }
  } else if (tab === "upcoming") {
    const today = fromZonedTime(new Date().toISOString().slice(0, 10), TIMEZONE)
    where = {
      status: "paid",
      pickupDate: {
        gte: today
      }
    }
  } else if (tab === "past") {
    const today = fromZonedTime(new Date().toISOString().slice(0, 10), TIMEZONE)
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
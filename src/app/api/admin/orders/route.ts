import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { fromZonedTime } from "date-fns-tz"
import { addMinutes, parse } from "date-fns"

// display all orders upcoming or past, or for a specific date
// GET /api/admin/orders?tab=upcoming|past or /api/admin/orders?date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tab = searchParams.get("tab") || "upcoming"
  const dateParam = searchParams.get("date")

  // auto-fulfill orders that have passed their pickup time
  await autoFulfillOrders()

  let where = {}

  if (dateParam) {
    const dayStart = fromZonedTime(dateParam, "America/Los_Angeles")
    const nextDay = new Date(dayStart)
    nextDay.setDate(nextDay.getDate() + 1)
    where = {
      pickupDate: {
        gte: dayStart,
        lt: nextDay
      }
    }
  } else if (tab === "upcoming") {
    const today = fromZonedTime(new Date().toISOString().slice(0, 10), "America/Los_Angeles")
    where = {
      status: "paid",
      pickupDate: {
        gte: today
      }
    }
  } else if (tab === "past") {
    const today = fromZonedTime(new Date().toISOString().slice(0, 10), "America/Los_Angeles")
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
      pickupDate: tab === "past" ? 'desc' : 'asc',
    }
  })

  return NextResponse.json({ orders })
}

// auto-fulfill orders that have passed their pickup time
async function autoFulfillOrders() {
  const now = new Date()
  
  // get all paid orders that haven't been fulfilled yet
  const ordersToCheck = await prisma.order.findMany({
    where: {
      status: "paid"
    },
    select: {
      id: true,
      pickupDate: true,
      pickupTime: true
    }
  })

  for (const order of ordersToCheck) {
    // calculate the end time of the pickup slot (30 minutes after start)
    const pickupStart = parse(order.pickupTime, 'HH:mm', order.pickupDate)
    const pickupEnd = addMinutes(pickupStart, 30)
    
    // if current time is past the pickup end time, mark as fulfilled
    if (now > pickupEnd) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "fulfilled" }
      })
    }
  }
}
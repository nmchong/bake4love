import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { fromZonedTime, toZonedTime, format as formatTz } from "date-fns-tz"

export async function GET() {
  try {
    const TIMEZONE = "America/Los_Angeles"
    
    const now = new Date()
    const todayString = now.toLocaleDateString('en-CA', { timeZone: TIMEZONE }) // YYYY-MM-DD
    const todayStart = fromZonedTime(todayString, TIMEZONE)
    
    // get upcoming orders grouped by pickup date (including today)
    const upcomingOrders = await prisma.order.findMany({
      where: {
        pickupDate: {
          gte: todayStart,
        },
        status: {
          notIn: ["cancelled", "pending"]
        }
      },
      select: {
        pickupDate: true,
        orderItems: {
          select: {
            quantity: true,
          }
        }
      },
      orderBy: {
        pickupDate: 'asc'
      }
    })

    // group orders by pickup date in LA timezone
    const ordersByDate = new Map<string, { orderCount: number; totalItems: number }>()
    
    upcomingOrders.forEach(order => {
      const laPickupDate = toZonedTime(order.pickupDate, TIMEZONE)
      // Use deterministic formatter to avoid locale-dependent shifts
      const dateKey = formatTz(laPickupDate, 'yyyy-MM-dd', { timeZone: TIMEZONE })
      const totalItems = order.orderItems.reduce((sum, item) => sum + item.quantity, 0)
      
      if (ordersByDate.has(dateKey)) {
        const existing = ordersByDate.get(dateKey)!
        existing.orderCount += 1
        existing.totalItems += totalItems
      } else {
        ordersByDate.set(dateKey, {
          orderCount: 1,
          totalItems: totalItems
        })
      }
    })

    // convert to array and take first 5 dates
    const upcomingDates = Array.from(ordersByDate.entries())
      .slice(0, 5)
      .map(([date, counts]) => ({
        date,
        orderCount: counts.orderCount,
        totalItems: counts.totalItems
      }))

    return NextResponse.json({
      upcomingDates
    })
  } catch (error) {
    console.error("Error fetching upcoming dates:", error)
    return NextResponse.json(
      { error: "Failed to fetch upcoming dates" },
      { status: 500 }
    )
  }
} 
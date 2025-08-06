import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const now = new Date()
    
    // get upcoming orders grouped by pickup date
    const upcomingOrders = await prisma.order.findMany({
      where: {
        pickupDate: {
          gte: now,
        },
        status: {
          not: "cancelled"
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

    // group orders by pickup date
    const ordersByDate = new Map<string, { orderCount: number; totalItems: number }>()
    
    upcomingOrders.forEach(order => {
      const dateKey = order.pickupDate.toISOString().split('T')[0] // YYYY-MM-DD format
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
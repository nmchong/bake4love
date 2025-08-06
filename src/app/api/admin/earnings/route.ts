import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // get orders for different time periods
    const [past7DaysOrders, past30DaysOrders, allTimeOrders] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
          status: {
            not: "cancelled"
          }
        },
        select: {
          totalCents: true,
        }
      }),
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
          status: {
            not: "cancelled"
          }
        },
        select: {
          totalCents: true,
        }
      }),
      prisma.order.findMany({
        where: {
          status: {
            not: "cancelled"
          }
        },
        select: {
          totalCents: true,
        }
      })
    ])

    // calculate earnings and Stripe fees
    const calculateEarnings = (orders: { totalCents: number }[]) => {
      const grossRevenue = orders.reduce((sum, order) => sum + order.totalCents, 0)
      const numberOfOrders = orders.length
      
      // Stripe fees: 2.9% + $0.30 per transaction
      const stripeFees = Math.round(grossRevenue * 0.029) + (numberOfOrders * 30) // 30 cents in cents
      const netRevenue = grossRevenue - stripeFees
      
      return {
        grossRevenue,
        stripeFees,
        netRevenue,
        numberOfOrders
      }
    }

    const past7Days = calculateEarnings(past7DaysOrders)
    const past30Days = calculateEarnings(past30DaysOrders)
    const allTime = calculateEarnings(allTimeOrders)

    return NextResponse.json({
      past7Days,
      past30Days,
      allTime
    })
  } catch (error) {
    console.error("Error fetching earnings:", error)
    return NextResponse.json(
      { error: "Failed to fetch earnings" },
      { status: 500 }
    )
  }
} 
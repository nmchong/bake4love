import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { startOfDay } from "date-fns"

// display all orders upcoming or past
// GET /api/admin/orders?tab=upcoming|past
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tab = searchParams.get("tab") || "upcoming"
  const today = startOfDay(new Date())

  let where = {}
  if (tab === "upcoming") {
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
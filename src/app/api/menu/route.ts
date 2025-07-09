import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// return list of menu items for given date
// GET /api/menu?date=YYYY-MM-DD
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const dateParam = searchParams.get("date")

  // if no date provided, return all active items
  if (!dateParam) {
    const items = await prisma.menuItem.findMany({
      where: { active: true }
    })
    return NextResponse.json(items)
  }

  // parse date & day of week
  const date = new Date(dateParam)
  if (isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 })
  }
  const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" })

  // get start and end of the day in UTC using Date.UTC
  const [year, month, day] = dateParam.split('-').map(Number)
  const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0))
  const endOfDay = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0))

  // check if chef is available
  const availability = await prisma.availability.findFirst({
    where: {
      date: {
        gte: startOfDay,
        lt: endOfDay,
      }
    }
  })
  if (!availability) {
    return NextResponse.json([])
  }

  // show all items where (1) chef is available, (2) item is active, (3) item is available that day of week
  const items = await prisma.menuItem.findMany({
    where: {
      active: true,
      availableDays: {
        has: dayOfWeek
      }
    }
  })

   return NextResponse.json(items)
}

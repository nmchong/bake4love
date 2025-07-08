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
  const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" })

  // check if chef is available
  const availability = await prisma.availability.findFirst({
    where: {
      date: {
        equals: new Date(dateParam)
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

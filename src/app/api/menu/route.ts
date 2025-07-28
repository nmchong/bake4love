import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'

// return list of menu items for given date
// GET /api/menu?date=YYYY-MM-DD
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const dateParam = searchParams.get("date")

  // if no date provided, return all active items
  if (!dateParam) {
    const items = await prisma.menuItem.findMany({
      where: { 
        active: true,
        deleted: false
      }
    })
    return NextResponse.json(items)
  }

  const TIMEZONE = "America/Los_Angeles"
  const laDate = fromZonedTime(dateParam, TIMEZONE)
  const dayOfWeek = toZonedTime(laDate, TIMEZONE).toLocaleDateString("en-US", { weekday: "long", timeZone: TIMEZONE })

  // check if chef is available for this LA-local day
  const availability = await prisma.availability.findFirst({
    where: { date: laDate }
  })
  if (!availability) {
    return NextResponse.json([])
  }

  // show all items where (1) chef is available, (2) item is active, (3) item is available that day of week, (4) item is not deleted
  const items = await prisma.menuItem.findMany({
    where: {
      active: true,
      deleted: false,
      availableDays: {
        has: dayOfWeek
      }
    }
  })

  return NextResponse.json(items)
}

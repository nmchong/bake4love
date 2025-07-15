import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { fromZonedTime } from "date-fns-tz"

// return list of available timeslots for given date
// GET /api/availability?date=YYYY-MM-DD
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const dateParam = searchParams.get("date")

  // no date provided
  if (!dateParam) {
    return NextResponse.json({ error: "Missing date" }, { status: 400 })
  }

  // convert to UTC midnight for America/Los_Angeles
  const date = fromZonedTime(dateParam, "America/Los_Angeles")

  const availability = await prisma.availability.findFirst({
    where: {
      date: date
    }
  })

  if (!availability) {
    return NextResponse.json({ available: false })
  }
  return NextResponse.json({
    available: true,
    timeSlots: availability.timeSlots
  })
}

// set timeslot availability for given date
// POST /api/availability
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { date, timeSlots }: { date: string; timeSlots: string[] } = body

    if (!date || !Array.isArray(timeSlots)) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    // always use fromZonedTime for correct UTC date
    const zonedDate = fromZonedTime(date, "America/Los_Angeles")

    if (!timeSlots.length) {
      // if no timeslots, delete the availability for this date
      await prisma.availability.deleteMany({
        where: { date: zonedDate }
      })
      return NextResponse.json({ success: true, deleted: true })
    } else {
      // else upsert (create if doesn't exist, else update)
      await prisma.availability.upsert({
        where: { date: zonedDate },
        update: { timeSlots },
        create: { date: zonedDate, timeSlots }
      })
      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error("Error setting availability:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

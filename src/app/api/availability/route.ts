import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { startOfDay } from "date-fns"

// return list of available timeslots for given date
// GET /api/availability?date=YYYY-MM-DD
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const dateParam = searchParams.get("date")

  // no date provided
  if (!dateParam) {
    return NextResponse.json({ error: "Missing date" }, { status: 400 })
  }

  const date = new Date(dateParam)
  const strippedDate = new Date(date.toString())

  const availability = await prisma.availability.findFirst({
    where: {
      date: strippedDate
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

    const parsedDate = new Date(date)
    const strippedDate = startOfDay(parsedDate)

    // upsert (create if doesn't exist, else update)
    await prisma.availability.upsert({
      where: { date: strippedDate },
      update: { timeSlots },
      create: { date: strippedDate, timeSlots }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error setting availability:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

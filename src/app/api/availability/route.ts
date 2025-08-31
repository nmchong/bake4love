import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// return list of available timeslots for given date
// GET /api/availability?date=YYYY-MM-DD
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const dateParam = searchParams.get("date")

  console.log('Individual availability API called with date:', dateParam)

  // no date provided
  if (!dateParam) {
    const res = NextResponse.json({ error: "Missing date" }, { status: 400 })
    res.headers.set("Cache-Control", "no-store")
    return res
  }

  // simple string query - no date conversion
  const availability = await prisma.availability.findFirst({
    where: {
      date: dateParam
    }
  })

  console.log('DB query result:', availability ? {
    id: availability.id,
    date: availability.date,
    timeSlots: availability.timeSlots
  } : 'No availability found')

  if (!availability) {
    const res = NextResponse.json({ available: false })
    res.headers.set("Cache-Control", "no-store")
    return res
  }
  
  const res = NextResponse.json({
    available: true,
    timeSlots: availability.timeSlots
  })
  res.headers.set("Cache-Control", "no-store")
  console.log('Returning available: true with timeSlots:', availability.timeSlots)
  return res
}

// set timeslot availability for given date
// POST /api/availability
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { date, timeSlots }: { date: string; timeSlots: string[] } = body

    console.log('POST availability called with:', { date, timeSlots })

    if (!date || !Array.isArray(timeSlots)) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    // store the date string directly, no parsing/conversion
    console.log('💾 Storing availability directly:', {
      date: date,
      timeSlots: timeSlots
    })

    if (!timeSlots.length) {
      // if no timeslots, delete the availability for this date
      console.log('Deleting availability for date:', date)
      await prisma.availability.deleteMany({
        where: { date: date }
      })
      const res = NextResponse.json({ success: true, deleted: true })
      res.headers.set("Cache-Control", "no-store")
      return res
    } else {
      // else upsert (create if doesn't exist, else update)
      const result = await prisma.availability.upsert({
        where: { date: date },
        update: { timeSlots },
        create: { date: date, timeSlots }
      })
      console.log('Upsert result:', {
        id: result.id,
        date: result.date,
        timeSlots: result.timeSlots
      })
      const res = NextResponse.json({ success: true })
      res.headers.set("Cache-Control", "no-store")
      return res
    }
  } catch (error) {
    console.error("Error setting availability:", error)
    const res = NextResponse.json({ error: "Internal server error" }, { status: 500 })
    res.headers.set("Cache-Control", "no-store")
    return res
  }
}

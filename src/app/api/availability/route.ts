import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

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
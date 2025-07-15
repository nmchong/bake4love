import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { fromZonedTime } from 'date-fns-tz'

// get availabilities (date & timeslot) for range of dates
// GET /api/availability-range?start=YYYY-MM-DD&end=YYYY-MM-DD
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const startParam = searchParams.get('start')
  const endParam = searchParams.get('end')

  if (!startParam || !endParam) {
    return NextResponse.json({ error: 'Missing start or end' }, { status: 400 })
  }

  const TIMEZONE = 'America/Los_Angeles'
  const startDate = new Date(startParam)
  const endDate = new Date(endParam)
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  }

  // build list of all dates in range (inclusive)
  const dates: string[] = []
  for (
    let d = new Date(startDate);
    d <= endDate;
    d.setDate(d.getDate() + 1)
  ) {
    const iso = d.toISOString().slice(0, 10)
    dates.push(iso)
  }

  // fetch all availabilities in range
  const zonedDates = dates.map(date => fromZonedTime(date, TIMEZONE))
  const availabilities = await prisma.availability.findMany({
    where: {
      date: { in: zonedDates }
    }
  })
  const availMap = new Map(
    availabilities.map(a => [a.date.toISOString().slice(0, 10), a.timeSlots])
  )

  // build result
  const result = dates.map(date => ({
    date,
    timeSlots: availMap.get(date) ?? null
  }))

  return NextResponse.json(result)
} 
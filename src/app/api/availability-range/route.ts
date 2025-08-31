import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// get availabilities (date & timeslot) for range of dates
// GET /api/availability-range?start=YYYY-MM-DD&end=YYYY-MM-DD
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const startParam = searchParams.get('start')
  const endParam = searchParams.get('end')

  console.log('availability-range API called with:', { startParam, endParam })

  if (!startParam || !endParam) {
    const res = NextResponse.json({ error: 'Missing start or end' }, { status: 400 })
    res.headers.set("Cache-Control", "no-store")
    return res
  }

  const startDate = new Date(startParam)
  const endDate = new Date(endParam)
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    const res = NextResponse.json({ error: 'Invalid date' }, { status: 400 })
    res.headers.set("Cache-Control", "no-store")
    return res
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

  console.log('Date range to query:', { dates })

  // simple string query - no date conversion
  const availabilities = await prisma.availability.findMany({
    where: {
      date: { in: dates }
    }
  })
  
  console.log('Raw availabilities from DB:', availabilities.map(a => ({
    id: a.id,
    date: a.date,
    timeSlots: a.timeSlots
  })))
  
  // simple mapping - no date conversion
  const availMap = new Map()
  availabilities.forEach(a => {
    availMap.set(a.date, a.timeSlots)
    console.log(`Mapped availability for ${a.date}:`, a.timeSlots)
  })

  console.log('🗺️ Final availability map:', Object.fromEntries(availMap))

  // build result
  const result = dates.map(date => {
    const timeSlots = availMap.get(date) ?? null
    console.log(`Result for ${date}:`, { timeSlots })
    return { date, timeSlots }
  })

  console.log('Final result:', result)

  const res = NextResponse.json(result)
  res.headers.set("Cache-Control", "no-store")
  return res
} 
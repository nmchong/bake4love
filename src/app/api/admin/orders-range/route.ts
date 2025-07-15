import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { fromZonedTime } from 'date-fns-tz'

// display number of orders (date, order count) per date for date range
// GET /api/admin/orders-range?start=YYYY-MM-DD&end=YYYY-MM-DD
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

  // for each date, count orders with pickupDate on that day
  const results = await Promise.all(dates.map(async dateStr => {
    const dayStart = fromZonedTime(dateStr, TIMEZONE)
    const nextDay = new Date(dayStart)
    nextDay.setDate(nextDay.getDate() + 1)
    const count = await prisma.order.count({
      where: {
        pickupDate: {
          gte: dayStart,
          lt: nextDay
        }
      }
    })
    return { date: dateStr, orderCount: count }
  }))

  return NextResponse.json(results)
} 
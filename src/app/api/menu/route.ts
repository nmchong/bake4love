import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const items = await prisma.menuItem.findMany({
    where: { active: true }
  })
  return NextResponse.json(items)
}

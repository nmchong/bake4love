import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// get all menu items
// GET /api/admin/menu
export async function GET() {
  try {
    const menuItems = await prisma.menuItem.findMany({
      orderBy: { name: "asc" }
    })

    return NextResponse.json(menuItems)
  } catch (error) {
    console.error("Error fetching menu items:", error)
    return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 })
  }
}

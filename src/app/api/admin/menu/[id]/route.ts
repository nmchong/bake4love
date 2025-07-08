import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// edit menu item details
// PATCH /api.admin/menu/[id]
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const body = await req.json()

  const {
    name,
    description,
    ingredients,
    price,
    active,
    availableDays,
    imageUrl
  }: {
    name?: string
    description?: string
    ingredients?: string[]
    price?: number
    active?: boolean
    availableDays?: string[]
    imageUrl?: string
  } = body

  try {
    const updated = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        description,
        ingredients,
        price,
        active,
        availableDays,
        imageUrl
      }
    })

    return NextResponse.json({ success: true, updated })
  } catch (error) {
    console.error("Error updating menu item:", error)
    return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 })
  }

}
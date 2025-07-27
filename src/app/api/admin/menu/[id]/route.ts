import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// edit menu item details
// PATCH /api.admin/menu/[id]
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const {
    name,
    description,
    ingredients,
    price,
    halfPrice,
    hasHalfOrder,
    active,
    availableDays,
    imageUrl
  }: {
    name?: string
    description?: string
    ingredients?: string[]
    price?: number
    halfPrice?: number
    hasHalfOrder?: boolean
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
        halfPrice,
        hasHalfOrder,
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



function isPrismaNotFoundError(error: unknown): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: unknown }).code === 'P2025'
}

// delete menu item
// DELETE /api/admin/menu/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const deleted = await prisma.menuItem.delete({ where: { id } })
    return NextResponse.json({ success: true, deleted })
  } catch (error: unknown) {
    if (isPrismaNotFoundError(error)) {
      // Not found
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 })
    }
    console.error("Error deleting menu item:", error)
    return NextResponse.json({ error: "Failed to delete menu item" }, { status: 500 })
  }
}
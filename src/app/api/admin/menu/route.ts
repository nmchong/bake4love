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



// create a new menu item
// POST /api/admin/menu
export async function POST(req: Request) {
  try {
    const body = await req.json();
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
    } = body;

    // basic validation
    if (!name || price === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newItem = await prisma.menuItem.create({
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
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error creating menu item:", error);
    return NextResponse.json({ error: "Failed to create menu item" }, { status: 500 });
  }
}

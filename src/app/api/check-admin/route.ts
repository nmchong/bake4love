import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// check if email is in admins table
// POST /api/check-admin
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // query the admins table to check if email exists
    const admin = await prisma.admin.findUnique({
      where: { email }
    })
    
    const isAdmin = !!admin
    
    return NextResponse.json({ isAdmin })
  } catch (error) {
    console.error("Error checking admin access:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 
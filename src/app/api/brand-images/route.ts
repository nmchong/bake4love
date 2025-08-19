import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// get current brand images
export async function GET() {
  try {
    const brandSettings = await prisma.brandSettings.findFirst()
    
    return NextResponse.json({
      bannerImageUrl: brandSettings?.bannerImageUrl || null,
      profileImageUrl: brandSettings?.profileImageUrl || null
    })
  } catch (error) {
    console.error("Error fetching brand images:", error)
    return NextResponse.json({ 
      bannerImageUrl: null, 
      profileImageUrl: null 
    })
  }
} 
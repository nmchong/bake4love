import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// get current brand images
export async function GET() {
  try {
    
    const brandSettings = await prisma.brandSettings.findUnique({
      where: { id: "default" }
    })
    
    
    return NextResponse.json({
      bannerImageUrl: brandSettings?.bannerImageUrl || null,
      profileImageUrl: brandSettings?.profileImageUrl || null
    })
  } catch (error) {

    // return error message
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: "Failed to fetch brand images", 
        details: error.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      bannerImageUrl: null, 
      profileImageUrl: null 
    })
  }
} 
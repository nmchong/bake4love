import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// get current brand settings
export async function GET() {
  try {
    // get current brand settings
    let brandSettings = await prisma.brandSettings.findFirst()
    
    // create default brand settings if none exist
    if (!brandSettings) {
      brandSettings = await prisma.brandSettings.create({
        data: {}
      })
    }

    return NextResponse.json({
      bannerImageUrl: brandSettings.bannerImageUrl,
      profileImageUrl: brandSettings.profileImageUrl
    })
  } catch (error) {
    console.error("Error fetching brand images:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// update or create brand settings
export async function PUT(request: NextRequest) {
  try {
    const { bannerImageUrl, profileImageUrl } = await request.json()

    // update or create brand settings
    const brandSettings = await prisma.brandSettings.upsert({
      where: { id: "default" },
      update: {
        bannerImageUrl,
        profileImageUrl
      },
      create: {
        id: "default",
        bannerImageUrl,
        profileImageUrl
      }
    })

    return NextResponse.json({
      bannerImageUrl: brandSettings.bannerImageUrl,
      profileImageUrl: brandSettings.profileImageUrl
    })
  } catch (error) {
    console.error("Error updating brand images:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 
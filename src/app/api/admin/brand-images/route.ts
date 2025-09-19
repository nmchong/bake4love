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
    const { bannerImageUrl, profileImageUrl, updateType } = await request.json()

    // get current brand settings to preserve existing values
    const currentSettings = await prisma.brandSettings.findUnique({
      where: { id: "default" }
    })

    // if no settings exist, create with provided values
    if (!currentSettings) {
      const brandSettings = await prisma.brandSettings.create({
        data: {
          id: "default",
          bannerImageUrl: bannerImageUrl || null,
          profileImageUrl: profileImageUrl || null
        }
      })

      return NextResponse.json({
        bannerImageUrl: brandSettings.bannerImageUrl,
        profileImageUrl: brandSettings.profileImageUrl
      })
    }

    // update only the specific field being changed
    const updateData: { bannerImageUrl?: string | null, profileImageUrl?: string | null } = {}
    
    if (updateType === 'banner') {
      updateData.bannerImageUrl = bannerImageUrl
    } else if (updateType === 'profile') {
      updateData.profileImageUrl = profileImageUrl
    }

    const brandSettings = await prisma.brandSettings.update({
      where: { id: "default" },
      data: updateData
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
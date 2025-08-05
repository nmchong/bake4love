import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// get active discount banners
// GET /api/discount-banners
export async function GET() {
  try {
    // get all active promotion codes
    const promotionCodes = await stripe.promotionCodes.list({
      limit: 100
    })

    // filter for active banners
    const banners = promotionCodes.data
      .filter(promotionCode => 
        promotionCode.active && 
        promotionCode.metadata?.showBanner === "true" &&
        promotionCode.metadata?.bannerMessage &&
        promotionCode.metadata?.deleted !== "true" &&
        (!promotionCode.expires_at || promotionCode.expires_at > Math.floor(Date.now() / 1000))
      )
      .map(promotionCode => ({
        id: promotionCode.id,
        bannerMessage: promotionCode.metadata?.bannerMessage || "",
        code: promotionCode.code
      }))
      .sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime()) // sort by creation date

    return NextResponse.json({ banners })
  } catch (error) {
    console.error("Error fetching discount banners:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 
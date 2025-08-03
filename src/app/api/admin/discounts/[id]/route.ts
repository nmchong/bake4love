import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

interface UpdateDiscountRequest {
  active?: boolean
  showBanner?: boolean
  bannerMessage?: string
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: UpdateDiscountRequest = await req.json()

    if (!id) {
      return NextResponse.json({ error: "Missing discount ID" }, { status: 400 })
    }

    // update promotion code
    const updateData: Stripe.PromotionCodeUpdateParams = {}
    
    if (body.active !== undefined) {
      updateData.active = body.active
    }

    if (body.showBanner !== undefined || body.bannerMessage !== undefined) {
      // get current metadata
      const promotionCode = await stripe.promotionCodes.retrieve(id)
      const currentMetadata = promotionCode.metadata || {}
      
      updateData.metadata = {
        ...currentMetadata,
        showBanner: (body.showBanner !== undefined ? body.showBanner : currentMetadata.showBanner === "true").toString(),
        bannerMessage: body.bannerMessage !== undefined ? body.bannerMessage : currentMetadata.bannerMessage || ""
      }
    }

    const updatedPromotionCode = await stripe.promotionCodes.update(id, updateData)

    return NextResponse.json({
      success: true,
      promotionCode: {
        id: updatedPromotionCode.id,
        code: updatedPromotionCode.code,
        active: updatedPromotionCode.active,
        showBanner: updatedPromotionCode.metadata?.showBanner === "true",
        bannerMessage: updatedPromotionCode.metadata?.bannerMessage || ""
      }
    })

  } catch (error) {
    console.error("Error updating discount:", error)
    return NextResponse.json({ 
      error: "Failed to update discount",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "Missing discount ID" }, { status: 400 })
    }

    // get promotion code details
    const promotionCode = await stripe.promotionCodes.retrieve(id)
    const coupon = await stripe.coupons.retrieve(promotionCode.coupon.id)

    return NextResponse.json({
      id: promotionCode.id,
      code: promotionCode.code,
      active: promotionCode.active,
      type: coupon.metadata?.type || "fixed",
      percentOff: coupon.percent_off,
      amountOffCents: coupon.amount_off,
      minSubtotalCents: (coupon as Stripe.Coupon & { min_amount?: number })?.min_amount,
      expiresAt: coupon.redeem_by ? new Date(coupon.redeem_by * 1000).toISOString() : null,
      showBanner: promotionCode.metadata?.showBanner === "true",
      bannerMessage: promotionCode.metadata?.bannerMessage || "",
      createdAt: new Date(promotionCode.created * 1000).toISOString()
    })

  } catch (error) {
    console.error("Error fetching discount:", error)
    return NextResponse.json({ 
      error: "Failed to fetch discount",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 
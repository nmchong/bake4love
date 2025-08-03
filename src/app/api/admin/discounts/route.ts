import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

interface ExtendedCoupon extends Stripe.Coupon {
  min_amount?: number
}


export async function GET() {
  try {
    // get all promotion codes
    const promotionCodes = await stripe.promotionCodes.list({
      limit: 100
    })

    // get all coupons for additional details
    const coupons = await stripe.coupons.list({
      limit: 100
    })

    const couponMap = new Map(coupons.data.map(coupon => [coupon.id, coupon]))

    // format the response
    const discounts = promotionCodes.data.map(promotionCode => {
      const coupon = couponMap.get(promotionCode.coupon.id) as ExtendedCoupon
      return {
        id: promotionCode.id,
        code: promotionCode.code,
        active: promotionCode.active,
        type: coupon?.metadata?.type || "fixed",
        percentOff: coupon?.percent_off,
        amountOffCents: coupon?.amount_off,
        minSubtotalCents: coupon?.min_amount,
        expiresAt: coupon?.redeem_by ? new Date(coupon.redeem_by * 1000).toISOString() : null,
        showBanner: promotionCode.metadata?.showBanner === "true",
        bannerMessage: promotionCode.metadata?.bannerMessage || "",
        createdAt: new Date(promotionCode.created * 1000).toISOString()
      }
    })

    return NextResponse.json({ discounts })

  } catch (error) {
    console.error("Error fetching discounts:", error)
    return NextResponse.json({ 
      error: "Failed to fetch discounts",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 
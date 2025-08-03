import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

interface ExtendedCoupon extends Stripe.Coupon {
  min_amount?: number
}

interface CreateDiscountRequest {
  code: string
  type: "percent" | "fixed" | "newcomer"
  percentOff?: number
  amountOffCents?: number
  minSubtotalCents?: number
  expiresAt?: string
  showBanner: boolean
  bannerMessage?: string
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

export async function POST(req: NextRequest) {
  try {
    const body: CreateDiscountRequest = await req.json()

    // validate required fields
    if (!body.code || !body.type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // create coupon based on type
    const couponData: Stripe.CouponCreateParams = {
      metadata: {
        type: body.type
      }
    }

    if (body.type === "percent") {
      if (!body.percentOff) {
        return NextResponse.json({ error: "Percent off is required for percent type" }, { status: 400 })
      }
      couponData.percent_off = body.percentOff
    } else if (body.type === "fixed") {
      if (!body.amountOffCents) {
        return NextResponse.json({ error: "Amount off is required for fixed type" }, { status: 400 })
      }
      couponData.amount_off = body.amountOffCents
      couponData.currency = "usd"
    } else if (body.type === "newcomer") {
      if (!body.amountOffCents) {
        return NextResponse.json({ error: "Amount off is required for newcomer type" }, { status: 400 })
      }
      couponData.amount_off = body.amountOffCents
      couponData.currency = "usd"
      couponData.metadata = {
        type: "newcomer"
      }
    }

    // set minimum subtotal if provided
    if (body.minSubtotalCents) {
      (couponData as Stripe.CouponCreateParams & { min_amount?: number }).min_amount = body.minSubtotalCents
    }

    // set expiry if provided
    if (body.expiresAt) {
      couponData.redeem_by = Math.floor(new Date(body.expiresAt).getTime() / 1000)
    }

    // create the coupon
    const coupon = await stripe.coupons.create(couponData)

    // create promotion code
    const promotionCodeData: Stripe.PromotionCodeCreateParams = {
      coupon: coupon.id,
      code: body.code,
      metadata: {
        showBanner: body.showBanner.toString(),
        bannerMessage: body.bannerMessage || ""
      }
    }

    const promotionCode = await stripe.promotionCodes.create(promotionCodeData)

    return NextResponse.json({
      success: true,
      discount: {
        id: promotionCode.id,
        code: promotionCode.code,
        active: promotionCode.active,
        type: body.type,
        percentOff: coupon.percent_off,
        amountOffCents: coupon.amount_off,
        minSubtotalCents: (coupon as ExtendedCoupon)?.min_amount,
        expiresAt: body.expiresAt,
        showBanner: body.showBanner,
        bannerMessage: body.bannerMessage || ""
      }
    })

  } catch (error) {
    console.error("Error creating discount:", error)
    return NextResponse.json({ 
      error: "Failed to create discount",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 
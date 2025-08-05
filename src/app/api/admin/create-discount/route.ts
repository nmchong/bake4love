import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

type DiscountType = "percent" | "fixed"

interface CreateDiscountRequest {
  code: string
  description: string
  type: DiscountType
  amountOffCents?: number
  percentOff?: number
  maxUses?: number
  expiresAt?: string
  minSubtotalCents?: number
  showBanner: boolean
  bannerMessage?: string
}

interface CouponData {
  duration: "once"
  metadata: {
    type: string
    showBanner: string
    bannerMessage: string
  }
  percent_off?: number
  amount_off?: number
  currency?: string
  min_amount?: number
  redeem_by?: number
}


export async function POST(req: NextRequest) {
  try {
    const body: CreateDiscountRequest = await req.json()
    const {
      code,
      type,
      percentOff,
      amountOffCents,
      minSubtotalCents,
      expiresAt,
      showBanner,
      bannerMessage
    } = body

    // validate required fields
    if (!code || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // validate type-specific fields
    if (type === "percent" && !percentOff) {
      return NextResponse.json({ error: "percentOff required for percent type" }, { status: 400 })
    }
    if (type === "fixed" && !amountOffCents) {
      return NextResponse.json({ error: "amountOffCents required for fixed type" }, { status: 400 })
    }

    // create Stripe coupon
    const couponData: CouponData = {
      duration: "once",
      metadata: {
        type,
        showBanner: showBanner.toString(),
        bannerMessage: bannerMessage || ""
      }
    }

    if (type === "percent") {
      couponData.percent_off = percentOff
    } else if (type === "fixed") {
      if (!amountOffCents) {
        return NextResponse.json({ error: "Amount off is required for fixed type" }, { status: 400 })
      }
      couponData.amount_off = amountOffCents
      couponData.currency = "usd"
    }

    if (minSubtotalCents) {
      couponData.min_amount = minSubtotalCents
      couponData.currency = "usd"
    }

    if (expiresAt) {
      couponData.redeem_by = Math.floor(new Date(expiresAt).getTime() / 1000)
    }

    const coupon = await stripe.coupons.create(couponData)

    // create Stripe promotion code
    const promotionCode = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: code.toUpperCase(),
      active: true,
      metadata: {
        type,
        showBanner: showBanner.toString(),
        bannerMessage: bannerMessage || ""
      }
    })

    return NextResponse.json({
      success: true,
      promotionCodeId: promotionCode.id,
      couponId: coupon.id
    })

  } catch (error) {
    console.error("Error creating discount:", error)
    return NextResponse.json({ 
      error: "Failed to create discount",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 
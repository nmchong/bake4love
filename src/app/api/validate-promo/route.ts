import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

interface ExtendedCoupon extends Stripe.Coupon {
  min_amount?: number
}

// validate promo code and return discount amount
// GET /api/validate-promo?code=CODE&subtotal=AMOUNT
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const subtotalParam = searchParams.get("subtotal")

  if (!code || !subtotalParam) {
    return NextResponse.json({ error: "Missing code or subtotal parameter" }, { status: 400 })
    }

  const subtotalCents = parseInt(subtotalParam)

  try {
    // find promotion code
    const promotionCodes = await stripe.promotionCodes.list({
      code: code.toUpperCase(),
      active: true
    })

    if (promotionCodes.data.length === 0) {
      return NextResponse.json({ 
        valid: false, 
        error: "Invalid or expired promotion code" 
      })
    }

    const promotionCode = promotionCodes.data[0]
    const coupon = promotionCode.coupon as ExtendedCoupon

    if (!coupon) {
      return NextResponse.json({ 
        valid: false, 
        error: "Invalid promotion code" 
      })
    }

    // check if coupon is valid
    if (!coupon.valid) {
      return NextResponse.json({ 
        valid: false, 
        error: "Promotion code is no longer valid" 
      })
    }

    // check minimum subtotal
    if (coupon.min_amount && subtotalCents < coupon.min_amount) {
      return NextResponse.json({ 
        valid: false, 
        error: `Minimum order amount of $${(coupon.min_amount / 100).toFixed(2)} is required to use this discount.` 
      })
    }

    // check promotion code restrictions (minimum amount)
    if (promotionCode.restrictions?.minimum_amount && subtotalCents < promotionCode.restrictions.minimum_amount) {
      return NextResponse.json({ 
        valid: false, 
        error: `Minimum subtotal of $${(promotionCode.restrictions.minimum_amount / 100).toFixed(2)} is required to use this discount` 
      })
    }

    // calculate discount amount
    let discountAmountCents = 0
    let discountType: "percent" | "fixed" = "fixed"

    if (coupon.percent_off) {
      discountType = "percent"
      discountAmountCents = Math.floor(subtotalCents * (coupon.percent_off / 100))
    } else if (coupon.amount_off) {
      discountType = "fixed"
      discountAmountCents = coupon.amount_off
    }

    return NextResponse.json({
      valid: true,
      promotionCodeId: promotionCode.id,
      discountCents: discountAmountCents,
      discountType,
      percentOff: coupon.percent_off,
      minAmount: coupon.min_amount || promotionCode.restrictions?.minimum_amount,
      couponType: coupon.metadata?.type || "fixed"
    })

  } catch (error) {
    console.error("Error validating promotion code:", error)
    return NextResponse.json({ 
      error: "Failed to validate promotion code",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 
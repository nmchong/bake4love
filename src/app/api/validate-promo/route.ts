import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

interface ValidatePromoRequest {
  code: string
  email: string
  subtotalCents: number
}

interface ExtendedCoupon extends Stripe.Coupon {
  min_amount?: number
}


export async function POST(req: NextRequest) {
  try {
    const body: ValidatePromoRequest = await req.json()
    const { code, email, subtotalCents } = body

    if (!code || !email || subtotalCents === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

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
        error: `Minimum order amount is $${(coupon.min_amount / 100).toFixed(2)}` 
      })
    }

    // check newcomer restriction
    if (coupon.metadata?.type === "newcomer") {
      // check if customer has previous orders in Stripe
      const customers = await stripe.customers.list({
        email: email,
        limit: 1
      })

      if (customers.data.length > 0) {
        const customer = customers.data[0]
        const charges = await stripe.charges.list({
          customer: customer.id,
          limit: 1
        })

        if (charges.data.length > 0) {
          return NextResponse.json({ 
            valid: false, 
            error: "This promotion is only for new customers" 
          })
        }
      }
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
      discountAmountCents,
      discountType,
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
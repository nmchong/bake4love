import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import Stripe from "stripe"

// check if required environment variables are set
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set")
}

if (!process.env.NEXT_PUBLIC_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not set")
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// helper func to get or create a product for a menu item
async function getOrCreateProduct(menuItem: { id: string; name: string }, variant: string): Promise<string> {
  const productName = `${menuItem.name} (${variant})`
  const productId = `prod_${menuItem.id}_${variant}`
  
  try {
    // try to retrieve existing product
    const existingProduct = await stripe.products.retrieve(productId)
    return existingProduct.id
  } catch {
    // product doesn't exist, create it
    const product = await stripe.products.create({
      id: productId,
      name: productName,
      metadata: {
        menuItemId: menuItem.id,
        variant: variant,
        discountable: 'true'
      }
    })
    return product.id
  }
}

// helper function to get or create tip product
async function getOrCreateTipProduct(): Promise<string> {
  const tipProductId = 'prod_tip'
  
  try {
    // try to retrieve existing tip product
    const existingProduct = await stripe.products.retrieve(tipProductId)
    return existingProduct.id
  } catch {
    // tip product doesn't exist, create it
    const product = await stripe.products.create({
      id: tipProductId,
      name: 'Tip (optional)',
      metadata: {
        no_discount: 'true'
      }
    })
    return product.id
  }
}

// stripe checkout session
// POST /api/checkout { orderId, tipCents }
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { orderId, tipCents = 0 } = body
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 })
    }

    console.log("Creating checkout session for order:", orderId)

    // fetch order & items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: { include: { menuItem: true } } },
    })
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    if (order.status !== "pending") {
      return NextResponse.json({ error: "Order is not pending" }, { status: 400 })
    }

    console.log("Order found:", order.id, "Items:", order.orderItems.length)

    // create products and line items
    const line_items = []
    const productIds = []
    
    for (const item of order.orderItems) {
      const productId = await getOrCreateProduct(item.menuItem, item.variant)
      productIds.push(productId)
      
      line_items.push({
        price_data: {
          currency: "usd",
          product: productId,
          unit_amount: item.variant === "half"
            ? item.menuItem.halfPrice ?? 0
            : item.menuItem.price,
        },
        quantity: item.quantity,
      })
    }

    // add tip if provided (as separate product)
    if (tipCents > 0) {
      const tipProductId = await getOrCreateTipProduct()
      line_items.push({
        price_data: {
          currency: 'usd',
          product: tipProductId,
          unit_amount: tipCents,
        },
        quantity: 1,
      })
    }

    console.log("Line items created:", line_items.length)

    // create stripe checkout session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: line_items,
      mode: "payment",
      customer_email: order.customerEmail,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order/${order.id}?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order/${order.id}?canceled=1`,
      metadata: {
        orderId: order.id,
      },
    }

    // add discount if discount code exists, but only for menu items (not tip)
    if (order.discountCode && order.promotionCodeId) {
      // get promo code to understand its discount details
      const promotionCode = await stripe.promotionCodes.retrieve(order.promotionCodeId)
      const originalCoupon = promotionCode.coupon
      
      // create a new coupon that only applies to menu item products (exclude tip)
      const couponData: Stripe.CouponCreateParams = {
        duration: 'once',
        applies_to: {
          products: productIds // only apply to menu item products (exclude tip)
        }
      }
      
      // copy the discount type from the original coupon
      if (originalCoupon.percent_off) {
        couponData.percent_off = originalCoupon.percent_off
      } else if (originalCoupon.amount_off) {
        couponData.amount_off = originalCoupon.amount_off
        if (originalCoupon.currency) {
          couponData.currency = originalCoupon.currency
        }
      }
      
      const selectiveCoupon = await stripe.coupons.create(couponData)
      
      sessionConfig.discounts = [{ coupon: selectiveCoupon.id }]
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    console.log("Stripe session created:", session.id)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Error creating Stripe session:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 
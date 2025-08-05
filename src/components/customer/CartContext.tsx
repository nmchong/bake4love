'use client'
import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

export type CartItem = {
  id: string
  name: string
  price: number
  variant: "full" | "half"
  quantity: number
}

interface CustomerInfo {
  name: string
  email: string
  notes: string
}

interface CartContextType {
  cartItems: CartItem[]
  pickupDate: string | null
  pickupTime: string | null
  customerInfo: CustomerInfo
  tipCents: number
  discountCode: string
  discountCents: number
  displayDiscountCode: string // the code user entered (like SAVE20)
  setPickupDate: (date: string) => void
  setPickupTime: (time: string) => void
  setCustomerInfo: (info: CustomerInfo) => void
  setTipCents: (tipCents: number) => void
  setDiscountCode: (code: string) => void
  setDiscountCents: (cents: number) => void
  setDisplayDiscountCode: (code: string) => void
  resetCart: () => void
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  increment: (id: string, variant: "full" | "half") => void
  decrement: (id: string, variant: "full" | "half") => void
  removeItem: (id: string, variant: "full" | "half") => void
  restoreCartFromOrder: (orderItems: { menuItem: { id: string; name: string; price: number; halfPrice?: number }; quantity: number; variant: string }[], pickupDate: string, pickupTime: string) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const STORAGE_KEY = "bake4love-cart"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [pickupDate, setPickupDate] = useState<string | null>(null)
  const [pickupTime, setPickupTime] = useState<string | null>(null)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ name: "", email: "", notes: "" })
  const [tipCents, setTipCents] = useState(200) // Default to $2
  const [discountCode, setDiscountCode] = useState("")
  const [discountCents, setDiscountCents] = useState(0)
  const [displayDiscountCode, setDisplayDiscountCode] = useState("")
  const [hydrated, setHydrated] = useState(false)

  // rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (data) {
        const parsed = JSON.parse(data)
        setCartItems(parsed.cartItems || [])
        setPickupDate(parsed.pickupDate || null)
        setPickupTime(parsed.pickupTime || null)
        setCustomerInfo(parsed.customerInfo || { name: "", email: "", notes: "" })
        setTipCents(parsed.tipCents || 200)
        setDiscountCode(parsed.discountCode || "")
        setDiscountCents(parsed.discountCents || 0)
        setDisplayDiscountCode(parsed.displayDiscountCode || "")
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
    } finally {
      setHydrated(true)
    }
  }, [])

  // persist to localStorage on change
  useEffect(() => {
    if (!hydrated) return
    
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ 
          cartItems, 
          pickupDate, 
          pickupTime, 
          customerInfo, 
          tipCents, 
          discountCode, 
          discountCents,
          displayDiscountCode
        })
      )
    } catch (error) {
      console.error('Error saving cart to localStorage:', error)
    }
  }, [cartItems, pickupDate, pickupTime, customerInfo, tipCents, discountCode, discountCents, displayDiscountCode, hydrated])

  const resetCart = useCallback(() => {
    setCartItems([])
    setPickupTime(null)
    setCustomerInfo({ name: "", email: "", notes: "" })
    setTipCents(200)
    setDiscountCode("")
    setDiscountCents(0)
    setDisplayDiscountCode("")
  }, [])

  const addToCart = (item: Omit<CartItem, "quantity">, quantity: number = 1) => {
    setCartItems(prev => {
      const existingItemIndex = prev.findIndex(
        i => i.id === item.id && i.variant === item.variant
      )
      
      if (existingItemIndex !== -1) {
        // update existing item
        return prev.map((cartItem, index) => 
          index === existingItemIndex 
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        )
      } else {
        // add new item
        return [...prev, { ...item, quantity }]
      }
    })
  }

  const increment = (id: string, variant: "full" | "half") => {
    setCartItems(prev => prev.map(item =>
      item.id === id && item.variant === variant
        ? { ...item, quantity: item.quantity + 1 }
        : item
    ))
  }

  const decrement = (id: string, variant: "full" | "half") => {
    setCartItems(prev => prev
      .map(item =>
        item.id === id && item.variant === variant
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter(item => item.quantity > 0)
    )
  }

  const removeItem = (id: string, variant: "full" | "half") => {
    setCartItems(prev => prev.filter(item => !(item.id === id && item.variant === variant)))
  }

  // restore cart when order cancelled (going back from Stripe checkout page)
  const restoreCartFromOrder = (orderItems: { menuItem: { id: string; name: string; price: number; halfPrice?: number }; quantity: number; variant: string }[], pickupDate: string, pickupTime: string) => {
    // reset cart
    setCartItems([])
    
    // add all items from order
    for (const item of orderItems) {
      addToCart({
        id: item.menuItem.id,
        name: item.menuItem.name,
        price: item.variant === "half" ? (item.menuItem.halfPrice ?? 0) : item.menuItem.price,
        variant: item.variant as "full" | "half"
      }, item.quantity)
    }
    
    // set pickup date/time
    setPickupDate(pickupDate)
    setPickupTime(pickupTime)
  }

  // show loading state while hydrating
  if (!hydrated) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      pickupDate, 
      pickupTime, 
      customerInfo,
      tipCents,
      discountCode,
      discountCents,
      displayDiscountCode,
      setPickupDate, 
      setPickupTime, 
      setCustomerInfo,
      setTipCents,
      setDiscountCode,
      setDiscountCents,
      setDisplayDiscountCode,
      resetCart, 
      addToCart, 
      increment, 
      decrement, 
      removeItem,
      restoreCartFromOrder
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within a CartProvider")
  return ctx
} 
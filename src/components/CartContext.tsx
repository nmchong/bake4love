import React, { createContext, useContext, useState } from "react"

export type CartItem = {
  id: string
  name: string
  price: number
  variant: "full" | "half"
  quantity: number
}

interface CartContextType {
  cartItems: CartItem[]
  pickupDate: string | null
  pickupTime: string | null
  setPickupDate: (date: string) => void
  setPickupTime: (time: string) => void
  resetCart: () => void
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  increment: (id: string, variant: "full" | "half") => void
  decrement: (id: string, variant: "full" | "half") => void
  removeItem: (id: string, variant: "full" | "half") => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [pickupDate, setPickupDate] = useState<string | null>(null)
  const [pickupTime, setPickupTime] = useState<string | null>(null)

  const resetCart = () => {
    setCartItems([])
    setPickupTime(null)
  }

  const addToCart = (item: Omit<CartItem, "quantity">, quantity: number = 1) => {
    setCartItems(prev => {
      const idx = prev.findIndex(
        i => i.id === item.id && i.variant === item.variant
      )
      if (idx !== -1) {
        const updated = [...prev]
        updated[idx].quantity += quantity
        return updated
      }
      return [...prev, { ...item, quantity }]
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

  return (
    <CartContext.Provider value={{ cartItems, pickupDate, pickupTime, setPickupDate, setPickupTime, resetCart, addToCart, increment, decrement, removeItem }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within a CartProvider")
  return ctx
} 
// for admin orders page

export interface OrderItem {
  id: string
  quantity: number
  variant: string
  menuItem: {
    id: string
    name: string
    price: number
    halfPrice?: number
  }
}

export interface Order {
  id: string
  customerName: string
  customerEmail: string
  pickupDate: string
  pickupTime: string
  notes?: string
  cost: number
  status: string
  createdAt: string
  orderItems: OrderItem[]
} 
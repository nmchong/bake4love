// MenuItem
export type MenuItem = {
  id: string
  name: string
  description?: string | null
  ingredients?: string[]
  price: number
  halfPrice?: number | null
  hasHalfOrder?: boolean
  active: boolean
  availableDays?: string[]
  imageUrl?: string | null
}
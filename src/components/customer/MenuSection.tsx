import { useState } from "react"
import { MenuItem } from "@prisma/client"
import MenuItemCard from "./MenuItemCard"
import MenuItemModal from "./MenuItemModal"

interface MenuSectionProps {
  items: MenuItem[]
  selectedDate?: string
  onMenuItemClick?: (item: MenuItem) => void
  disableAddToCart?: boolean
}

// render menu section (all menu items)
export default function MenuSection({ items, selectedDate, onMenuItemClick, disableAddToCart }: MenuSectionProps) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)

  if (!items || items.length === 0) {
    return (
      <div className="text-center text-[#6B4C32] mt-10 px-4 pb-8">
        No menu items available for this date.
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6 px-4 pb-8">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} onClick={() => onMenuItemClick ? onMenuItemClick(item) : setSelectedItem(item)} />
        ))}
      </div>

      {selectedItem && !onMenuItemClick && (
        <MenuItemModal 
          key={selectedItem.id} 
          menuItem={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          selectedDate={selectedDate} 
          disableAddToCart={disableAddToCart} 
        />
      )}
    </>
  )
}

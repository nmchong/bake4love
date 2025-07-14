import { useState } from "react"
import { MenuItem } from "@prisma/client"
import MenuItemCard from "./MenuItemCard"
import MenuItemModal from "./MenuItemModal"

interface MenuSectionProps {
  items: MenuItem[]
  selectedDate: string
}

// render menu section (all menu items)
export default function MenuSection({ items, selectedDate }: MenuSectionProps) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)

  if (!items || items.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-10">
        No menu items available for this date.
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
        ))}
      </div>
      {selectedItem && (
        <MenuItemModal menuItem={selectedItem} onClose={() => setSelectedItem(null)} selectedDate={selectedDate} />
      )}
    </>
  )
}

import { useState } from "react"
import type { MenuItem } from "@/types"
import EditMenuItemModal from "./EditMenuItemModal"
import DeleteMenuItemButton from "./DeleteMenuItemButton"
import { Button } from "@/components/ui/button"

interface MenuItemListProps {
  menuItems: MenuItem[]
  onEdit: (item: MenuItem, values: Partial<MenuItem>) => void
  onDelete: (item: MenuItem) => void
  isLoading?: boolean
}

export default function MenuItemList({ menuItems, onEdit, onDelete, isLoading }: MenuItemListProps) {
  const [editing, setEditing] = useState<MenuItem | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  return (
    <div>
      <EditMenuItemModal
        open={editOpen}
        onOpenChange={setEditOpen}
        menuItem={editing}
        onSave={values => {
          if (editing) onEdit(editing, values)
          setEditOpen(false)
        }}
        isLoading={isLoading}
      />
      <div className="divide-y">
        {menuItems.map(item => (
          <div key={item.id} className="flex items-center justify-between py-3">
            <div>
              <div className="font-semibold">{item.name}</div>
              <div className="text-xs text-gray-500">${(item.price / 100).toFixed(2)}{!item.active && <span className="ml-2 text-red-500">(Inactive)</span>}</div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setEditing(item); setEditOpen(true) }}>Edit</Button>
              <DeleteMenuItemButton menuItemId={item.id} onDelete={() => onDelete(item)} isLoading={isLoading} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 
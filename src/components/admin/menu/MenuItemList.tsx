import { useState } from "react"
import type { MenuItem } from "@/types"
import EditMenuItemModal from "./EditMenuItemModal"
import DeleteMenuItemButton from "./DeleteMenuItemButton"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit } from "lucide-react"
import Image from "next/image"

interface MenuItemListProps {
  menuItems: MenuItem[]
  onEdit: (item: MenuItem, values: Partial<MenuItem>) => void
  onDelete: (item: MenuItem) => void
  isLoading?: boolean
}

// helper func to sort days in correct order
function sortDays(days: string[]): string[] {
  const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  return days.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b))
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
      
      <div className="space-y-4 w-full">
        {menuItems.map(item => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-8">
                {/* image */}
                <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                  {/* status badge (inactive) */}
                  {!item.active && (
                    <div className="absolute top-1 left-1">
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                        Inactive
                      </span>
                    </div>
                  )}
                </div>
                
                {/* content */}
                <div className="flex-1 min-w-0">
                  {/* name & price */}
                  <div className="mb-2">
                    <span className="font-semibold text-[#4A2F1B] text-lg">{item.name}</span>
                    <span className="text-[#6B4C32] ml-2">
                      Full: ${(item.price / 100).toFixed(2)}
                      {item.hasHalfOrder && item.halfPrice && (
                        <span className="ml-2">
                          | Half: ${(item.halfPrice / 100).toFixed(2)}
                        </span>
                      )}
                    </span>
                  </div>
                  
                  {/* available days */}
                  <div className="flex flex-wrap gap-1">
                    {sortDays(item.availableDays || []).map(day => (
                      <span 
                        key={day} 
                        className="px-2 py-1 bg-[#F3E9D7] text-[#6B4C32] rounded text-xs"
                      >
                        {day.slice(0, 3)}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* actions (edit/delete) */}
                <div className="flex gap-2 flex-shrink-0">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => { setEditing(item); setEditOpen(true) }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <DeleteMenuItemButton 
                    menuItemId={item.id} 
                    onDelete={() => onDelete(item)} 
                    isLoading={isLoading} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {menuItems.length === 0 && (
        <div className="text-center py-12 text-[#6B4C32]">
          <p className="text-lg font-medium mb-2">No menu items yet</p>
          <p className="text-sm">Click &quot;Add Menu Item&quot; to get started</p>
        </div>
      )}
    </div>
  )
} 
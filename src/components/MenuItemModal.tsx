import { MenuItem } from "@/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"

type Props = {
  menuItem: MenuItem,
  onClose: () => void
}

// popup modal when clicking on menu item
export default function MenuItemModal({ menuItem, onClose }: Props) {
  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{menuItem.name}</DialogTitle>
          <DialogDescription>
            Available on: {menuItem.availableDays?.join(", ") || ""}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 text-sm">
          <Image
            src={menuItem.imageUrl || "/placeholder.jpg"}
            alt={menuItem.name}
            width={400}
            height={250}
            className="rounded-lg object-cover w-full h-[200px] mb-4"
          />
          {menuItem.description && (
            <p><span className="font-semibold">Description:</span> {menuItem.description}</p>
          )}
          <p><span className="font-semibold">Ingredients:</span> {menuItem.ingredients?.join(", ") || ""}</p>
          <p><span className="font-semibold">Price:</span> ${menuItem.price / 100}</p>
          {menuItem.hasHalfOrder && (
            <p><span className="font-semibold">Half Price:</span> ${menuItem.halfPrice! / 100}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

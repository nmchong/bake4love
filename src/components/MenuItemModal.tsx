import { useState } from "react"
import { useCart } from "@/components/CartContext"
import { MenuItem } from "@/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"

type Props = {
  menuItem: MenuItem,
  onClose: () => void
}

// popup modal when clicking on menu item
export default function MenuItemModal({ menuItem, onClose }: Props) {
  const { addToCart } = useCart()
  const [variant, setVariant] = useState<"full" | "half">("full")
  const [quantity, setQuantity] = useState(1)

  const canHalf = menuItem.hasHalfOrder && menuItem.halfPrice != null

  const handleAdd = () => {
    addToCart({
      id: menuItem.id,
      name: menuItem.name,
      price: variant === "half" ? menuItem.halfPrice ?? menuItem.price : menuItem.price,
      variant
    }, quantity)
    onClose()
  }

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
          <div className="mt-4">
            <label className="font-semibold">Portion:</label>
            <div className="flex gap-4 mt-1">
              <label>
                <input type="radio" name="portion" value="full" checked={variant === "full"} onChange={() => setVariant("full")}/>
                Full
              </label>
              {canHalf && (
                <label>
                  <input type="radio" name="portion" value="half" checked={variant === "half"} onChange={() => setVariant("half")}/>
                  Half
                </label>
              )}
            </div>
          </div>
          <div className="mt-2">
            <label className="font-semibold">Quantity:</label>
            <input type="number" min={1} value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="ml-2 w-16 border rounded p-1" />
          </div>
          <button className="mt-4 px-4 py-2 bg-black text-white rounded" onClick={handleAdd}>
            Add to Cart
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

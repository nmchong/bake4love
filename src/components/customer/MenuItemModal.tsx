import { useState } from "react"
import { useCart } from "@/components/customer/CartContext"
import { MenuItem } from "@/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"

interface Props {
  menuItem: MenuItem,
  onClose: () => void,
  selectedDate: string // yyyy-MM-dd format
}


// popup modal when clicking on menu item
export default function MenuItemModal({ menuItem, onClose, selectedDate }: Props) {
  const { cartItems, pickupDate, setPickupDate, addToCart, resetCart } = useCart()
  const [variant, setVariant] = useState<"full" | "half">("full")
  const [quantity, setQuantity] = useState(1)
  const [showDateWarning, setShowDateWarning] = useState(false)
  const [pendingAdd, setPendingAdd] = useState<{variant: "full"|"half", quantity: number} | null>(null)

  const canHalf = menuItem.hasHalfOrder && menuItem.halfPrice != null

  // try to add (show date warning if needed)
  const tryAdd = () => {
    if (cartItems.length > 0 && pickupDate && pickupDate !== selectedDate) {
      setPendingAdd({ variant, quantity })
      setShowDateWarning(true)
    } else {
      doAdd(variant, quantity, selectedDate)
    }
  }

  // add if no date warning
  const doAdd = (variant: "full"|"half", quantity: number, date: string) => {
    if (!pickupDate || pickupDate !== date) {
      setPickupDate(date)
    }
    addToCart({
      id: menuItem.id,
      name: menuItem.name,
      price: variant === "half" ? menuItem.halfPrice ?? menuItem.price : menuItem.price,
      variant
    }, quantity)
    onClose()
  }

  // switch pickup date
  const confirmSwitchDate = () => {
    if (pendingAdd) {
      resetCart()
      setPickupDate(selectedDate)
      doAdd(pendingAdd.variant, pendingAdd.quantity, selectedDate)
      setShowDateWarning(false)
      setPendingAdd(null)
    }
  }

  const cancelSwitchDate = () => {
    setShowDateWarning(false)
    setPendingAdd(null)
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

        <div className="flex flex-col gap-2 text-sm text-[#4A2F1B]">
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

          <button className="mt-4 px-4 py-2 bg-[#A4551E] text-[#FFFDF5] rounded hover:bg-[#843C12]" onClick={tryAdd}>
            Add to Cart
          </button>
        </div>

        {showDateWarning && (
          <div className="fixed inset-0 flex items-center justify-center bg-[#4A2F1B] bg-opacity-40 z-50">
            <div className="bg-[#FAF7ED] p-6 rounded shadow-lg max-w-sm w-full">
              <h2 className="text-lg font-bold mb-2 text-[#4A2F1B]">Switch delivery date?</h2>
              <p className="mb-4 text-[#6B4C32]">Switching your delivery date will reset your cart. Continue?</p>
              <div className="flex gap-2 justify-end">
                <button className="px-4 py-2 rounded bg-[#FAF7ED] text-[#4A2F1B] border" onClick={cancelSwitchDate}>Cancel</button>
                <button className="px-4 py-2 rounded bg-[#A4551E] text-[#FFFDF5] hover:bg-[#843C12]" onClick={confirmSwitchDate}>Switch Date</button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

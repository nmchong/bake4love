import { useState } from "react"
import { useCart } from "@/components/customer/CartContext"
import { MenuItem } from "@/types"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"

interface Props {
  menuItem: MenuItem,
  onClose: () => void,
  selectedDate?: string // yyyy-MM-dd format, optional
  disableAddToCart?: boolean
}


// popup modal when clicking on menu item
export default function MenuItemModal({ menuItem, onClose, selectedDate, disableAddToCart }: Props) {
  const { cartItems, pickupDate, setPickupDate, addToCart, resetCart } = useCart()
  const [variant, setVariant] = useState<"full" | "half">("full")
  const [quantity, setQuantity] = useState(1)
  const [showDateWarning, setShowDateWarning] = useState(false)
  const [pendingAdd, setPendingAdd] = useState<{variant: "full"|"half", quantity: number} | null>(null)

  const canHalf = menuItem.hasHalfOrder && menuItem.halfPrice != null

  // try to add (show date warning if needed)
  const tryAdd = () => {
    const date = selectedDate || "";
    if (cartItems.length > 0 && pickupDate && pickupDate !== date) {
      setPendingAdd({ variant, quantity })
      setShowDateWarning(true)
    } else {
      doAdd(variant, quantity, date)
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
    const date = selectedDate || "";
    if (pendingAdd) {
      resetCart()
      setPickupDate(date)
      doAdd(pendingAdd.variant, pendingAdd.quantity, date)
      setShowDateWarning(false)
      setPendingAdd(null)
    }
  }

  const cancelSwitchDate = () => {
    setShowDateWarning(false)
    setPendingAdd(null)
  }

  const incrementQuantity = () => setQuantity(prev => prev + 1)
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1))


  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogTitle className="sr-only">{menuItem.name}</DialogTitle>
        
        {/* title */}
        <h2 className="text-2xl font-bold text-[#4A2F1B] mb-4">{menuItem.name}</h2>

        {/* image */}
        <Image
          src={menuItem.imageUrl || "https://placehold.co/300x180"}
          alt={menuItem.name}
          width={300}
          height={180}
          className="w-full h-36 object-cover rounded-lg mb-4"
        />

        {/* description & ingredients */}
        <div className="space-y-3 mb-6">
          {menuItem.description && (
            <p className="text-[#4A2F1B]">{menuItem.description}</p>
          )}
          {menuItem.ingredients && menuItem.ingredients.length > 0 && (
            <div>
              <p className="font-semibold text-[#4A2F1B] mb-1">Ingredients:</p>
              <p className="text-sm text-[#6B4C32]">{menuItem.ingredients.join(", ")}</p>
            </div>
          )}
        </div>

        {/* portion size */}
        <div className="bg-[#F3E9D7] p-3 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[#4A2F1B]">Portion Size</h3>
            {!disableAddToCart && (
              <span className="text-xs text-[#6B4C32] bg-[#E5DED6] px-2 py-1 rounded">Required</span>
            )}
          </div>
          
          <div className="space-y-2">
            {/* full portion */}
            <label className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-colors ${
              variant === "full" && !disableAddToCart
                ? "bg-[#A4551E] text-white border-[#A4551E]" 
                : disableAddToCart
                ? "bg-[#F5F5F5] text-[#6B4C32] border-[#E5DED6] cursor-not-allowed"
                : "bg-white text-[#4A2F1B] border-[#E5DED6] hover:border-[#A4551E]"
            }`}>
              <div className="flex items-center gap-3">
                <input 
                  type="radio" 
                  name="portion" 
                  value="full" 
                  checked={variant === "full"} 
                  onChange={() => setVariant("full")}
                  disabled={disableAddToCart}
                  className="sr-only"
                />
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  disableAddToCart ? "border-[#E5DED6]" : "border-[#4A2F1B]"
                }`}>
                  {variant === "full" && !disableAddToCart && <div className="w-3 h-3 bg-white rounded-full"></div>}
                  {variant === "full" && disableAddToCart && <div className="w-3 h-3 bg-[#6B4C32] rounded-full"></div>}
                </div>
                <div>
                  <div className="font-medium">Full Portion</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">${(menuItem.price / 100).toFixed(2)}</div>
              </div>
            </label>

            {/* half portion */}
            {canHalf && (
              <label className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-colors ${
                variant === "half" && !disableAddToCart
                  ? "bg-[#A4551E] text-white border-[#A4551E]" 
                  : disableAddToCart
                  ? "bg-[#F5F5F5] text-[#6B4C32] border-[#E5DED6] cursor-not-allowed"
                  : "bg-white text-[#4A2F1B] border-[#E5DED6] hover:border-[#A4551E]"
              }`}>
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="portion" 
                    value="half" 
                    checked={variant === "half"} 
                    onChange={() => setVariant("half")}
                    disabled={disableAddToCart}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    disableAddToCart ? "border-[#E5DED6]" : "border-[#4A2F1B]"
                  }`}>
                    {variant === "half" && !disableAddToCart && <div className="w-3 h-3 bg-white rounded-full"></div>}
                    {variant === "half" && disableAddToCart && <div className="w-3 h-3 bg-[#6B4C32] rounded-full"></div>}
                  </div>
                  <div>
                    <div className="font-medium">Half Portion</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${(menuItem.halfPrice! / 100).toFixed(2)}</div>
                </div>
              </label>
            )}
          </div>
        </div>

        {/* quantity */}
        <div className="mb-6">
          <label className="font-semibold text-[#4A2F1B] mb-2 block">Quantity:</label>
          <div className="flex items-center">
            <button
              onClick={decrementQuantity}
              disabled={quantity <= 1 || disableAddToCart}
              className="w-8 h-8 rounded border border-[#E5DED6] flex items-center justify-center hover:bg-[#F3E9D7] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <button 
              onClick={incrementQuantity}
              disabled={quantity >= 10 ||disableAddToCart}
              className="w-8 h-8 rounded border border-[#E5DED6] flex items-center justify-center hover:bg-[#F3E9D7] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        </div>

        {/* add to cart button */}
        <button 
          className="w-full px-4 py-3 bg-[#A4551E] text-[#FFFDF5] rounded-lg hover:bg-[#843C12] disabled:opacity-60 font-semibold" 
          onClick={tryAdd} 
          disabled={disableAddToCart}
        >
          {disableAddToCart ? "Select pickup date to order" : "Add to Cart"}
        </button>

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

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface FulfillButtonProps {
  orderId: string
  onFulfilled: () => void
  isLoading?: boolean
}

export default function FulfillButton({ orderId, onFulfilled, isLoading: isLoadingProp }: FulfillButtonProps) {
  const [loading, setLoading] = useState(false)
  const isLoading = isLoadingProp || loading

  const handleFulfill = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/markFulfilled/${orderId}`, { method: "PATCH" })
      if (!res.ok) throw new Error("Failed to fulfill order")
      onFulfilled()
    } catch {
      // show error
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleFulfill} disabled={isLoading} variant="default">
      {isLoading ? "Fulfilling..." : "Mark as Fulfilled"}
    </Button>
  )
} 
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ConfirmationDialog } from "@/components/admin/shared/ConfirmationDialog"
import { Trash2 } from "lucide-react"

interface DeleteMenuItemButtonProps {
  menuItemId: string
  onDelete: () => void
  isLoading?: boolean
}

export default function DeleteMenuItemButton({ onDelete, isLoading }: DeleteMenuItemButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setOpen(true)} 
        disabled={isLoading}
        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete
      </Button>
      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Remove Menu Item?"
        message="This will delete the item from customers (but will preserve order history)."
        onConfirm={onDelete}
        onCancel={() => setOpen(false)}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </>
  )
} 
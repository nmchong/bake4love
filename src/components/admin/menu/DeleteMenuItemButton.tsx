import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ConfirmationDialog } from "@/components/admin/shared/ConfirmationDialog"

interface DeleteMenuItemButtonProps {
  menuItemId: string
  onDelete: () => void
  isLoading?: boolean
}

export default function DeleteMenuItemButton({ onDelete, isLoading }: DeleteMenuItemButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)} disabled={isLoading}>Delete</Button>
      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Menu Item?"
        message="Are you sure you want to permanently delete this menu item? This cannot be undone."
        onConfirm={onDelete}
        onCancel={() => setOpen(false)}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </>
  )
} 
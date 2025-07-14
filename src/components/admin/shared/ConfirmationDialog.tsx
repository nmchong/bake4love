import * as Dialog from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string
  onConfirm: () => void
  onCancel?: () => void
  confirmLabel?: string
  cancelLabel?: string
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
}: ConfirmationDialogProps) {
  return (
    <Dialog.Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.DialogContent>
        <Dialog.DialogHeader>
          <Dialog.DialogTitle>{title}</Dialog.DialogTitle>
        </Dialog.DialogHeader>
        <div className="py-4">{message}</div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => { onCancel?.(); onOpenChange(false); }}>{cancelLabel}</Button>
          <Button onClick={() => { onConfirm(); onOpenChange(false); }}>{confirmLabel}</Button>
        </div>
      </Dialog.DialogContent>
    </Dialog.Dialog>
  )
} 
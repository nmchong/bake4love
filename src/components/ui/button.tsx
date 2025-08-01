import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#A4551E] text-[#FFFDF5] shadow-xs hover:bg-[#843C12]",
        destructive:
          "bg-[#843C12] text-white shadow-xs hover:bg-[#A4551E] focus-visible:ring-[#843C12]/20 dark:focus-visible:ring-[#843C12]/40 dark:bg-[#843C12]/60",
        outline:
          "border bg-[#FAF7ED] text-[#4A2F1B] shadow-xs hover:bg-[#FFFDF5] hover:text-[#A4551E] dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-[#FAF7ED] text-[#6B4C32] shadow-xs hover:bg-[#FFFDF5]",
        ghost:
          "hover:bg-[#FAF7ED] hover:text-[#A4551E] dark:hover:bg-[#FAF7ED]/50",
        link: "text-[#4B5B66] underline-offset-4 hover:underline hover:text-[#843C12]",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

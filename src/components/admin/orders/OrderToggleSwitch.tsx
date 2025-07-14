import { Button } from "@/components/ui/button"

interface OrderToggleSwitchProps {
  value: "upcoming" | "past"
  onChange: (value: "upcoming" | "past") => void
}

export default function OrderToggleSwitch({ value, onChange }: OrderToggleSwitchProps) {
  return (
    <div className="inline-flex rounded bg-gray-100 p-1 mb-4">
      <Button
        variant={value === "upcoming" ? "default" : "ghost"}
        className="rounded-l"
        onClick={() => onChange("upcoming")}
      >
        Upcoming
      </Button>
      <Button
        variant={value === "past" ? "default" : "ghost"}
        className="rounded-r"
        onClick={() => onChange("past")}
      >
        Past
      </Button>
    </div>
  )
} 
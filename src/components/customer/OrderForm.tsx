"use client"

export interface OrderFormValues {
  name: string
  email: string
  notes: string
}

interface OrderFormProps {
  values: OrderFormValues
  onChange: (values: OrderFormValues) => void
}

export default function OrderForm({ values, onChange }: OrderFormProps) {
  const handleChange = (field: keyof OrderFormValues, value: string) => {
    onChange({ ...values, [field]: value })
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold text-[#4A2F1B]">Customer Info</h2>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Name"
          className="w-full border rounded p-2"
          value={values.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded p-2"
          value={values.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />
        <textarea
          placeholder="Notes (optional)"
          className="w-full border rounded p-2"
          value={values.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
        />
      </div>

    </div>
  )
}

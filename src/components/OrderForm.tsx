"use client"
import { useState } from "react"

export default function OrderForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [notes, setNotes] = useState("")

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Customer Info</h2>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Name"
          className="w-full border rounded p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <textarea
          placeholder="Notes (optional)"
          className="w-full border rounded p-2"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </div>
  )
}

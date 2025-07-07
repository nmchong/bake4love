'use client'

import { useEffect, useState } from 'react'

type MenuItem = {
  id: string
  name: string
  price: number
  description?: string
  ingredients?: string[]
  active: boolean
  availableDays?: string[]
  imageUrl?: string
}

export default function HomePage() {
  const [items, setItems] = useState<MenuItem[]>([])

  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => setItems(data))
  }, [])

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Menu</h1>
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item.id} className="p-2 border rounded">
            {item.name} - ${(item.price / 100).toFixed(2)}
            / {item.description} / {item.ingredients} / {item.active} / {item.availableDays} / {item.imageUrl}
          </li>
        ))}
      </ul>
    </main>
  )
}

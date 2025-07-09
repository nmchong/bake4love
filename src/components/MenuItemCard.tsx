"use client"

import { MenuItem } from "@/types"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

interface Props {
  item: MenuItem
  onClick: () => void
}


// single menu item
export default function MenuItemCard({ item, onClick }: Props) {
  return (
    <Card onClick={onClick} className="cursor-pointer hover:shadow-lg">
      <CardContent className="p-4">
        <Image
          src={item.imageUrl || "https://placehold.co/300x128"}
          alt={item.name}
          width={300}
          height={128}
          className="w-full h-32 object-cover rounded-md mb-2"
        />
        <h3 className="text-lg font-semibold">{item.name}</h3>
        <p className="text-sm text-gray-500">
          {item.availableDays?.join(", ") || ""}
        </p>
        <p className="font-bold mt-1">${(item.price / 100).toFixed(2)}</p>
      </CardContent>
    </Card>
  )
}

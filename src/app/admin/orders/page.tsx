"use client"

import { useEffect, useState } from "react"
import AdminSidebar from "@/components/admin/shared/AdminSidebar"
import OrderToggleSwitch from "@/components/admin/orders/OrderToggleSwitch"
import OrderList from "@/components/admin/orders/OrderList"
import type { Order } from "@/types/order"

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming")

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      const res = await fetch(`/api/admin/orders?tab=${tab}`)
      const data = await res.json()
      setOrders(data.orders || [])
      setLoading(false)
    }
    fetchOrders()
  }, [tab])

  return (
    <div className="flex min-h-screen bg-[#F3E9D7]">
      <AdminSidebar />
      <main className="flex-1 py-8 px-16 bg-[#F3E9D7]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Orders</h1>
          <OrderToggleSwitch value={tab} onChange={setTab} />
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading orders...</div>
        ) : (
          <OrderList orders={orders} />
        )}
      </main>
    </div>
  )
} 
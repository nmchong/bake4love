"use client"

import { useEffect, useState } from "react"
import type { MenuItem } from "@/types"
import MenuItemList from "@/components/admin/menu/MenuItemList"
import EditMenuItemModal from "@/components/admin/menu/EditMenuItemModal"
import { Button } from "@/components/ui/button"
import AdminSidebar from "@/components/admin/shared/AdminSidebar"

function PageHeader({ title }: { title: string }) {
  return <h1 className="text-2xl font-bold mb-6">{title}</h1>
}

export default function AdminMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  // Fetch menu items
  const fetchMenuItems = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/menu")
      if (!res.ok) throw new Error("Failed to fetch menu items")
      const data = await res.json()
      setMenuItems(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenuItems()
  }, [])

  // Add menu item
  const handleAdd = async (values: Partial<MenuItem>) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error("Failed to add menu item")
      await fetchMenuItems()
      setAddOpen(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  // Edit menu item
  const handleEdit = async (item: MenuItem, values: Partial<MenuItem>) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/menu/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error("Failed to update menu item")
      await fetchMenuItems()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  // Delete menu item
  const handleDelete = async (item: MenuItem) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/menu/${item.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete menu item")
      await fetchMenuItems()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="border-r bg-gray-50 min-h-screen">
        <AdminSidebar />
      </div>
      <main className="flex-1 max-w-2xl mx-auto py-8 px-4">
        <PageHeader title="Menu Management" />
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setAddOpen(true)} disabled={loading}>
            + Add Menu Item
          </Button>
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <MenuItemList
          menuItems={menuItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={loading}
        />
        <div className="mt-4">
          <Button onClick={fetchMenuItems} disabled={loading}>
            Refresh
          </Button>
        </div>
        <EditMenuItemModal
          open={addOpen}
          onOpenChange={setAddOpen}
          menuItem={null}
          onSave={handleAdd}
          isLoading={loading}
        />
      </main>
    </div>
  )
} 
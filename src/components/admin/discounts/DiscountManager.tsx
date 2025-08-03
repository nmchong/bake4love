"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Eye, EyeOff } from "lucide-react"

interface Discount {
  id: string
  code: string
  active: boolean
  type: "percent" | "fixed" | "newcomer"
  percentOff?: number
  amountOffCents?: number
  minSubtotalCents?: number
  expiresAt?: string
  showBanner: boolean
  bannerMessage: string
  createdAt: string
}

interface CreateDiscountForm {
  code: string
  type: "percent" | "fixed" | "newcomer"
  percentOff?: number
  amountOffCents?: number
  minSubtotalCents?: number
  expiresAt?: string
  showBanner: boolean
  bannerMessage: string
}

export default function DiscountManager() {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null)
  const [formData, setFormData] = useState<CreateDiscountForm>({
    code: "",
    type: "fixed",
    amountOffCents: 500,
    showBanner: false,
    bannerMessage: ""
  })

  useEffect(() => {
    fetchDiscounts()
  }, [])

  const fetchDiscounts = async () => {
    try {
      const response = await fetch("/api/admin/discounts")
      const data = await response.json()
      if (data.discounts) {
        setDiscounts(data.discounts)
      }
    } catch (error) {
      console.error("Error fetching discounts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDiscount = async () => {
    try {
      const response = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowCreateForm(false)
        setFormData({
          code: "",
          type: "fixed",
          amountOffCents: 500,
          showBanner: false,
          bannerMessage: ""
        })
        fetchDiscounts()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error creating discount:", error)
      alert("Failed to create discount")
    }
  }

  const handleUpdateDiscount = async (id: string, updates: Partial<Discount>) => {
    try {
      const response = await fetch(`/api/admin/discounts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        setEditingDiscount(null)
        fetchDiscounts()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error updating discount:", error)
      alert("Failed to update discount")
    }
  }

  const formatAmount = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const formatDiscount = (discount: Discount) => {
    if (discount.type === "percent" && discount.percentOff) {
      return `${discount.percentOff}% off`
    } else if (discount.amountOffCents) {
      const amount = formatAmount(discount.amountOffCents)
      if (discount.minSubtotalCents) {
        return `${amount} off when you spend ${formatAmount(discount.minSubtotalCents)}`
      }
      return `${amount} off`
    }
    return "Discount"
  }

  const resetForm = () => {
    setFormData({
      code: "",
      type: "fixed",
      amountOffCents: 500,
      showBanner: false,
      bannerMessage: ""
    })
    setShowCreateForm(false)
    setEditingDiscount(null)
  }

  if (loading) {
    return <div className="text-center py-8">Loading discounts...</div>
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#4A2F1B]">Discount Management</h2>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4" />
          Create Discount
        </Button>
      </div>

      {/* create/edit form */}
      {(showCreateForm || editingDiscount) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingDiscount ? "Edit Discount" : "Create New Discount"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Discount Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D4B494] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A4551E]"
                  placeholder="e.g., SAVE20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as "percent" | "fixed" | "newcomer" })}
                  className="w-full px-3 py-2 border border-[#D4B494] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A4551E]"
                >
                  <option value="percent">Percent Off</option>
                  <option value="fixed">Fixed Amount Off</option>
                  <option value="newcomer">Newcomer Discount</option>
                </select>
              </div>

              {formData.type === "percent" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Percent Off</label>
                  <input
                    type="number"
                    value={formData.percentOff || ""}
                    onChange={(e) => setFormData({ ...formData, percentOff: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#D4B494] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A4551E]"
                    placeholder="20"
                    min="1"
                    max="100"
                  />
                </div>
              )}

              {(formData.type === "fixed" || formData.type === "newcomer") && (
                <div>
                  <label className="block text-sm font-medium mb-2">Amount Off (cents)</label>
                  <input
                    type="number"
                    value={formData.amountOffCents || ""}
                    onChange={(e) => setFormData({ ...formData, amountOffCents: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#D4B494] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A4551E]"
                    placeholder="500"
                    min="1"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Minimum Subtotal (cents)</label>
                <input
                  type="number"
                  value={formData.minSubtotalCents || ""}
                  onChange={(e) => setFormData({ ...formData, minSubtotalCents: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-[#D4B494] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A4551E]"
                  placeholder="3000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Expiry Date</label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt || ""}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D4B494] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A4551E]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showBanner"
                  checked={formData.showBanner}
                  onChange={(e) => setFormData({ ...formData, showBanner: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="showBanner" className="text-sm font-medium">
                  Show as banner on main page
                </label>
              </div>

              {formData.showBanner && (
                <div>
                  <label className="block text-sm font-medium mb-2">Banner Message</label>
                  <input
                    type="text"
                    value={formData.bannerMessage}
                    onChange={(e) => setFormData({ ...formData, bannerMessage: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D4B494] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A4551E]"
                    placeholder="30% off for a limited time! Use discount code SAVE30"
                  />
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button onClick={editingDiscount ? () => handleUpdateDiscount(editingDiscount.id, formData) : handleCreateDiscount}>
                {editingDiscount ? "Update Discount" : "Create Discount"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* discounts list */}
      <div className="grid gap-4">
        {discounts.map((discount) => (
          <Card key={discount.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-lg">{discount.code}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      discount.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {discount.active ? "Active" : "Inactive"}
                    </span>
                    {discount.showBanner && (
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        Banner
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{formatDiscount(discount)}</p>
                  
                  {discount.expiresAt && (
                    <p className="text-xs text-gray-500">
                      Expires: {new Date(discount.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                  
                                     {discount.showBanner && discount.bannerMessage && (
                     <p className="text-sm text-blue-600 mt-2">&ldquo;{discount.bannerMessage}&rdquo;</p>
                   )}
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateDiscount(discount.id, { active: !discount.active })}
                  >
                    {discount.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingDiscount(discount)
                      setFormData({
                        code: discount.code,
                        type: discount.type,
                        percentOff: discount.percentOff,
                        amountOffCents: discount.amountOffCents,
                        minSubtotalCents: discount.minSubtotalCents,
                        expiresAt: discount.expiresAt,
                        showBanner: discount.showBanner,
                        bannerMessage: discount.bannerMessage
                      })
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {discounts.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No discounts created yet. Create your first discount to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 
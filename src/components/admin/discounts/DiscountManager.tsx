"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, Archive } from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

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
    type: "percent",
    percentOff: 20,
    showBanner: false,
    bannerMessage: ""
  })
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [apiError, setApiError] = useState<string>("")
  const [showAmountInput, setShowAmountInput] = useState(true)
  const [showMinSubtotalInput, setShowMinSubtotalInput] = useState(true)
  const [tempAmountInput, setTempAmountInput] = useState("5.00")
  const [tempMinSubtotalInput, setTempMinSubtotalInput] = useState("0.00")
  const [showArchive, setShowArchive] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showArchiveConfirm, setShowArchiveConfirm] = useState<string | null>(null)
  const [showActivateConfirm, setShowActivateConfirm] = useState<string | null>(null)

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

  const validateForm = () => {
    const errors: string[] = []
    
    if (!formData.code.trim()) errors.push("Discount code is required")
    if (!formData.type) errors.push("Discount type is required")
    
    if (formData.type === "percent" && !formData.percentOff) {
      errors.push("Percent off is required for percent type")
    }
    
    if ((formData.type === "fixed" || formData.type === "newcomer") && !formData.amountOffCents) {
      errors.push("Amount off is required for fixed/newcomer type")
    }
    
    if (formData.type === "fixed" && !formData.minSubtotalCents) {
      errors.push("Minimum subtotal is required for fixed amount type")
    }
    
    if (formData.showBanner && !formData.bannerMessage.trim()) {
      errors.push("Banner message is required when showing banner")
    }
    
    return errors
  }

  const handleCreateDiscount = async () => {
    const errors = validateForm()
    setValidationErrors(errors)
    setApiError("")
    if (errors.length > 0) {
      return
    }

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
          type: "percent",
          percentOff: 20,
          showBanner: false,
          bannerMessage: ""
        })
        fetchDiscounts()
      } else {
        const error = await response.json()
        setApiError(error.error || `Failed to create discount: ${error.details || 'Unknown error'}`)
      }
          } catch (error) {
        console.error("Error creating discount:", error)
        setApiError(`Failed to create discount: ${error}`)
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
        setApiError(error.error || "Failed to update discount")
      }
    } catch (error) {
      console.error("Error updating discount:", error)
      setApiError("Failed to update discount")
    }
  }

  const handleDeleteDiscount = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/discounts/${id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        setShowDeleteConfirm(null)
        fetchDiscounts()
      } else {
        const error = await response.json()
        setApiError(error.error || "Failed to delete discount")
      }
    } catch (error) {
      console.error("Error deleting discount:", error)
      setApiError("Failed to delete discount")
    }
  }

  const formatAmount = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }



  const isExpired = (discount: Discount) => {
    if (!discount.expiresAt) return false
    return new Date(discount.expiresAt) < new Date()
  }

  const formatDiscount = (discount: Discount) => {
    let discountText = ""
    if (discount.type === "percent" && discount.percentOff) {
      discountText = `${discount.percentOff}% off`
    } else if (discount.amountOffCents) {
      const amount = formatAmount(discount.amountOffCents)
      if (discount.minSubtotalCents) {
        discountText = `${amount} off when you spend ${formatAmount(discount.minSubtotalCents)}`
      } else {
        discountText = `${amount} off`
      }
    } else {
      discountText = "Discount"
    }
    
    // add for newcomers if it's for new customer discount
    if (discount.type === "newcomer") {
      discountText += " for new customers"
    }
    
    return discountText
  }

  const resetForm = () => {
    setFormData({
      code: "",
      type: "percent",
      percentOff: 20,
      showBanner: false,
      bannerMessage: ""
    })
    setShowAmountInput(true)
    setShowMinSubtotalInput(true)
    setTempAmountInput("5.00")
    setTempMinSubtotalInput("0.00")
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
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowArchive(!showArchive)}
          >
            <Archive className="w-4 h-4 mr-2" />
            {showArchive ? "View Active" : "View Archive"}
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4" />
            Create Discount
          </Button>
        </div>
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
                <label className="block text-sm font-medium mb-2">
                  Discount Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D4B494] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A4551E]"
                  placeholder="e.g., SAVE20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as "percent" | "fixed" | "newcomer" })}
                  className="w-full px-3 py-2 border border-[#D4B494] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A4551E]"
                >
                  <option value="percent">Percent Off (20% off)</option>
                  <option value="fixed">Fixed Amount Off ($5 off when you spend $30)</option>
                  <option value="newcomer">Newcomer Discount ($5 off your first order)</option>
                </select>
              </div>

              {formData.type === "percent" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Percent Off <span className="text-red-500">*</span>
                  </label>
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
                  <label className="block text-sm font-medium mb-2">
                    Amount Off <span className="text-red-500">*</span>
                  </label>
                  {!showAmountInput ? (
                    <div className="flex items-center justify-between p-3 border border-[#D4B494] rounded-md">
                      <span className="text-[#4A2F1B]">
                        {formData.amountOffCents ? `$${(formData.amountOffCents / 100).toFixed(2)}` : "Enter amount"}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowAmountInput(true)
                          setTempAmountInput(formData.amountOffCents ? (formData.amountOffCents / 100).toFixed(2) : "")
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="flex items-center border border-[#D4B494] rounded-md flex-1">
                        <span className="px-3 py-2 text-[#4A2F1B] bg-gray-50 border-r border-[#D4B494]">$</span>
                        <input
                          type="number"
                          placeholder="5.00"
                          value={tempAmountInput}
                          onChange={(e) => setTempAmountInput(e.target.value)}
                          className="w-full px-3 py-2 focus:outline-none"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <Button
                        onClick={() => {
                          const amount = parseFloat(tempAmountInput) * 100
                          if (!isNaN(amount) && amount >= 0) {
                            setFormData({ ...formData, amountOffCents: Math.round(amount) })
                            setShowAmountInput(false)
                          }
                        }}
                      >
                        Ok
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Minimum Subtotal {formData.type === "fixed" && <span className="text-red-500">*</span>}
                </label>
                {!showMinSubtotalInput ? (
                  <div className="flex items-center justify-between p-3 border border-[#D4B494] rounded-md">
                    <span className="text-[#4A2F1B]">
                      {formData.minSubtotalCents ? `$${(formData.minSubtotalCents / 100).toFixed(2)}` : "Enter minimum spend"}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowMinSubtotalInput(true)
                        setTempMinSubtotalInput(formData.minSubtotalCents ? (formData.minSubtotalCents / 100).toFixed(2) : "")
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="flex items-center border border-[#D4B494] rounded-md flex-1">
                      <span className="px-3 py-2 text-[#4A2F1B] bg-gray-50 border-r border-[#D4B494]">$</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={tempMinSubtotalInput}
                        onChange={(e) => setTempMinSubtotalInput(e.target.value)}
                        className="w-full px-3 py-2 focus:outline-none"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <Button
                      onClick={() => {
                        const amount = parseFloat(tempMinSubtotalInput) * 100
                        if (!isNaN(amount) && amount >= 0) {
                          setFormData({ ...formData, minSubtotalCents: Math.round(amount) })
                          setShowMinSubtotalInput(false)
                        }
                      }}
                    >
                      Ok
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Expiry Date (valid through) -- MM/DD/YYYY
                  {editingDiscount && (
                    <span className="text-xs text-gray-500 ml-2">(cannot be changed once set)</span>
                  )}
                </label>
                <DatePicker
                  selected={formData.expiresAt ? new Date(formData.expiresAt) : null}
                  onChange={(date) => {
                    if (!editingDiscount && date instanceof Date && !isNaN(date.getTime())) {
                      const endOfDay = new Date(date)
                      endOfDay.setHours(23, 59, 59, 999)
                      setFormData({ ...formData, expiresAt: endOfDay.toISOString() })
                    }
                  }}
                  onChangeRaw={(e) => {
                    if (e?.target && 'value' in e.target) {
                      const parsed = new Date((e.target as HTMLInputElement).value)
                      if (!editingDiscount && !isNaN(parsed.getTime())) {
                        const endOfDay = new Date(parsed)
                        endOfDay.setHours(23, 59, 59, 999)
                        setFormData({ ...formData, expiresAt: endOfDay.toISOString() })
                      }
                    }
                  }}
                  disabled={!!editingDiscount}
                  minDate={new Date()}
                  maxDate={new Date(2030, 11, 31)}
                  dateFormat="MM/dd/yyyy"
                  placeholderText="Select expiry date"
                  className={`w-full px-3 py-2 border border-[#D4B494] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A4551E] ${
                    editingDiscount ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />

                {editingDiscount && (
                  <p className="text-xs text-gray-500 mt-1">
                    Note: Expiry date cannot be modified once the discount is created.
                  </p>
                )}
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
                  <label className="block text-sm font-medium mb-2">
                    Banner Message <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.bannerMessage}
                    onChange={(e) => setFormData({ ...formData, bannerMessage: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D4B494] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A4551E]"
                    placeholder="example: 30% off for a limited time! Use discount code SAVE30"
                  />
                </div>
              )}
            </div>

            {(validationErrors.length > 0 || apiError) && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {validationErrors.length > 0 && (
                  <>
                    <p className="font-medium mb-1">Please fix the following errors:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </>
                )}
                {apiError && (
                  <p className="font-medium">{apiError}</p>
                )}
              </div>
            )}

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
        {discounts
          .filter(discount => showArchive ? !discount.active : discount.active)
          .map((discount) => (
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
                      {isExpired(discount) && (
                        <span className="text-red-500 ml-1">(Expired)</span>
                      )}
                    </p>
                  )}
                  
                  {discount.showBanner && discount.bannerMessage && (
                    <p className="text-sm text-blue-600 mt-2">&ldquo;{discount.bannerMessage}&rdquo;</p>
                  )}
                </div>

                <div className="flex space-x-2">
                  {!showArchive && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowArchiveConfirm(discount.id)}
                    >
                      <Archive className="w-4 h-4 mr-1" />
                      Archive
                    </Button>
                  )}
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
                      // set the temporary input values for editing
                      setTempAmountInput(discount.amountOffCents ? (discount.amountOffCents / 100).toFixed(2) : "5.00")
                      setTempMinSubtotalInput(discount.minSubtotalCents ? (discount.minSubtotalCents / 100).toFixed(2) : "0.00")
                      setShowAmountInput(false)
                      setShowMinSubtotalInput(false)
                    }}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  {showArchive && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowActivateConfirm(discount.id)}
                        disabled={isExpired(discount)}
                        title={isExpired(discount) ? "Cannot activate expired discounts" : ""}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Activate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(discount.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {discounts.filter(discount => showArchive ? !discount.active : discount.active).length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">
              {showArchive 
                ? "No archived discounts found." 
                : "No active discounts found. Create your first discount to get started!"
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* archive confirmation dialog */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Confirm Archive</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Are you sure you want to archive this discount? Archiving will make this discount inactive and it will no longer be usable.</p>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowArchiveConfirm(null)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    handleUpdateDiscount(showArchiveConfirm, { active: false })
                    setShowArchiveConfirm(null)
                  }}
                >
                  Archive
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* activate confirmation dialog */}
      {showActivateConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Confirm Activate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Are you sure you want to activate this discount? It will make this discount active and usable again.</p>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowActivateConfirm(null)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    handleUpdateDiscount(showActivateConfirm, { active: true })
                    setShowActivateConfirm(null)
                  }}
                >
                  Activate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* del confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Confirm Delete</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Are you sure you want to delete this discount? This action cannot be undone.</p>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleDeleteDiscount(showDeleteConfirm)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 
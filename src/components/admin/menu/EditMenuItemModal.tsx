import * as Dialog from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import type { MenuItem } from "@/types"
import { ConfirmationDialog } from "@/components/admin/shared/ConfirmationDialog"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Trash2, Save } from "lucide-react"

interface EditMenuItemModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menuItem: MenuItem | null
  onSave: (values: Partial<MenuItem>) => void
  isLoading?: boolean
}

function isEqualMenuItem(a: Partial<MenuItem>, b: Partial<MenuItem>, ingredientsTextA: string, ingredientsTextB: string) {
  return (
    (a.name || "") === (b.name || "") &&
    (a.description || "") === (b.description || "") &&
    (a.price ?? "") === (b.price ?? "") &&
    (a.halfPrice ?? "") === (b.halfPrice ?? "") &&
    !!a.hasHalfOrder === !!b.hasHalfOrder &&
    !!a.active === !!b.active &&
    (a.imageUrl || "") === (b.imageUrl || "") &&
    JSON.stringify(a.availableDays || []) === JSON.stringify(b.availableDays || []) &&
    ingredientsTextA === ingredientsTextB
  )
}

export default function EditMenuItemModal({ open, onOpenChange, menuItem, onSave, isLoading }: EditMenuItemModalProps) {
  const [form, setForm] = useState<Partial<MenuItem>>({})
  const [ingredientsText, setIngredientsText] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)
  const initialForm = useRef<Partial<MenuItem>>({})
  const initialIngredientsText = useRef("")
  const [dirty, setDirty] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (menuItem) {
      setForm(menuItem)
      setIngredientsText((menuItem.ingredients || []).join("\n"))
      initialForm.current = menuItem
      initialIngredientsText.current = (menuItem.ingredients || []).join("\n")
    } else {
      setForm({})
      setIngredientsText("")
      initialForm.current = {}
      initialIngredientsText.current = ""
    }
    setDirty(false)
    setImageFile(null)
    setImagePreview(null)
  }, [menuItem, open])

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile)
      setImagePreview(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setImagePreview(null)
    }
  }, [imageFile])

  useEffect(() => {
    setDirty(!isEqualMenuItem(form, initialForm.current, ingredientsText, initialIngredientsText.current))
  }, [form, ingredientsText])

  if (!open) return null

  const handleChange = (field: keyof MenuItem, value: string | number | boolean | string[]) => {
    setForm(f => ({ ...f, [field]: value }))
  }

  const handleIngredientsChange = (value: string) => {
    setIngredientsText(value)
    setForm(f => ({ ...f, ingredients: value.split("\n").map(s => s.trim()).filter(Boolean) }))
  }

  const handleImageUpload = async (file: File) => {
    if (!menuItem?.id) return

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['jpg', 'jpeg', 'png'].includes(ext || '')) {
      alert('Only JPG and PNG files are allowed.')
      return
    }

    setUploading(true)
    try {
      const filePath = `menu-images/${menuItem.id}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filePath, file, { upsert: true, contentType: file.type })
      
      if (uploadError) {
        alert('Failed to upload image: ' + uploadError.message)
        return
      }

      const { data } = supabase.storage.from('menu-images').getPublicUrl(filePath)
      handleChange('imageUrl', data.publicUrl)
    } catch {
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (imageFile) {
      await handleImageUpload(imageFile)
    }
    
    onSave({ 
      ...form, 
      ingredients: ingredientsText.split("\n").map(s => s.trim()).filter(Boolean) 
    })
    setDirty(false)
    setImageFile(null)
    setImagePreview(null)
  }

  const handleCancel = () => {
    if (dirty) {
      setShowConfirm(true)
    } else {
      onOpenChange(false)
    }
  }

  const handleConfirmCancel = () => {
    setShowConfirm(false)
    setDirty(false)
    onOpenChange(false)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    handleChange('imageUrl', '')
  }

  return (
    <>
      <Dialog.Dialog open={open} onOpenChange={onOpenChange}>
        <Dialog.DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle className="text-2xl font-bold text-[#4A2F1B]">
              {menuItem ? "Edit Menu Item" : "Add Menu Item"}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-[#4A2F1B] mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6B4C32] mb-2">Name *</label>
                    <input 
                      className="w-full border border-[#E5DED6] rounded-lg p-3 focus:outline-none focus:border-[#A4551E]"
                      value={form.name || ''} 
                      onChange={e => handleChange('name', e.target.value)} 
                      placeholder="Item name" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6B4C32] mb-2">Description</label>
                    <textarea 
                      className="w-full border border-[#E5DED6] rounded-lg p-3 focus:outline-none focus:border-[#A4551E]"
                      value={form.description || ''} 
                      onChange={e => handleChange('description', e.target.value)} 
                      placeholder="Item description"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-[#4A2F1B] mb-4">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6B4C32] mb-2">Full Price (cents) *</label>
                    <input 
                      className="w-full border border-[#E5DED6] rounded-lg p-3 focus:outline-none focus:border-[#A4551E]"
                      type="number" 
                      value={form.price ?? ''} 
                      onChange={e => handleChange('price', Number(e.target.value))} 
                      placeholder="1000" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6B4C32] mb-2">Half Price (cents)</label>
                    <input 
                      className="w-full border border-[#E5DED6] rounded-lg p-3 focus:outline-none focus:border-[#A4551E]"
                      type="number" 
                      value={form.halfPrice ?? ''} 
                      onChange={e => handleChange('halfPrice', Number(e.target.value))} 
                      placeholder="500" 
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm font-medium text-[#6B4C32]">
                      <input 
                        type="checkbox" 
                        checked={!!form.hasHalfOrder} 
                        onChange={e => handleChange('hasHalfOrder', e.target.checked)} 
                        className="rounded border-[#E5DED6]"
                      /> 
                      Half Order Available
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Image Upload */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-[#4A2F1B] mb-4">Image</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2 bg-[#A4551E] text-white rounded-lg cursor-pointer hover:bg-[#843C12] transition-colors">
                      <Upload className="w-4 h-4" />
                      {uploading ? 'Uploading...' : 'Upload Image'}
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={e => {
                          const file = e.target.files?.[0] || null
                          setImageFile(file)
                        }}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    {(imagePreview || form.imageUrl) && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={removeImage}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    {imagePreview ? (
                      <div className="relative">
                        <Image 
                          src={imagePreview} 
                          alt="Preview" 
                          width={300} 
                          height={180} 
                          className="object-cover rounded-lg border border-[#E5DED6]" 
                          unoptimized 
                        />
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                          New
                        </div>
                      </div>
                    ) : form.imageUrl ? (
                      <div className="relative">
                        <Image 
                          src={form.imageUrl} 
                          alt="Current" 
                          width={300} 
                          height={180} 
                          className="object-cover rounded-lg border border-[#E5DED6]" 
                          unoptimized={form.imageUrl.startsWith('blob:') || form.imageUrl.startsWith('data:')} 
                        />
                        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                          Current
                        </div>
                      </div>
                    ) : (
                      <div className="w-[300px] h-[180px] flex flex-col items-center justify-center bg-gray-100 border border-[#E5DED6] rounded-lg text-gray-400">
                        <Upload className="w-8 h-8 mb-2" />
                        <span className="text-sm">No image selected</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ingredients */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-[#4A2F1B] mb-4">Ingredients</h3>
                <textarea 
                  className="w-full border border-[#E5DED6] rounded-lg p-3 focus:outline-none focus:border-[#A4551E]"
                  value={ingredientsText} 
                  onChange={e => handleIngredientsChange(e.target.value)} 
                  placeholder="Enter ingredients, one per line"
                  rows={4}
                />
                <p className="text-sm text-[#6B4C32] mt-2">
                  Enter each ingredient on a separate line
                </p>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-[#4A2F1B] mb-4">Availability</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={!!form.active} 
                      onChange={e => handleChange('active', e.target.checked)} 
                      className="rounded border-[#E5DED6]"
                    />
                    <label className="text-sm font-medium text-[#6B4C32]">Active (visible to customers)</label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#6B4C32] mb-3">Available Days</label>
                    <div className="grid grid-cols-7 gap-2">
                      {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(day => (
                        <label key={day} className="flex flex-col items-center gap-1 p-2 border border-[#E5DED6] rounded-lg cursor-pointer hover:bg-[#F3E9D7] transition-colors">
                          <input 
                            type="checkbox" 
                            checked={form.availableDays?.includes(day) || false} 
                            onChange={e => {
                              const days = new Set(form.availableDays || [])
                              if (e.target.checked) {
                                days.add(day)
                              } else {
                                days.delete(day)
                              }
                              handleChange('availableDays', Array.from(days))
                            }} 
                            className="rounded border-[#E5DED6]"
                          />
                          <span className="text-xs text-[#6B4C32] font-medium">{day.slice(0,3)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#E5DED6]">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                className="px-6"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || uploading}
                className="px-6 bg-[#A4551E] hover:bg-[#843C12]"
              >
                {isLoading || uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {uploading ? 'Uploading...' : (menuItem ? 'Saving...' : 'Adding...')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {menuItem ? 'Save Changes' : 'Add Item'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Dialog.DialogContent>
      </Dialog.Dialog>
      
      <ConfirmationDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Discard changes?"
        message="You have unsaved changes. Are you sure you want to cancel?"
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowConfirm(false)}
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
      />
    </>
  )
} 
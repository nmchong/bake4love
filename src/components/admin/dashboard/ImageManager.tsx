import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, Save } from "lucide-react"
import Image from "next/image"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface ImageManagerProps {
  type: "banner" | "profile"
  currentImageUrl?: string
  onSave: (imageUrl: string) => void
}


export default function ImageManager({ type, currentImageUrl, onSave }: ImageManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const supabase = createClientComponentClient()

  const isBanner = type === "banner"

  
  // handle file select
  const handleFileSelect = (file: File) => {
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      alert('Please select a JPG or PNG image')
      return
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('Image size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setImagePreview(url)
  }


  // upload image to supabase
  const uploadImage = async () => {
    if (!selectedFile) return
    
    setUploading(true)
    try {
      const ext = selectedFile.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${type}-${Date.now()}.${ext}`
      const filePath = `${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('brand-images')
        .upload(filePath, selectedFile, { upsert: true, contentType: selectedFile.type })
      
      if (uploadError) {
        throw new Error(uploadError.message)
      }

      const { data } = supabase.storage.from('brand-images').getPublicUrl(filePath)
      
      // del old image if it exists
      if (currentImageUrl && currentImageUrl.includes('brand-images')) {
        const oldPath = currentImageUrl.split('/').pop()
        if (oldPath) {
          await supabase.storage.from('brand-images').remove([oldPath])
        }
      }
      
      onSave(data.publicUrl)
      setIsOpen(false)
      resetState()
    } catch (error) {
      alert('Failed to upload image: ' + error)
    } finally {
      setUploading(false)
    }
  }

  const resetState = () => {
    setSelectedFile(null)
    setImagePreview(null)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
  }

  const handleCancel = () => {
    resetState()
    setIsOpen(false)
  }



  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="w-full"
      >
        <Upload className="w-4 h-4 mr-2" />
        Edit {type === "banner" ? "Banner" : "Chef"} Image
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#4A2F1B]">
              Edit {type === "banner" ? "Banner" : "Chef"} Image
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* file upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#4A2F1B]">
                  Upload New Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 bg-[#A4551E] text-white rounded-lg cursor-pointer hover:bg-[#843C12] transition-colors">
                    <Upload className="w-4 h-4" />
                    Choose Image
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={e => {
                        const file = e.target.files?.[0] || null
                        if (file) handleFileSelect(file)
                      }}
                      className="hidden"
                    />
                  </label>
                  {selectedFile && (
                    <span className="text-sm text-[#6B4C32]">
                      {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)}MB)
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B4C32] mt-2">
                  JPG or PNG, max 5MB. {isBanner ? "Recommended: 1200x360px or wider" : "Recommended: 400x400px or larger"}
                </p>
              </CardContent>
            </Card>

            {/* image preview */}
            {imagePreview && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-[#4A2F1B]">
                    Preview
                  </CardTitle>
                  <p className="text-sm text-[#6B4C32]">
                    {isBanner 
                      ? "This is how your banner will appear on the customer page."
                      : "This is how your profile picture will appear on the customer page."
                    }
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-6">
                    {/* uploaded image */}
                    <div className="flex-shrink-0 text-center">
                      <h4 className="font-semibold text-[#4A2F1B] mb-3">Uploaded Image:</h4>
                      <div className="bg-gray-100 rounded-lg overflow-hidden mx-auto">
                        <Image
                          src={imagePreview}
                          alt="Uploaded Image"
                          width={isBanner ? 400 : 200}
                          height={isBanner ? 120 : 200}
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    </div>

                    {/* final preview */}
                    <div className="flex-shrink-0 text-center">
                      <h4 className="font-semibold text-[#4A2F1B] mb-3">Customer Page Preview:</h4>
                      <div 
                        className={`bg-gray-100 overflow-hidden mx-auto ${
                          isBanner ? 'w-96 h-28 rounded-lg' : 'w-40 h-40 rounded-full'
                        }`}
                      >
                        <Image
                          src={imagePreview}
                          alt="Customer Preview"
                          width={isBanner ? 384 : 160}
                          height={isBanner ? 112 : 160}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* current image */}
            {currentImageUrl && !imagePreview && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-[#4A2F1B]">
                    Current Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`bg-gray-100 rounded-lg overflow-hidden ${
                    isBanner ? 'w-full h-28' : 'w-40 h-40 rounded-full'
                  }`}>
                    <Image
                      src={currentImageUrl}
                      alt="Current"
                      width={isBanner ? 384 : 160}
                      height={isBanner ? 112 : 160}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#E5DED6]">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                className="px-6"
              >
                Cancel
              </Button>
              <Button 
                onClick={uploadImage}
                disabled={!selectedFile || uploading}
                className="px-6 bg-[#A4551E] hover:bg-[#843C12]"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Image
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 
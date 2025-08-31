import { useState, useEffect } from "react"

interface Banner {
  id: string
  bannerMessage: string
  code: string
}

interface DiscountBannerProps {
  className?: string
  size?: "large" | "small"
}

export default function DiscountBanner({ className = "", size = "large" }: DiscountBannerProps) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBanners = async (retryCount = 0) => {
      try {
        const response = await fetch("/api/discount-banners")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        if (data.banners) {
          setBanners(data.banners)
        }
      } catch (error) {
        console.error("Error fetching discount banners:", error)
        
        // retry up to 2 times with exponential backoff
        if (retryCount < 2) {
          const delay = Math.pow(2, retryCount) * 1000 // 1s, 2s
          console.log(`Retrying discount banners in ${delay}ms... (attempt ${retryCount + 1})`)
          setTimeout(() => fetchBanners(retryCount + 1), delay)
        } else {
          console.error('Max retries reached for discount banners')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()
  }, [])

  if (loading || banners.length === 0) {
    return null
  }

  return (
    <div className={`${className}`}>
      {banners.map((banner) => (
        <div
          key={banner.id}
          className={`bg-[#E2C7A0] text-[#4A2F1B] rounded-lg shadow-md border border-[#D4B494] ${
            size === "large" 
              ? "p-4 mb-4 text-center" 
              : "p-2 mb-2 text-sm"
          }`}
        >
          <p className={`font-medium ${size === "large" ? "text-lg" : "text-sm"}`}>
            {banner.bannerMessage}
          </p>
        </div>
      ))}
    </div>
  )
} 
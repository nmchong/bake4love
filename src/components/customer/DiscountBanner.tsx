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
    const fetchBanners = async () => {
      try {
        const response = await fetch("/api/discount-banners")
        const data = await response.json()
        if (data.banners) {
          setBanners(data.banners)
        }
      } catch (error) {
        console.error("Error fetching discount banners:", error)
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
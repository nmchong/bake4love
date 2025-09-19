"use client"

import { useState, useEffect } from "react"
import AdminSidebar from "@/components/admin/shared/AdminSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShoppingCart, Calendar, UtensilsCrossed, Tag } from "lucide-react"
import EarningsOverview from "@/components/admin/dashboard/EarningsOverview"
import UpcomingPickupDates from "@/components/admin/dashboard/UpcomingPickupDates"
import ImageManager from "@/components/admin/dashboard/ImageManager"

export default function AdminDashboardPage() {
  const [brandImages, setBrandImages] = useState({
    bannerImageUrl: "",
    profileImageUrl: ""
  })


  useEffect(() => {
    // fetch current brand images
    fetch('/api/admin/brand-images')
      .then(res => res.json())
      .then(data => {
        console.log('Admin brand images API response:', data)
        setBrandImages({
          bannerImageUrl: data.bannerImageUrl || "",
          profileImageUrl: data.profileImageUrl || ""
        })
      })
      .catch(error => console.error('Failed to fetch brand images:', error))
  }, [])

  const updateBrandImage = async (type: 'banner' | 'profile', url: string) => {
    try {
      const response = await fetch('/api/admin/brand-images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [type === 'banner' ? 'bannerImageUrl' : 'profileImageUrl']: url,
          updateType: type
        })
      })
      
      if (response.ok) {
        setBrandImages(prev => ({
          ...prev,
          [type === 'banner' ? 'bannerImageUrl' : 'profileImageUrl']: url
        }))
      }
    } catch (error) {
      console.error('Failed to update brand image:', error)
    }
  }


  return (
    <div className="flex min-h-screen bg-[#F3E9D7]">
      <AdminSidebar />
      <main className="flex-1 py-8 px-6 bg-[#F3E9D7]">
        <h1 className="text-2xl font-bold mb-6 text-[#4A2F1B]">Admin Dashboard</h1>
        
        {/* quick nav cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Manage</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Availability</div>
              <p className="text-xs text-muted-foreground">
                Set your available dates and times
              </p>
            </CardContent>
            <div className="px-6 pb-4">
              <Link href="/admin/manage">
                <Button variant="outline" size="sm" className="w-full">
                  Manage Schedule
                </Button>
              </Link>
            </div>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">View Orders</div>
              <p className="text-xs text-muted-foreground">
                Track and fulfill customer orders
              </p>
            </CardContent>
            <div className="px-6 pb-4">
              <Link href="/admin/orders">
                <Button variant="outline" size="sm" className="w-full">
                  View Orders
                </Button>
              </Link>
            </div>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menu</CardTitle>
              <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Menu Items</div>
              <p className="text-xs text-muted-foreground">
                Manage your menu offerings
              </p>
            </CardContent>
            <div className="px-6 pb-4">
              <Link href="/admin/menu">
                <Button variant="outline" size="sm" className="w-full">
                  Manage Menu
                </Button>
              </Link>
            </div>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Discounts</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Promotions</div>
              <p className="text-xs text-muted-foreground">
                Create and manage discount codes
              </p>
            </CardContent>
            <div className="px-6 pb-4">
              <Link href="/admin/discounts">
                <Button variant="outline" size="sm" className="w-full">
                  Manage Discounts
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* image management (banner and profile) */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 text-[#4A2F1B]">Brand Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageManager 
              type="banner" 
              currentImageUrl={brandImages.bannerImageUrl}
              onSave={(url) => updateBrandImage('banner', url)}
            />
            <ImageManager 
              type="profile" 
              currentImageUrl={brandImages.profileImageUrl}
              onSave={(url) => updateBrandImage('profile', url)}
            />
          </div>
        </div>

        {/* overview Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <EarningsOverview />
          <UpcomingPickupDates />
        </div>

      </main>
    </div>
  );
}

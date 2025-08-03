import AdminSidebar from "@/components/admin/shared/AdminSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShoppingCart, Calendar, UtensilsCrossed, Tag } from "lucide-react"

export default function AdminDashboardPage() {
  return (
    <div className="flex min-h-screen bg-[#F3E9D7]">
      <AdminSidebar />
      <main className="flex-1 py-8 px-6 bg-[#F3E9D7]">
        <h1 className="text-2xl font-bold mb-6 text-[#4A2F1B]">Admin Dashboard</h1>
        
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
      </main>
    </div>
  );
}

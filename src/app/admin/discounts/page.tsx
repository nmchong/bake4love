import DiscountManager from "@/components/admin/discounts/DiscountManager"
import AdminSidebar from "@/components/admin/shared/AdminSidebar"

export default function AdminDiscountsPage() {
  return (
    <div className="flex min-h-screen bg-[#F3E9D7]">
      <AdminSidebar />
      <main className="flex-1 py-8 px-6 bg-[#F3E9D7]">
        <DiscountManager />
      </main>
    </div>
  );
} 
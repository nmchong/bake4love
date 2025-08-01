import AdminSidebar from "@/components/admin/shared/AdminSidebar"

export default function AdminDashboardPage() {
  return (
    <div className="flex min-h-screen bg-[#F3E9D7]">
      <AdminSidebar />
      <main className="flex-1 py-8 px-6 bg-[#F3E9D7]">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      </main>
    </div>
  );
}

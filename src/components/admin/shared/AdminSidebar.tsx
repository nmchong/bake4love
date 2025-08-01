"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

const navLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/manage", label: "Manage" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/menu", label: "Menu" },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <aside className="w-56 min-h-screen bg-gray-100 border-r px-4 py-8 flex flex-col gap-2">
      <h2 className="text-lg font-bold mb-6">Admin</h2>

      {/* nav buttons */}
      <nav className="flex flex-col gap-2">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-2 rounded transition-colors font-medium ${pathname.startsWith(link.href) ? "bg-black text-white" : "hover:bg-gray-200 text-gray-800"}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* log out */}
      <div className="mt-auto pt-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 rounded transition-colors font-medium text-red-600 hover:bg-red-50 cursor-pointer"
        >
          Log Out
        </button>
      </div>
    </aside>
  )
} 
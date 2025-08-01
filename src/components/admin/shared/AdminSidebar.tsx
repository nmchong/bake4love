"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ExternalLink } from "lucide-react"

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
    <aside className="w-56 min-h-screen bg-[#F3E9D7] border-r border-[#E5DED6] px-4 py-8 flex flex-col gap-2">
      <h2 className="text-2xl font-bold mb-8 text-[#4A2F1B]">Admin</h2>

      {/* nav buttons */}
      <nav className="flex flex-col gap-3">
        {navLinks.map(link => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-3 rounded-lg transition-colors font-medium no-underline border ${
                isActive 
                  ? "bg-[#A4551E] text-[#FFFDF5] border-[#A4551E]" 
                  : "text-[#4A2F1B] hover:bg-[#FAE6C8] border-[#E5DED6]"
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* customer menu button */}
      <div className="mt-8 pt-4 border-t border-[#E5DED6]">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors font-medium text-[#4A2F1B] hover:bg-[#FAE6C8] cursor-pointer no-underline border border-[#E5DED6]"
        >
          <span>Customer Menu</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* log out */}
      <div className="mt-auto pt-4 border-t border-[#E5DED6]">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 rounded-lg transition-colors font-medium text-red-600 hover:bg-red-100 cursor-pointer border border-red-200"
        >
          Log Out
        </button>
      </div>
    </aside>
  )
} 
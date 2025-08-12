"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ExternalLink } from "lucide-react"

const navLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/manage", label: "Manage" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/discounts", label: "Discounts" },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    try {
      console.log("Logging out...");
  
      await supabase.auth.getSession();
      const { error } = await supabase.auth.signOut({ scope: 'global' });
  
      if (error) {
        console.error("Logout error:", error.message);
        if (error.message.includes("Auth session missing")) {
          console.warn("No active Supabase session found, clearing browser auth state...");
        }
      }
  
      // clear any leftover localStorage tokens & cookies
      Object.keys(localStorage).forEach(key => {
        if (key.includes('sb-') && key.includes('-auth-token')) {
          localStorage.removeItem(key);
        }
      });
  
      document.cookie.split(";").forEach(cookie => {
        const name = cookie.split("=")[0].trim();
        if (name.startsWith("sb-")) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
        }
      });
  
      // redirect to login
      console.log("Logout successful (or forced), redirecting...");
      window.location.href = "/login";
  
    } catch (err) {
      console.error("Logout exception:", err);
      alert("Failed to log out: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  return (
    <aside className="w-56 min-h-screen bg-[#E2C7A0] border-r border-[#D4B494] px-4 py-8 flex flex-col">
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
                  : "text-[#4A2F1B] hover:bg-[#FAE6C8] border-[#D4B494]"
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* customer menu button */}
      <div className="mt-8 pt-4 border-t border-[#D4B494]">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors font-medium text-[#4A2F1B] hover:bg-[#FAE6C8] cursor-pointer no-underline border border-[#D4B494]"
        >
          <span>Customer Menu</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* log out */}
      <div className="mt-24 pt-4 border-t border-[#D4B494]">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 rounded-lg transition-colors font-medium text-red-700 hover:bg-red-200 cursor-pointer border border-red-300"
        >
          Log Out
        </button>
      </div>
    </aside>
  )
} 
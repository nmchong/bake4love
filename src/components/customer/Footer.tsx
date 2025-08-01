import React from "react";
import Image from "next/image";


export default function Footer() {
  return (
    <footer className="w-full bg-[#E2C7A0] text-[#4A2F1B] py-6 border-t border-[#D4B494] flex flex-col items-center">
      <Image src="/globe.svg" alt="Logo" height={32} width={32} className="h-8 mb-2" />
      <div className="text-sm">&copy; {new Date().getFullYear()} Bake4Love. All rights reserved.</div>
    </footer>
  );
} 
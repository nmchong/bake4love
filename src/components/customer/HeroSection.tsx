"use client"

export default function HeroSection() {
  return (
    <section className="w-full py-12 text-center bg-[#F3E9D7] border-b border-[#E5DED6] shadow-[0_4px_12px_-8px_#FAF7ED]">
      {/* banner image placeholder */}
      <div className="w-full h-48 md:h-48 bg-[#FAF7ED] flex items-center justify-center mb-6">
        <span className="text-[#6B4C32] text-xl">[ Banner Image Placeholder ]</span>
      </div>

      {/* text */}
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#4A2F1B]">
          Bake4Love
        </h1>
        <p className="text-lg md:text-xl text-[#6B4C32] mb-4">
          Freshly baked goods, made with love and picked up just for you.
        </p>
        <p className="text-base md:text-lg text-[#4A2F1B] mb-2">
          From classic sourdough loaves to decadent pastries, every item is crafted with the finest ingredients and a passion for baking. Whether you&apos;re planning a special occasion or just want to treat yourself, our menu has something for everyone.
        </p>
      </div>
    </section>
  );
}

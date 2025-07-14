"use client"

export default function HeroSection() {
  return (
    <section className="w-full py-12 text-center bg-yellow-50">
      {/* Banner image placeholder */}
      <div className="w-full h-48 md:h-48 bg-gray-300 flex items-center justify-center mb-6">
        <span className="text-gray-500 text-xl">[ Banner Image Placeholder ]</span>
      </div>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Joan&#39;s Bakery
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-4">
          Freshly baked goods, made with love and picked up just for you.
        </p>
        <p className="text-base md:text-lg text-gray-600 mb-2">
          From classic sourdough loaves to decadent pastries, every item is crafted with the finest ingredients and a passion for baking. Whether you&#39;re planning a special occasion or just want to treat yourself, our menu has something for everyone.
        </p>
      </div>
    </section>
  );
}

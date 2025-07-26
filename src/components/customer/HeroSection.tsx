"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, Mail, MapPin, HelpCircle } from "lucide-react"

export default function HeroSection() {
  const [howToOrderOpen, setHowToOrderOpen] = useState(false)
  const [locationOpen, setLocationOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const locationRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)

  // close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setHowToOrderOpen(false)
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setLocationOpen(false)
      }
      if (contactRef.current && !contactRef.current.contains(event.target as Node)) {
        setContactOpen(false)
      }
    }

    if (howToOrderOpen || locationOpen || contactOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [howToOrderOpen, locationOpen, contactOpen])

  return (
    <section className="w-full py-12 bg-[#F3E9D7] border-b border-[#E5DED6] shadow-[0_4px_12px_-8px_#FAF7ED]">
      {/* banner image */}
      <div className="w-full h-48 md:h-48 bg-[#FAF7ED] flex items-center justify-center mb-6">
        <span className="text-[#6B4C32] text-xl">[ Banner Image Placeholder ]</span>
      </div>
      
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
          
          {/* chef image */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#FAF7ED] border-4 border-[#E5DED6] flex items-center justify-center shadow-lg">
              <span className="text-[#6B4C32] text-sm md:text-base text-center px-2">
                Chef Image Placeholder
              </span>
            </div>
          </div>

          {/* text */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#4A2F1B]">
              Bake4Love
            </h1>
            <p className="text-base md:text-lg text-[#4A2F1B] max-w-2xl">
              From classic sourdough loaves to decadent pastries, every item is crafted with the finest ingredients and a passion for baking. Whether you&apos;re planning a special occasion or just want to treat yourself, our menu has something for everyone.
            </p>
          </div>

          {/* right buttons */}
          <div className="flex flex-col gap-3 w-full md:w-60">
            
            {/* contact */}
            <div className="relative" ref={contactRef}>
              <Button 
                variant="outline" 
                className="w-full h-12 flex items-center justify-start"
                onClick={() => setContactOpen(!contactOpen)}
              >
                <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
                <span className="text-left font-bold">Contact</span>
                <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${contactOpen ? 'rotate-180' : ''}`} />
              </Button>
              
              {contactOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#FAF7ED] border border-[#E5DED6] rounded-lg shadow-lg p-4 z-10">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-[#4A2F1B]">Contact Information</h4>
                    <p className="text-sm text-[#6B4C32]">
                      Contact the baker directly or report a website error:
                    </p>
                    <p className="text-sm font-semibold text-[#A4551E]">EMAIL@gmail.com</p>
                  </div>
                </div>
              )}
            </div>

            {/* location */}
            <div className="relative" ref={locationRef}>
              <Button 
                variant="outline" 
                className="w-full h-12 flex items-center justify-start"
                onClick={() => setLocationOpen(!locationOpen)}
              >
                <MapPin className="w-4 h-4 mr-3 flex-shrink-0" />
                <span className="text-left font-bold">Mountain View, CA</span>
                <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${locationOpen ? 'rotate-180' : ''}`} />
              </Button>
              
              {locationOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#FAF7ED] border border-[#E5DED6] rounded-lg shadow-lg p-4 z-10">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-[#4A2F1B]">Pickup Location</h4>
                    <p className="text-sm text-[#6B4C32]">
                      Exact pickup address will be provided after ordering to prevent spam and protect baker privacy. Send an email for the address without ordering.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* how to order */}
            <div className="relative" ref={dropdownRef}>
              <Button 
                variant="outline" 
                className="w-full h-12 flex items-center justify-start"
                onClick={() => setHowToOrderOpen(!howToOrderOpen)}
              >
                <HelpCircle className="w-4 h-4 mr-3 flex-shrink-0" />
                <span className="text-left font-bold">How do I order?</span>
                <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${howToOrderOpen ? 'rotate-180' : ''}`} />
              </Button>
              
              {howToOrderOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#FAF7ED] border border-[#E5DED6] rounded-lg shadow-lg p-4 z-10">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#A4551E] text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                      <p className="text-sm text-[#4A2F1B]">Select a pickup date and timeslot.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#A4551E] text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                      <p className="text-sm text-[#4A2F1B]">Add items to cart and check out.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#A4551E] text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                      <p className="text-sm text-[#4A2F1B]">Come to the pickup address (provided after payment) at your specified date/time.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

"use client"

import { useState } from "react"

interface TipsSectionProps {
  tipCents: number
  onTipChange: (tipCents: number) => void
}

export default function TipsSection({ tipCents, onTipChange }: TipsSectionProps) {
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customAmount, setCustomAmount] = useState("")

  const tipOptions = [
    { label: "$2", value: 200 },
    { label: "$5", value: 500 },
    { label: "$8", value: 800 },
  ]

  const handleTipChange = (value: number) => {
    if (value === 0) {
      // "custom" button clicked
      setShowCustomInput(true)
      setCustomAmount("")
      onTipChange(0)
    } else {
      setShowCustomInput(false)
      onTipChange(value)
    }
  }

  const handleCustomSubmit = () => {
    const amount = parseFloat(customAmount) * 100
    if (!isNaN(amount) && amount >= 0) {
      onTipChange(amount)
      setShowCustomInput(false)
    }
  }



  const isCustomSelected = tipCents > 0 && ![200, 500, 800].includes(tipCents)

  return (
    <div className="bg-[#FAF7ED] p-4 rounded-lg border border-[#E5DED6]">
      <h3 className="font-semibold text-[#4A2F1B] mb-3">Add a Tip (Optional)</h3>
      <div className="flex gap-2">
        {tipOptions.map((tip) => (
          <button
            key={tip.label}
            onClick={() => handleTipChange(tip.value)}
            className={`flex-1 py-2 rounded border ${
              tipCents === tip.value 
                ? 'bg-[#A4551E] text-white border-[#A4551E]' 
                : 'bg-white text-[#4A2F1B] border-[#E5DED6] hover:border-[#A4551E]'
            }`}
          >
            {tip.label}
          </button>
        ))}
        <button
          onClick={() => handleTipChange(0)}
          className={`flex-1 px-4 py-2 rounded border ${
            isCustomSelected
              ? 'bg-[#A4551E] text-white border-[#A4551E]' 
              : 'bg-white text-[#4A2F1B] border-[#E5DED6] hover:border-[#A4551E]'
          }`}
        >
          Custom
        </button>
      </div>

      <p className="text-sm text-[#6B4C32] mt-2">
        Tip: ${(tipCents / 100).toFixed(2)}
      </p>
      
      {showCustomInput && (
        <div className="mt-3 flex gap-2 justify-end">
          <div className="flex items-center border border-[#E5DED6] rounded">
            <span className="px-3 py-2 text-[#4A2F1B] bg-gray-50 border-r border-[#E5DED6]">$</span>
            <input
              type="number"
              placeholder="0.00"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              onBlur={(e) => {
                const value = e.target.value
                if (value && value !== "0") {
                  const num = parseFloat(value)
                  if (!isNaN(num)) {
                    setCustomAmount(num.toFixed(2))
                  }
                }
              }}
              className="w-24 px-3 py-2 focus:outline-none focus:border-[#A4551E]"
              min="0"
              step="0.25"
            />
          </div>
          <button
            onClick={handleCustomSubmit}
            className="px-4 py-2 bg-[#A4551E] text-white rounded hover:bg-[#843C12]"
          >
            Ok
          </button>
        </div>
      )}
      
    </div>
  )
}
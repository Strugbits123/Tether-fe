

"use client"

import React, { useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface Step1Props {
  onNext: (selections: string[]) => void
}

const options = [
  {
    id: "family-prepared",
    label: "Make sure my family is prepared when I am not here",
    image: "/onboarding/step1/select1.svg",
  },
  {
    id: "leave-messages",
    label: "Leave messages for the people who matter the most",
    image: "/onboarding/step1/select2.svg",
  },
  {
    id: "documents-organized",
    label: "Get all my important documents organized in one place",
    image: "/onboarding/step1/select3.svg",
  },
  {
    id: "tell-story",
    label: "Tell my story and share with others",
    image: "/onboarding/step1/select4.svg",
  },
  {
    id: "right-person",
    label: "Make sure the right person can carry out my wants and needs",
    image: "/onboarding/step1/select5.svg",
  },
]

export default function Step1({ onNext }: Step1Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])

  const toggleOption = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    )
  }

  const handleContinue = () => {
    if (selected.length === 0) return
    onNext(selected)
  }

  return (
    <div
      className="w-full flex flex-col items-center px-4 py-8 font-sans"
      style={{
        background: 'linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 50%, #F0FDF4 100%)',
      }}
    >
      <div className="w-full max-w-[768px]">
        {/* Back Button */}
        <button
          onClick={() => router.push("/register")}
          className="flex items-center gap-1 text-[#4F46E5] text-sm font-medium underline mb-6 sm:mb-8 cursor-pointer hover:text-[#4338CA] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Title Section */}
        <div className="text-center mb-6 sm:mb-8 px-1">
          <h1
            className="text-[#111827] mb-3 font-normal leading-tight
              text-[32px] 
              xs:text-[36px]
              sm:text-[42px] 
              md:text-[46px]"
            style={{
              fontFamily: "Instrument Serif, serif",
            }}
          >
            What brings you to Tether?
          </h1>

          <p
            className="text-[#4A5565]
              text-[15px]
              sm:text-[18px]
              leading-6 sm:leading-7"
            style={{
              fontFamily: "Inter, sans-serif",
            }}
          >
            Select all that apply
          </p>
        </div>

        {/* Selection Cards */}
        <div className="space-y-3 mb-8">
          {options.map((option) => {
            const isSelected = selected.includes(option.id)

            return (
              <button
                key={option.id}
                onClick={() => toggleOption(option.id)}
                className="w-full flex items-center gap-3 sm:gap-4 
                  px-3 sm:px-6 
                  py-3 sm:py-4 
                  bg-white border border-[#E5E7EB] 
                  rounded-[14px] transition-all cursor-pointer 
                  hover:border-[#C7D2FE] hover:shadow-sm"
              >
                {/* Image */}
                <div
                  className="flex-shrink-0 flex items-center justify-center rounded-full overflow-hidden
                    w-[42px] h-[42px]
                    sm:w-[47px] sm:h-[47px]"
                  style={{
                    background: isSelected ? "#EEF2FF" : "#F5F3FF",
                  }}
                >
                  <img
                    src={option.image}
                    alt=""
                    className="w-6 h-6 sm:w-[27px] sm:h-[27px] object-contain"
                  />
                </div>

                {/* Label */}
                <span
                  className="flex-1 text-left text-[#101828]
                    text-[14px]
                    leading-5
                    sm:text-[18px]
                    sm:leading-7
                    font-semibold"
                  style={{
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {option.label}
                </span>

                {/* Radio Circle */}
                <div
                  className="flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all
                    w-5 h-5 sm:w-[22px] sm:h-[22px]"
                  style={{
                    borderColor: isSelected ? "#4F46E5" : "#D1D5DB",
                    background: isSelected ? "#4F46E5" : "transparent",
                  }}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Continue Button */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleContinue}
            disabled={selected.length === 0}
            className="flex items-center justify-center gap-2 text-white font-medium rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
              w-full max-w-[165px] h-[50px]"
            style={{
              background: selected.length > 0 ? "#4F46E5" : "#9CA3AF",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Helper Text */}
          <p
            className="text-center text-[13px] sm:text-[14px] leading-5 text-[#6A7282]"
            style={{
              fontFamily: "Inter, sans-serif",
            }}
          >
            Please select an option
          </p>
        </div>
      </div>
    </div>
  )
}
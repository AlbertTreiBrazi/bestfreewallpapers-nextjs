'use client'

import { ReactNode } from 'react'

export default function PhoneMockup({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-center" onContextMenu={(e) => e.preventDefault()}>
      <div className="relative w-full max-w-[270px] md:max-w-[300px]">
        <div className="relative bg-gray-900 rounded-[3rem] p-[10px] pb-[20px] pt-[10px] shadow-[0_30px_80px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.07)]">
          {/* Silent switch */}
          <div className="absolute -left-[3px] top-[14%] w-[3px] h-5 bg-gray-700 rounded-l-sm" />
          {/* Volume up */}
          <div className="absolute -left-[3px] top-[21%] w-[3px] h-8 bg-gray-700 rounded-l-sm" />
          {/* Volume down */}
          <div className="absolute -left-[3px] top-[31%] w-[3px] h-8 bg-gray-700 rounded-l-sm" />
          {/* Power */}
          <div className="absolute -right-[3px] top-[24%] w-[3px] h-11 bg-gray-700 rounded-r-sm" />

          {/* Screen */}
          <div className="relative aspect-[9/16] rounded-[2.15rem] overflow-hidden bg-gray-800">
              {children}
          </div>

          {/* Home indicator */}
          <div className="flex justify-center mt-[10px]">
            <div className="w-[90px] h-[4px] bg-gray-600 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

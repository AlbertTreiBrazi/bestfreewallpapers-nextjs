'use client'

import * as React from 'react'

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
}

export function Progress({ value = 0, className = '', ...props }: ProgressProps) {
  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-700 ${className}`} {...props}>
      <div
        className="h-full bg-green-600 transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export default Progress

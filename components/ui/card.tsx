'use client'

import * as React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className = '', ...props }: CardProps) {
  return <div className={`bg-gray-800 border border-gray-700 rounded-xl shadow-sm ${className}`} {...props} />
}

export function CardHeader({ className = '', ...props }: CardProps) {
  return <div className={`flex flex-col space-y-1 p-6 ${className}`} {...props} />
}

export function CardTitle({ className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`text-lg font-semibold text-white ${className}`} {...props} />
}

export function CardDescription({ className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`text-sm text-gray-400 ${className}`} {...props} />
}

export function CardContent({ className = '', ...props }: CardProps) {
  return <div className={`p-6 pt-0 ${className}`} {...props} />
}

export function CardFooter({ className = '', ...props }: CardProps) {
  return <div className={`flex items-center p-6 pt-0 ${className}`} {...props} />
}

export default Card

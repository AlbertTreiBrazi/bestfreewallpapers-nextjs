'use client'

import * as React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}

const variantStyles: Record<string, string> = {
  default: 'bg-green-700 hover:bg-green-600 text-white',
  outline: 'border border-gray-600 bg-transparent hover:bg-gray-800 text-gray-300',
  ghost: 'bg-transparent hover:bg-gray-800 text-gray-300',
  destructive: 'bg-red-700 hover:bg-red-600 text-white',
  secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
  link: 'text-green-400 hover:underline bg-transparent',
}

const sizeStyles: Record<string, string> = {
  default: 'h-10 px-4 py-2 text-sm',
  sm: 'h-8 px-3 text-xs rounded-md',
  lg: 'h-11 px-8 text-base',
  icon: 'h-10 w-10',
}

export function Button({
  className = '',
  variant = 'default',
  size = 'default',
  children,
  asChild: _asChild,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size] || sizeStyles.default} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button

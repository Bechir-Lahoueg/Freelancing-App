import * as React from "react"
import { cn } from "@/lib/utils"

const buttonVariants = (props = {}) => {
  const { variant = "default", size = "md" } = props

  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

  const variants = {
    default: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700",
    destructive: "bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl",
    outline: "border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900",
    ghost: "hover:bg-slate-100 dark:hover:bg-slate-800",
    link: "text-blue-600 underline-offset-4 hover:underline",
  }

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4",
    lg: "h-12 px-8",
    icon: "h-10 w-10",
  }

  return cn(
    baseStyles,
    variants[variant],
    sizes[size]
  )
}

const Button = React.forwardRef(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

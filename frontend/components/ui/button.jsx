import { cn } from "@/lib/utils"

export function Button({ className, variant = "primary", size = "default", ...props }) {
  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 shadow-lg shadow-indigo-500/25",
    secondary: "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-sm",
    danger: "bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:opacity-90 shadow-lg shadow-rose-500/25",
    ghost: "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50",
    outline: "border-2 border-indigo-200 dark:border-indigo-900/30 bg-transparent text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
  }

  const sizes = {
    sm: "px-4 py-2 text-xs",
    default: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
    icon: "p-3"
  }

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl font-bold tracking-tight transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
}
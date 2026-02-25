import { cn } from "@/lib/utils"

export function Select({ children, value, onValueChange, ...props }) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className={cn(
        "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        props.className
      )}
      {...props}
    >
      {children}
    </select>
  )
}

export function SelectItem({ children, value }) {
  return <option value={value}>{children}</option>
}
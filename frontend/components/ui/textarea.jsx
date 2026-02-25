import { cn } from "@/lib/utils"

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical",
        className
      )}
      {...props}
    />
  )
}
"use client";

export default function LoadingSpinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="relative w-full h-full">
        <div className="absolute inset-0 rounded-full border-2 border-[rgb(var(--color-border)/0.5)]"></div>
        <div className="absolute inset-0 rounded-full border-2 border-[rgb(var(--color-primary))] border-t-transparent animate-spin"></div>
      </div>
    </div>
  );
}

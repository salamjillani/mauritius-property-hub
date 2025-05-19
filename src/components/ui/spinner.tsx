import React from "react";

/**
 * Spinner component that shows a loading animation
 * Can be customized with size, color, and thickness props
 */
export function Spinner({ 
  size = "md", 
  color = "teal", 
  thickness = "2"
}) {
  // Size mappings for the spinner
  const sizeClasses = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  // Color mappings for the spinner
  const colorClasses = {
    teal: "border-teal-500",
    blue: "border-blue-500",
    gray: "border-gray-500",
    slate: "border-slate-500",
    white: "border-white",
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full ${sizeClasses[size] || sizeClasses.md} border-t-${thickness} border-b-${thickness} ${colorClasses[color] || colorClasses.teal}`}
      role="status"
      aria-label="Loading"
    />
  );
}

// Also export as default for convenience
export default Spinner;
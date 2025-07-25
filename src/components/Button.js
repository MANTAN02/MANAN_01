import React from "react";

export default function Button({ children, onClick, variant = "primary", fullWidth = false, className = '', ...props }) {
  return (
    <button
      onClick={onClick}
      className={`button ${variant} ${fullWidth ? 'full-width' : ''} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

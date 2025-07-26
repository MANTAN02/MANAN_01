import React from "react";

export default function Button({ 
  children, 
  onClick, 
  variant = "primary", 
  fullWidth = false, 
  disabled = false, 
  loading = false,
  size = "medium",
  type = "button",
  className = '',
  ...props 
}) {
  const getClassName = () => {
    let baseClass = "button";
    
    if (variant === "premium") {
      baseClass += " premium";
    } else if (variant === "secondary") {
      baseClass += " secondary";
    } else if (variant === "danger") {
      baseClass += " danger";
    } else if (variant === "success") {
      baseClass += " success";
    } else if (variant === "primary") {
      baseClass += " primary";
    }
    
    if (fullWidth) {
      baseClass += " full-width";
    }
    
    if (disabled || loading) {
      baseClass += " disabled";
    }

    if (size === "small") {
      baseClass += " small";
    } else if (size === "large") {
      baseClass += " large";
    }
    
    return `${baseClass} ${className}`.trim();
  };

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    
    if (onClick) {
      try {
        onClick(e);
      } catch (error) {
        console.error('Button onClick error:', error);
      }
    }
  };

  return (
    <button 
      className={getClassName()} 
      onClick={handleClick} 
      disabled={disabled || loading}
      type={type}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="loading-spinner-small"></span>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

import React from 'react';
import type { ReactNode } from 'react';
import './Button.css';

export default function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const baseClass = variant === 'primary' ? 'btn-primary-custom' : 'btn-secondary-custom';
  return (
    <button className={`${baseClass} ${fullWidth ? 'btn-full-custom' : ''} ${className}`} {...props}>
      {children}
    </button>
  );
}
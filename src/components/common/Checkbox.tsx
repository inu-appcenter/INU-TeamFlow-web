'use client';

import React from 'react';

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

const iconSizeMap = {
  sm: 'h-2.5 w-2.5',
  md: 'h-3 w-3',
  lg: 'h-3.5 w-3.5',
};

export default function Checkbox({
  checked,
  onChange,
  label,
  size = 'md',
  className = '',
}: CheckboxProps) {
  return (
    <label className={`flex cursor-pointer items-center gap-2 ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="hidden"
      />

      <div
        className={`flex items-center justify-center rounded border transition ${
          sizeMap[size]
        } ${
          checked
            ? 'border-[#D6DDE5] bg-[#5E92F0]'
            : 'border-[#D6DDE5] bg-white'
        }`}
      >
        {checked && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            className={iconSizeMap[size]}
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </div>

      {label && <span>{label}</span>}
    </label>
  );
}

import React from 'react';

interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  icons?: {
    checked: React.ReactNode;
    unchecked: React.ReactNode;
  };
  className?: string;
}

export function Toggle({ value, onChange, icons, className = '' }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`p-2 rounded-lg transition-colors ${
        value
          ? 'bg-primary-500 text-white'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
      } ${className}`}
      aria-pressed={value}
    >
      {icons ? (value ? icons.checked : icons.unchecked) : null}
    </button>
  );
} 
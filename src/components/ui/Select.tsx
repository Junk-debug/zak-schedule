"use client";

interface SelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export function Select({ id, value, onChange, options, className = "" }: SelectProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`
        px-3 py-2 pr-8 rounded-md border border-border bg-white text-gray-900
        text-sm font-medium cursor-pointer transition-colors
        appearance-none bg-no-repeat bg-[right_10px_center]
        bg-[length:12px_12px]
        bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")]
        hover:border-gray-400 focus:outline-none focus:border-gray-500
        ${className}
      `}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

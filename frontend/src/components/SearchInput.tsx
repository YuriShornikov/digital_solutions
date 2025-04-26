// components/SearchInput.tsx
import { ChangeEvent } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string; // Опциональный параметр
  className?: string;   // Дополнительные пропсы при необходимости
}

export const SearchInput = ({
  value,
  onChange,
  placeholder = '', // Значение по умолчанию
  className = ''
}: SearchInputProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={`search-input ${className}`}
    />
  );
};
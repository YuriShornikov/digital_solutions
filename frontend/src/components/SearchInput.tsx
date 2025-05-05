import { ChangeEvent } from 'react';
import { SearchInputProps } from '../types/types';

export const SearchInput = ({
  value,
  onChange,
  placeholder = '',
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
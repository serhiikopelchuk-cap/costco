import React, { forwardRef } from 'react';
import './CurrencyInput.css';

interface CurrencyInputProps {
  value: string | number;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(({
  value,
  onChange,
  onBlur,
  disabled = false,
  className = '',
  placeholder = ''
}, ref) => {
  const formatValue = (val: number | string): string => {
    if (!val && val !== 0) return '0$';
    if (typeof val === 'number') return `${val}$`;
    const numStr = val.toString().replace(/\$/g, '').replace(/^0+(?=\d)/, '');
    return (numStr || '0') + '$';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = e.target.value.replace(/[^0-9.]/g, '');
    onChange(sanitizedValue + '$');
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (onBlur) {
      const value = e.target.value;
      const numStr = value.replace(/\$/g, '').replace(/^0+(?=\d)/, '');
      onBlur((numStr || '0') + '$');
    }
  };

  return (
    <input
      ref={ref}
      type="text"
      value={formatValue(value)}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      className={`currency-input ${className}`}
      placeholder={placeholder}
    />
  );
});

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput; 
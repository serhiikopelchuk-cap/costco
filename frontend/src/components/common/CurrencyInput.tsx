import React from 'react';
import './CurrencyInput.css';

interface CurrencyInputProps {
  value: number | string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  onBlur,
  disabled = false,
  className = '',
  placeholder = 'Enter amount'
}) => {
  const formatValue = (val: number | string): string => {
    if (!val && val !== 0) return '0$';

    if (typeof val === 'number') {
      return `${val}$`;
    }

    const numStr = val.toString().replace(/\$/g, '').replace(/^0+(?=\d)/, '');
    return (numStr || '0') + '$';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = e.target.value.replace(/[^0-9.]/g, '');
    const numericValue = parseFloat(sanitizedValue);
    
    if (numericValue < 0) return;

    const formattedValue = sanitizedValue.replace(/^0+(?=\d)/, '') || '0';
    onChange(formattedValue + '$');
  };

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const input = e.currentTarget;
    input.value = input.value.replace(/\$/g, '');
    input.select();
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numStr = value.replace(/\$/g, '').replace(/^0+(?=\d)/, '');
    const formattedValue = (numStr || '0') + '$';
    if (onBlur) {
      onBlur(formattedValue);
    }
  };

  return (
    <input
      type="text"
      value={formatValue(value)}
      onChange={handleChange}
      onBlur={handleBlur}
      onClick={handleClick}
      className={`currency-input ${className}`}
      disabled={disabled}
      placeholder={placeholder}
    />
  );
};

export default CurrencyInput; 
import React from 'react';
import './PercentageInput.css';

interface PercentageInputProps {
  value: number | string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

const PercentageInput: React.FC<PercentageInputProps> = ({
  value,
  onChange,
  onBlur,
  disabled = false,
  className = '',
  placeholder = 'Enter percentage'
}) => {
  const formatValue = (val: number | string): string => {
    if (typeof val === 'number') {
      return `${val}%`;
    }
    return val.includes('%') ? val : `${val}%`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = e.target.value.replace(/[^0-9.%-]/g, '');
    const numericValue = parseFloat(sanitizedValue.replace(/[%]/g, ''));
    
    if (numericValue < 0) return;
    onChange(sanitizedValue);
  };

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    e.currentTarget.select();
  };

  return (
    <input
      type="text"
      value={formatValue(value)}
      onChange={handleChange}
      onBlur={onBlur ? (e) => onBlur(e.target.value) : undefined}
      onClick={handleClick}
      className={`percentage-input ${className}`}
      disabled={disabled}
      placeholder={placeholder}
    />
  );
};

export default PercentageInput; 
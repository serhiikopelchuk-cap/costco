export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateCellValue = (value: string | number): ValidationResult => {
  const numericValue = Number(value);

  if (isNaN(numericValue) || numericValue < 0) {
    return { isValid: false, message: "Invalid input: Please enter a non-negative number." };
  }

  if (typeof value === 'string' && value.trim() === '') {
    return { isValid: false, message: "Invalid input: Field cannot be empty." };
  }

  return { isValid: true };
}; 
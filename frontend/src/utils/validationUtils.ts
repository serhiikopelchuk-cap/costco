export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateCellValue = (value: string): ValidationResult => {
  const numericValue = Number(value);
  if (value.trim() === '' || (!isNaN(numericValue) && numericValue >= 0) || value.endsWith('.')) {
    return { isValid: true };
  }

  return { isValid: false, message: "Invalid input: Please enter a non-negative number." };
}; 
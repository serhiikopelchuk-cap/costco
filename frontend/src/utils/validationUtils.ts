export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateCellValue = (value: string): ValidationResult => {
  if (value.trim() === '' || (!isNaN(Number(value)) || value.endsWith('.'))) {
    return { isValid: true };
  }

  return { isValid: false, message: "Invalid input: Please enter a valid number." };
}; 
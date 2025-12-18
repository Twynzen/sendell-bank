/* ═══════════════════════════════════════════════════════════════════════════
   SENDELLBANK VALIDATORS
   Utility functions for validation
   ═══════════════════════════════════════════════════════════════════════════ */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    errors.push('El correo electrónico es requerido');
  } else if (!emailRegex.test(email)) {
    errors.push('Formato de correo electrónico inválido');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (!password) {
    errors.push('La contraseña es requerida');
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una mayúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una minúscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Debe contener al menos un número');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Debe contener al menos un carácter especial');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate Colombian document (Cédula)
 */
export function validateCedula(cedula: string): ValidationResult {
  const errors: string[] = [];
  const cleaned = cedula.replace(/\D/g, '');

  if (!cleaned) {
    errors.push('El número de cédula es requerido');
  } else if (cleaned.length < 6 || cleaned.length > 10) {
    errors.push('Número de cédula inválido');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate Colombian phone number
 */
export function validatePhoneNumber(phone: string): ValidationResult {
  const errors: string[] = [];
  const cleaned = phone.replace(/\D/g, '');

  if (!cleaned) {
    errors.push('El número de teléfono es requerido');
  } else if (cleaned.length !== 10 || !cleaned.startsWith('3')) {
    errors.push('Número de celular inválido (debe ser de 10 dígitos y comenzar con 3)');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate account number
 */
export function validateAccountNumber(accountNumber: string): ValidationResult {
  const errors: string[] = [];
  const cleaned = accountNumber.replace(/\D/g, '');

  if (!cleaned) {
    errors.push('El número de cuenta es requerido');
  } else if (cleaned.length < 10 || cleaned.length > 20) {
    errors.push('Número de cuenta inválido');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate transfer amount
 */
export function validateTransferAmount(
  amount: number,
  minAmount = 1000,
  maxAmount = 500000000,
  availableBalance?: number
): ValidationResult {
  const errors: string[] = [];

  if (!amount || amount <= 0) {
    errors.push('El monto debe ser mayor a 0');
  } else {
    if (amount < minAmount) {
      errors.push(`El monto mínimo es ${minAmount.toLocaleString()}`);
    }

    if (amount > maxAmount) {
      errors.push(`El monto máximo es ${maxAmount.toLocaleString()}`);
    }

    if (availableBalance !== undefined && amount > availableBalance) {
      errors.push('Saldo insuficiente');
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate OTP code
 */
export function validateOtp(otp: string, length = 6): ValidationResult {
  const errors: string[] = [];
  const cleaned = otp.replace(/\D/g, '');

  if (!cleaned) {
    errors.push('El código de verificación es requerido');
  } else if (cleaned.length !== length) {
    errors.push(`El código debe tener ${length} dígitos`);
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate PIN
 */
export function validatePin(pin: string, length = 4): ValidationResult {
  const errors: string[] = [];
  const cleaned = pin.replace(/\D/g, '');

  if (!cleaned) {
    errors.push('El PIN es requerido');
  } else if (cleaned.length !== length) {
    errors.push(`El PIN debe tener ${length} dígitos`);
  } else {
    // Check for sequential numbers
    const sequential = '0123456789';
    const reverseSequential = '9876543210';
    if (sequential.includes(cleaned) || reverseSequential.includes(cleaned)) {
      errors.push('El PIN no puede ser una secuencia');
    }

    // Check for repeated numbers
    if (/^(\d)\1+$/.test(cleaned)) {
      errors.push('El PIN no puede tener todos los dígitos iguales');
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate required field
 */
export function validateRequired(
  value: string | number | null | undefined,
  fieldName = 'Este campo'
): ValidationResult {
  const errors: string[] = [];

  if (value === null || value === undefined || value === '') {
    errors.push(`${fieldName} es requerido`);
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate minimum length
 */
export function validateMinLength(
  value: string,
  minLength: number,
  fieldName = 'El campo'
): ValidationResult {
  const errors: string[] = [];

  if (value.length < minLength) {
    errors.push(`${fieldName} debe tener al menos ${minLength} caracteres`);
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate maximum length
 */
export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName = 'El campo'
): ValidationResult {
  const errors: string[] = [];

  if (value.length > maxLength) {
    errors.push(`${fieldName} no puede exceder ${maxLength} caracteres`);
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Combine multiple validations
 */
export function combineValidations(
  ...validations: ValidationResult[]
): ValidationResult {
  const allErrors = validations.flatMap((v) => v.errors);
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}

/**
 * Create a form validator
 */
export function createFormValidator<T extends Record<string, unknown>>(
  validationRules: {
    [K in keyof T]?: (value: T[K]) => ValidationResult;
  }
) {
  return function validate(formData: T): {
    isValid: boolean;
    errors: { [K in keyof T]?: string[] };
  } {
    const errors: { [K in keyof T]?: string[] } = {};
    let isValid = true;

    for (const [field, validator] of Object.entries(validationRules)) {
      if (validator) {
        const result = validator(formData[field as keyof T] as T[keyof T]);
        if (!result.isValid) {
          isValid = false;
          errors[field as keyof T] = result.errors;
        }
      }
    }

    return { isValid, errors };
  };
}

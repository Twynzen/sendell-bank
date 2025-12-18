/* ═══════════════════════════════════════════════════════════════════════════
   UTILS - BARREL EXPORT
   ═══════════════════════════════════════════════════════════════════════════ */

export {
  formatCurrency,
  formatNumber,
  formatAccountNumber,
  formatCardNumber,
  formatDate,
  formatRelativeTime,
  formatTransactionDate,
  formatPhoneNumber,
  formatDocument,
  formatPercentage,
  formatFileSize,
  truncate,
  capitalize,
  formatName,
} from './formatters';

export {
  validateEmail,
  validatePassword,
  validateCedula,
  validatePhoneNumber,
  validateAccountNumber,
  validateTransferAmount,
  validateOtp,
  validatePin,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  combineValidations,
  createFormValidator,
} from './validators';

export type { ValidationResult } from './validators';

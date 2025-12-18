/* ═══════════════════════════════════════════════════════════════════════════
   SENDELLBANK FORMATTERS
   Utility functions for formatting values
   ═══════════════════════════════════════════════════════════════════════════ */

import type { Currency } from '../types';

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number,
  currency: Currency = 'COP',
  locale = 'es-CO'
): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'COP' ? 0 : 2,
    maximumFractionDigits: currency === 'COP' ? 0 : 2,
  });

  return formatter.format(amount);
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(
  value: number,
  decimals = 0,
  locale = 'es-CO'
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format an account number with masking
 */
export function formatAccountNumber(
  accountNumber: string,
  mask = true
): string {
  const cleaned = accountNumber.replace(/\s|-/g, '');

  if (mask && cleaned.length > 4) {
    const lastFour = cleaned.slice(-4);
    return `•••• ${lastFour}`;
  }

  // Format as groups of 4
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Format a card number with masking
 */
export function formatCardNumber(
  cardNumber: string,
  showFull = false
): string {
  const cleaned = cardNumber.replace(/\s|-/g, '');

  if (showFull) {
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  }

  // Show only last 4 digits
  const lastFour = cleaned.slice(-4);
  return `•••• •••• •••• ${lastFour}`;
}

/**
 * Format a date
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
  locale = 'es-CO'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Format a date as relative time (e.g., "hace 2 horas")
 */
export function formatRelativeTime(
  date: string | Date,
  locale = 'es'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffSec < 60) {
    return rtf.format(-diffSec, 'second');
  } else if (diffMin < 60) {
    return rtf.format(-diffMin, 'minute');
  } else if (diffHour < 24) {
    return rtf.format(-diffHour, 'hour');
  } else if (diffDay < 30) {
    return rtf.format(-diffDay, 'day');
  } else {
    return formatDate(dateObj, { month: 'short', day: 'numeric' }, locale);
  }
}

/**
 * Format a date for transactions
 */
export function formatTransactionDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const isToday = dateObj.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = dateObj.toDateString() === yesterday.toDateString();

  if (isToday) {
    return `Hoy, ${formatDate(dateObj, { hour: '2-digit', minute: '2-digit' })}`;
  }

  if (isYesterday) {
    return `Ayer, ${formatDate(dateObj, { hour: '2-digit', minute: '2-digit' })}`;
  }

  return formatDate(dateObj, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a phone number
 */
export function formatPhoneNumber(phone: string, mask = false): string {
  const cleaned = phone.replace(/\D/g, '');

  if (mask && cleaned.length >= 4) {
    const lastFour = cleaned.slice(-4);
    return `***-***-${lastFour}`;
  }

  // Colombian format: +57 300 123 4567
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }

  if (cleaned.length === 12 && cleaned.startsWith('57')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }

  return phone;
}

/**
 * Format a document number
 */
export function formatDocument(document: string, type: string): string {
  const cleaned = document.replace(/\D/g, '');

  switch (type) {
    case 'CC': // Cédula de ciudadanía
      return cleaned.replace(/(\d{1,3})(?=(\d{3})+(?!\d))/g, '$1.');
    case 'NIT':
      if (cleaned.length >= 2) {
        const dv = cleaned.slice(-1);
        const base = cleaned.slice(0, -1);
        return `${base.replace(/(\d{1,3})(?=(\d{3})+(?!\d))/g, '$1.')}-${dv}`;
      }
      return cleaned;
    default:
      return document;
  }
}

/**
 * Format percentage
 */
export function formatPercentage(
  value: number,
  decimals = 1,
  includeSign = false
): string {
  const formatted = value.toFixed(decimals);
  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${formatted}%`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Format name for display
 */
export function formatName(
  firstName: string,
  lastName?: string,
  format: 'full' | 'short' | 'initials' = 'full'
): string {
  const first = capitalize(firstName);
  const last = lastName ? capitalize(lastName) : '';

  switch (format) {
    case 'short':
      return last ? `${first} ${last.charAt(0)}.` : first;
    case 'initials':
      return last
        ? `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
        : first.charAt(0).toUpperCase();
    default:
      return last ? `${first} ${last}` : first;
  }
}

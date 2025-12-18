/* ═══════════════════════════════════════════════════════════════════════════
   TRANSFER TYPES
   Type definitions for transfer-related entities
   ═══════════════════════════════════════════════════════════════════════════ */

import type { Currency } from './account.types';

export interface Transfer {
  id: string;
  userId: string;
  type: TransferType;
  sourceAccountId: string;
  destinationAccountId?: string;
  beneficiaryId?: string;
  amount: number;
  currency: Currency;
  description: string;
  reference: string;
  status: TransferStatus;
  scheduledDate?: string;
  executedAt?: string;
  createdAt: string;
  fee?: number;
  exchangeRate?: number;
}

export type TransferType =
  | 'own_accounts'      // Between own accounts
  | 'internal'          // Same bank
  | 'external'          // Other banks
  | 'international'     // International
  | 'scheduled';        // Scheduled/recurring

export type TransferStatus =
  | 'draft'
  | 'pending_approval'
  | 'pending_otp'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'scheduled';

export interface TransferRequest {
  type: TransferType;
  sourceAccountId: string;
  destinationAccountId?: string;
  beneficiaryId?: string;
  amount: number;
  currency: Currency;
  description: string;
  scheduledDate?: string;
  isRecurring?: boolean;
  recurringConfig?: RecurringConfig;
}

export interface RecurringConfig {
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  maxOccurrences?: number;
  dayOfMonth?: number;
  dayOfWeek?: number;
}

export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export interface TransferValidation {
  isValid: boolean;
  errors: TransferValidationError[];
  warnings: string[];
  fee?: number;
  estimatedArrival?: string;
}

export interface TransferValidationError {
  field: string;
  code: string;
  message: string;
}

export interface TransferConfirmation {
  transfer: Transfer;
  requiresOtp: boolean;
  otpSentTo?: string;
}

export interface Beneficiary {
  id: string;
  userId: string;
  alias: string;
  name: string;
  bankCode?: string;
  bankName?: string;
  accountNumber: string;
  accountType: 'savings' | 'checking';
  documentType?: string;
  documentNumber?: string;
  email?: string;
  phone?: string;
  isFavorite: boolean;
  lastUsed?: string;
  createdAt: string;
}

export interface BeneficiaryCreate {
  alias: string;
  name: string;
  bankCode?: string;
  accountNumber: string;
  accountType: 'savings' | 'checking';
  documentType?: string;
  documentNumber?: string;
  email?: string;
  phone?: string;
}

export interface Bank {
  code: string;
  name: string;
  logo?: string;
  swiftCode?: string;
  isLocal: boolean;
}

export interface TransferLimits {
  dailyLimit: number;
  dailyUsed: number;
  dailyRemaining: number;
  monthlyLimit: number;
  monthlyUsed: number;
  monthlyRemaining: number;
  perTransactionLimit: number;
}

export interface QuickTransfer {
  beneficiaryId: string;
  amount: number;
  description?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CARD TYPES
   Type definitions for card-related entities
   ═══════════════════════════════════════════════════════════════════════════ */

import type { Currency } from './account.types';

export interface Card {
  id: string;
  userId: string;
  accountId: string;
  type: CardType;
  brand: CardBrand;
  number: string;           // Masked: **** **** **** 1234
  fullNumber?: string;      // Only when viewing details with auth
  holderName: string;
  expiryDate: string;       // MM/YY
  cvv?: string;             // Only when viewing with auth
  status: CardStatus;
  isVirtual: boolean;
  isContactless: boolean;
  limits: CardLimits;
  design: CardDesign;
  activatedAt?: string;
  createdAt: string;
  lastUsedAt?: string;
}

export type CardType = 'debit' | 'credit' | 'prepaid';

export type CardBrand = 'visa' | 'mastercard' | 'amex';

export type CardStatus =
  | 'active'
  | 'inactive'
  | 'blocked'
  | 'expired'
  | 'cancelled'
  | 'pending_activation';

export interface CardLimits {
  dailyPurchase: number;
  dailyWithdrawal: number;
  monthlyPurchase: number;
  onlinePurchase: number;
  internationalPurchase: number;
  contactlessLimit: number;
}

export interface CardDesign {
  color: string;
  pattern?: string;
  backgroundImage?: string;
}

export interface CardDetails extends Card {
  transactions: CardTransaction[];
  monthlySpending: MonthlySpending;
  availableCredit?: number;   // For credit cards
  creditLimit?: number;       // For credit cards
  minimumPayment?: number;    // For credit cards
  paymentDueDate?: string;    // For credit cards
}

export interface CardTransaction {
  id: string;
  cardId: string;
  type: CardTransactionType;
  amount: number;
  currency: Currency;
  merchantName: string;
  merchantCategory: string;
  location?: string;
  status: CardTransactionStatus;
  date: string;
  isContactless: boolean;
  isOnline: boolean;
  isInternational: boolean;
}

export type CardTransactionType = 'purchase' | 'withdrawal' | 'refund' | 'fee' | 'payment';

export type CardTransactionStatus = 'pending' | 'approved' | 'declined' | 'reversed';

export interface MonthlySpending {
  month: number;
  year: number;
  total: number;
  byCategory: SpendingCategory[];
  comparedToPrevious: number; // percentage change
}

export interface SpendingCategory {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface CardAction {
  type: CardActionType;
  cardId: string;
  reason?: string;
  newValue?: number;
}

export type CardActionType =
  | 'block'
  | 'unblock'
  | 'activate'
  | 'change_pin'
  | 'update_limits'
  | 'request_replacement'
  | 'toggle_contactless'
  | 'toggle_online'
  | 'toggle_international';

export interface CardBlockRequest {
  cardId: string;
  reason: CardBlockReason;
  isTemporary: boolean;
}

export type CardBlockReason = 'lost' | 'stolen' | 'fraud' | 'user_request' | 'other';

export interface CardPinChange {
  cardId: string;
  currentPin: string;
  newPin: string;
  confirmPin: string;
}

export interface CardLimitUpdate {
  cardId: string;
  limitType: keyof CardLimits;
  newValue: number;
}

export interface VirtualCardRequest {
  accountId: string;
  brand?: CardBrand;
  limits?: Partial<CardLimits>;
  validFor?: number; // days
}

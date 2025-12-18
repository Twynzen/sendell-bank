/* ═══════════════════════════════════════════════════════════════════════════
   TYPE EXPORTS
   Central export file for all type definitions
   ═══════════════════════════════════════════════════════════════════════════ */

// User types
export type {
  User,
  UserRole,
  UserStatus,
  UserPreferences,
  NotificationPreferences,
  SecurityPreferences,
  TrustedDevice,
  LoginCredentials,
  AuthResponse,
  OtpVerification,
  Session,
  PasswordChange,
  PasswordReset,
  PasswordResetConfirm,
} from './user.types';

// Account types
export type {
  Account,
  AccountType,
  AccountSubtype,
  AccountStatus,
  Currency,
  AccountSummary,
  AccountDetails,
  AccountLimits,
  Transaction,
  TransactionType,
  TransactionCategory,
  TransactionStatus,
  TransactionMetadata,
  MonthlyStatement,
  TransactionFilter,
  PaginatedTransactions,
} from './account.types';

// Transfer types
export type {
  Transfer,
  TransferType,
  TransferStatus,
  TransferRequest,
  RecurringConfig,
  RecurringFrequency,
  TransferValidation,
  TransferValidationError,
  TransferConfirmation,
  Beneficiary,
  BeneficiaryCreate,
  Bank,
  TransferLimits,
  QuickTransfer,
} from './transfer.types';

// Card types
export type {
  Card,
  CardType,
  CardBrand,
  CardStatus,
  CardLimits,
  CardDesign,
  CardDetails,
  CardTransaction,
  CardTransactionType,
  CardTransactionStatus,
  MonthlySpending,
  SpendingCategory,
  CardAction,
  CardActionType,
  CardBlockRequest,
  CardBlockReason,
  CardPinChange,
  CardLimitUpdate,
  VirtualCardRequest,
} from './card.types';

// Common types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

export interface ResponseMeta {
  page?: number;
  pageSize?: number;
  total?: number;
  hasMore?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export type NotificationType =
  | 'transaction'
  | 'security'
  | 'promotion'
  | 'system'
  | 'reminder';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: ToastAction;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  handler: () => void;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  badge?: string | number;
  children?: MenuItem[];
  isDisabled?: boolean;
  isExternal?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ACCOUNT TYPES
   Type definitions for account-related entities
   ═══════════════════════════════════════════════════════════════════════════ */

export interface Account {
  id: string;
  userId: string;
  type: AccountType;
  subtype?: AccountSubtype;
  number: string;
  maskedNumber: string;
  alias: string;
  balance: number;
  availableBalance: number;
  currency: Currency;
  status: AccountStatus;
  isMain: boolean;
  openedAt: string;
  lastTransactionAt?: string;
  interestRate?: number;
  overdraftLimit?: number;
}

export type AccountType = 'savings' | 'checking' | 'investment' | 'credit';

export type AccountSubtype =
  | 'personal_savings'
  | 'business_savings'
  | 'high_yield_savings'
  | 'personal_checking'
  | 'business_checking'
  | 'money_market'
  | 'certificate_deposit';

export type AccountStatus = 'active' | 'inactive' | 'blocked' | 'closed' | 'pending';

export type Currency = 'COP' | 'USD' | 'EUR';

export interface AccountSummary {
  totalBalance: number;
  totalAvailable: number;
  accounts: Account[];
  currency: Currency;
}

export interface AccountDetails extends Account {
  transactions: Transaction[];
  monthlyStatement?: MonthlyStatement;
  limits: AccountLimits;
}

export interface AccountLimits {
  dailyTransfer: number;
  dailyWithdrawal: number;
  monthlyTransfer: number;
  remainingDailyTransfer: number;
  remainingDailyWithdrawal: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  currency: Currency;
  description: string;
  reference?: string;
  merchantName?: string;
  merchantCategory?: string;
  status: TransactionStatus;
  date: string;
  processedAt?: string;
  balanceAfter?: number;
  metadata?: TransactionMetadata;
}

export type TransactionType =
  | 'transfer_in'
  | 'transfer_out'
  | 'payment'
  | 'deposit'
  | 'withdrawal'
  | 'fee'
  | 'interest'
  | 'refund'
  | 'purchase';

export type TransactionCategory =
  | 'salary'
  | 'food'
  | 'transport'
  | 'utilities'
  | 'entertainment'
  | 'shopping'
  | 'health'
  | 'education'
  | 'travel'
  | 'other';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'reversed';

export interface TransactionMetadata {
  sourceAccount?: string;
  destinationAccount?: string;
  beneficiaryName?: string;
  channel?: 'web' | 'mobile' | 'atm' | 'branch';
  location?: string;
  notes?: string;
}

export interface MonthlyStatement {
  month: number;
  year: number;
  openingBalance: number;
  closingBalance: number;
  totalIncome: number;
  totalExpenses: number;
  transactionCount: number;
  downloadUrl?: string;
}

export interface TransactionFilter {
  dateFrom?: string;
  dateTo?: string;
  type?: TransactionType;
  category?: TransactionCategory;
  status?: TransactionStatus;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
}

export interface PaginatedTransactions {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

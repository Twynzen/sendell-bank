/* ═══════════════════════════════════════════════════════════════════════════
   SENDELLBANK ACCOUNTS SERVICE
   Account management and transaction services
   ═══════════════════════════════════════════════════════════════════════════ */

import { api } from './api.service';
import { storageService } from './storage.service';
import { eventBus, AppEvents } from '../state/event-bus';
import type {
  Account,
  AccountDetails,
  AccountSummary,
  Transaction,
  TransactionFilter,
  PaginatedTransactions,
} from '../types';

class AccountsService {
  // ═══════════════════════════════════════════════════════════
  // ACCOUNTS METHODS
  // ═══════════════════════════════════════════════════════════

  async getAccountsSummary(): Promise<AccountSummary | null> {
    // Try cache first
    const cached = await storageService.getCache<AccountSummary>('accounts-summary');
    if (cached) return cached;

    const response = await api.get<AccountSummary>('/accounts/summary');

    if (response.success && response.data) {
      // Cache for 2 minutes
      await storageService.setCache('accounts-summary', response.data, 120000);
      // Store in IndexedDB for offline
      await storageService.saveAccounts(response.data.accounts);
      return response.data;
    }

    // Fallback to offline data
    const userId = localStorage.getItem('userId');
    if (userId) {
      const offlineAccounts = await storageService.getAccounts(userId);
      if (offlineAccounts.length > 0) {
        return {
          accounts: offlineAccounts,
          totalBalance: offlineAccounts.reduce((sum, acc) => sum + acc.balance, 0),
          totalAvailable: offlineAccounts.reduce(
            (sum, acc) => sum + acc.availableBalance,
            0
          ),
          currency: 'COP',
        };
      }
    }

    return null;
  }

  async getAccounts(): Promise<Account[]> {
    const summary = await this.getAccountsSummary();
    return summary?.accounts || [];
  }

  async getAccountDetails(accountId: string): Promise<AccountDetails | null> {
    const cacheKey = `account-details-${accountId}`;
    const cached = await storageService.getCache<AccountDetails>(cacheKey);
    if (cached) return cached;

    const response = await api.get<AccountDetails>(`/accounts/${accountId}`);

    if (response.success && response.data) {
      await storageService.setCache(cacheKey, response.data, 60000);
      return response.data;
    }

    return null;
  }

  async updateAccountAlias(
    accountId: string,
    alias: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.patch<Account>(`/accounts/${accountId}`, {
      alias,
    });

    if (response.success) {
      // Invalidate cache
      await storageService.setCache('accounts-summary', null, 0);
      return { success: true, message: 'Alias actualizado correctamente' };
    }

    return {
      success: false,
      message: response.error?.message || 'Error al actualizar el alias',
    };
  }

  // ═══════════════════════════════════════════════════════════
  // TRANSACTIONS METHODS
  // ═══════════════════════════════════════════════════════════

  async getTransactions(
    accountId: string,
    filter?: TransactionFilter,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedTransactions> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (filter?.dateFrom) params.append('dateFrom', filter.dateFrom);
    if (filter?.dateTo) params.append('dateTo', filter.dateTo);
    if (filter?.type) params.append('type', filter.type);
    if (filter?.category) params.append('category', filter.category);
    if (filter?.status) params.append('status', filter.status);
    if (filter?.minAmount) params.append('minAmount', filter.minAmount.toString());
    if (filter?.maxAmount) params.append('maxAmount', filter.maxAmount.toString());
    if (filter?.searchTerm) params.append('search', filter.searchTerm);

    const response = await api.get<PaginatedTransactions>(
      `/accounts/${accountId}/transactions?${params.toString()}`
    );

    if (response.success && response.data) {
      // Store transactions for offline access
      await storageService.saveTransactions(response.data.transactions);
      return response.data;
    }

    // Fallback to offline data
    const offlineTransactions = await storageService.getTransactions(
      accountId,
      pageSize
    );

    return {
      transactions: offlineTransactions,
      total: offlineTransactions.length,
      page: 1,
      pageSize,
      hasMore: false,
    };
  }

  async getTransaction(
    accountId: string,
    transactionId: string
  ): Promise<Transaction | null> {
    const response = await api.get<Transaction>(
      `/accounts/${accountId}/transactions/${transactionId}`
    );

    return response.success ? response.data ?? null : null;
  }

  async searchTransactions(
    query: string,
    limit = 10
  ): Promise<Transaction[]> {
    const response = await api.get<Transaction[]>(
      `/transactions/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );

    return response.success && response.data ? response.data : [];
  }

  // ═══════════════════════════════════════════════════════════
  // STATEMENTS
  // ═══════════════════════════════════════════════════════════

  async getMonthlyStatements(
    accountId: string,
    year: number
  ): Promise<
    Array<{ month: number; year: number; downloadUrl: string }>
  > {
    const response = await api.get<
      Array<{ month: number; year: number; downloadUrl: string }>
    >(`/accounts/${accountId}/statements?year=${year}`);

    return response.success && response.data ? response.data : [];
  }

  async downloadStatement(
    accountId: string,
    month: number,
    year: number
  ): Promise<Blob | null> {
    try {
      const response = await fetch(
        `/api/accounts/${accountId}/statements/${year}/${month}/download`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      if (response.ok) {
        return response.blob();
      }
    } catch (error) {
      console.error('Error downloading statement:', error);
    }

    return null;
  }

  // ═══════════════════════════════════════════════════════════
  // EXPORT
  // ═══════════════════════════════════════════════════════════

  async exportTransactions(
    accountId: string,
    filter: TransactionFilter,
    format: 'csv' | 'pdf' | 'excel' = 'csv'
  ): Promise<Blob | null> {
    try {
      const params = new URLSearchParams({
        format,
        ...(filter.dateFrom && { dateFrom: filter.dateFrom }),
        ...(filter.dateTo && { dateTo: filter.dateTo }),
        ...(filter.type && { type: filter.type }),
      });

      const response = await fetch(
        `/api/accounts/${accountId}/transactions/export?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      if (response.ok) {
        return response.blob();
      }
    } catch (error) {
      console.error('Error exporting transactions:', error);
    }

    return null;
  }

  // ═══════════════════════════════════════════════════════════
  // REAL-TIME UPDATES
  // ═══════════════════════════════════════════════════════════

  subscribeToBalanceUpdates(callback: (account: Account) => void) {
    // In a real app, this would use WebSockets
    // For now, poll every 30 seconds
    const interval = setInterval(async () => {
      const summary = await this.getAccountsSummary();
      if (summary) {
        summary.accounts.forEach(callback);
      }
    }, 30000);

    return {
      unsubscribe: () => clearInterval(interval),
    };
  }
}

// Singleton instance
export const accountsService = new AccountsService();
export default accountsService;

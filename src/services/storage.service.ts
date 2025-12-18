/* ═══════════════════════════════════════════════════════════════════════════
   SENDELLBANK STORAGE SERVICE
   IndexedDB storage for offline capabilities
   ═══════════════════════════════════════════════════════════════════════════ */

import { openDB, IDBPDatabase } from 'idb';
import type { Account, Transaction, Transfer, Card, User, Beneficiary } from '../types';

const DB_NAME = 'sendellbank-db';
const DB_VERSION = 1;

interface SendellBankDB {
  user: User;
  accounts: Account;
  transactions: Transaction;
  transfers: Transfer;
  cards: Card;
  beneficiaries: Beneficiary;
  pendingTransfers: Transfer;
  cache: { key: string; value: unknown; expiry: number };
}

class StorageService {
  private _db: IDBPDatabase<SendellBankDB> | null = null;
  private _initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this._db) return;

    if (this._initPromise) {
      return this._initPromise;
    }

    this._initPromise = this._openDatabase();
    await this._initPromise;
  }

  private async _openDatabase(): Promise<void> {
    this._db = await openDB<SendellBankDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // User store
        if (!db.objectStoreNames.contains('user')) {
          db.createObjectStore('user', { keyPath: 'id' });
        }

        // Accounts store
        if (!db.objectStoreNames.contains('accounts')) {
          const accountStore = db.createObjectStore('accounts', {
            keyPath: 'id',
          });
          accountStore.createIndex('userId', 'userId');
        }

        // Transactions store
        if (!db.objectStoreNames.contains('transactions')) {
          const txStore = db.createObjectStore('transactions', {
            keyPath: 'id',
          });
          txStore.createIndex('accountId', 'accountId');
          txStore.createIndex('date', 'date');
        }

        // Transfers store
        if (!db.objectStoreNames.contains('transfers')) {
          const transferStore = db.createObjectStore('transfers', {
            keyPath: 'id',
          });
          transferStore.createIndex('userId', 'userId');
          transferStore.createIndex('status', 'status');
        }

        // Cards store
        if (!db.objectStoreNames.contains('cards')) {
          const cardStore = db.createObjectStore('cards', { keyPath: 'id' });
          cardStore.createIndex('userId', 'userId');
        }

        // Beneficiaries store
        if (!db.objectStoreNames.contains('beneficiaries')) {
          const benefStore = db.createObjectStore('beneficiaries', {
            keyPath: 'id',
          });
          benefStore.createIndex('userId', 'userId');
        }

        // Pending transfers (offline queue)
        if (!db.objectStoreNames.contains('pendingTransfers')) {
          const pendingStore = db.createObjectStore('pendingTransfers', {
            keyPath: 'id',
          });
          pendingStore.createIndex('createdAt', 'createdAt');
        }

        // Cache store
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      },
    });
  }

  private _ensureDb() {
    if (!this._db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this._db;
  }

  // ═══════════════════════════════════════════════════════════
  // USER METHODS
  // ═══════════════════════════════════════════════════════════

  async saveUser(user: User): Promise<void> {
    const db = this._ensureDb();
    await db.put('user', user);
  }

  async getUser(id: string): Promise<User | undefined> {
    const db = this._ensureDb();
    return db.get('user', id);
  }

  async clearUser(): Promise<void> {
    const db = this._ensureDb();
    await db.clear('user');
  }

  // ═══════════════════════════════════════════════════════════
  // ACCOUNTS METHODS
  // ═══════════════════════════════════════════════════════════

  async saveAccounts(accounts: Account[]): Promise<void> {
    const db = this._ensureDb();
    const tx = db.transaction('accounts', 'readwrite');
    await Promise.all([
      ...accounts.map((account) => tx.store.put(account)),
      tx.done,
    ]);
  }

  async getAccounts(userId: string): Promise<Account[]> {
    const db = this._ensureDb();
    return db.getAllFromIndex('accounts', 'userId', userId);
  }

  async getAccount(id: string): Promise<Account | undefined> {
    const db = this._ensureDb();
    return db.get('accounts', id);
  }

  async updateAccountBalance(
    accountId: string,
    balance: number
  ): Promise<void> {
    const db = this._ensureDb();
    const account = await db.get('accounts', accountId);
    if (account) {
      account.balance = balance;
      await db.put('accounts', account);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // TRANSACTIONS METHODS
  // ═══════════════════════════════════════════════════════════

  async saveTransactions(transactions: Transaction[]): Promise<void> {
    const db = this._ensureDb();
    const tx = db.transaction('transactions', 'readwrite');
    await Promise.all([
      ...transactions.map((transaction) => tx.store.put(transaction)),
      tx.done,
    ]);
  }

  async getTransactions(
    accountId: string,
    limit = 50
  ): Promise<Transaction[]> {
    const db = this._ensureDb();
    const all = await db.getAllFromIndex(
      'transactions',
      'accountId',
      accountId
    );
    return all
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  // ═══════════════════════════════════════════════════════════
  // CARDS METHODS
  // ═══════════════════════════════════════════════════════════

  async saveCards(cards: Card[]): Promise<void> {
    const db = this._ensureDb();
    const tx = db.transaction('cards', 'readwrite');
    await Promise.all([...cards.map((card) => tx.store.put(card)), tx.done]);
  }

  async getCards(userId: string): Promise<Card[]> {
    const db = this._ensureDb();
    return db.getAllFromIndex('cards', 'userId', userId);
  }

  // ═══════════════════════════════════════════════════════════
  // BENEFICIARIES METHODS
  // ═══════════════════════════════════════════════════════════

  async saveBeneficiaries(beneficiaries: Beneficiary[]): Promise<void> {
    const db = this._ensureDb();
    const tx = db.transaction('beneficiaries', 'readwrite');
    await Promise.all([
      ...beneficiaries.map((b) => tx.store.put(b)),
      tx.done,
    ]);
  }

  async getBeneficiaries(userId: string): Promise<Beneficiary[]> {
    const db = this._ensureDb();
    return db.getAllFromIndex('beneficiaries', 'userId', userId);
  }

  // ═══════════════════════════════════════════════════════════
  // PENDING TRANSFERS (OFFLINE QUEUE)
  // ═══════════════════════════════════════════════════════════

  async addPendingTransfer(transfer: Transfer): Promise<void> {
    const db = this._ensureDb();
    await db.put('pendingTransfers', transfer);
  }

  async getPendingTransfers(): Promise<Transfer[]> {
    const db = this._ensureDb();
    return db.getAll('pendingTransfers');
  }

  async removePendingTransfer(id: string): Promise<void> {
    const db = this._ensureDb();
    await db.delete('pendingTransfers', id);
  }

  async clearPendingTransfers(): Promise<void> {
    const db = this._ensureDb();
    await db.clear('pendingTransfers');
  }

  // ═══════════════════════════════════════════════════════════
  // CACHE METHODS
  // ═══════════════════════════════════════════════════════════

  async setCache<T>(
    key: string,
    value: T,
    ttlMs = 300000 // 5 minutes default
  ): Promise<void> {
    const db = this._ensureDb();
    await db.put('cache', {
      key,
      value,
      expiry: Date.now() + ttlMs,
    });
  }

  async getCache<T>(key: string): Promise<T | null> {
    const db = this._ensureDb();
    const cached = await db.get('cache', key);

    if (!cached) return null;

    if (Date.now() > cached.expiry) {
      await db.delete('cache', key);
      return null;
    }

    return cached.value as T;
  }

  async clearCache(): Promise<void> {
    const db = this._ensureDb();
    await db.clear('cache');
  }

  async clearExpiredCache(): Promise<void> {
    const db = this._ensureDb();
    const all = await db.getAll('cache');
    const now = Date.now();

    const tx = db.transaction('cache', 'readwrite');
    await Promise.all([
      ...all
        .filter((item) => now > item.expiry)
        .map((item) => tx.store.delete(item.key)),
      tx.done,
    ]);
  }

  // ═══════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════

  async clearAll(): Promise<void> {
    const db = this._ensureDb();
    await Promise.all([
      db.clear('user'),
      db.clear('accounts'),
      db.clear('transactions'),
      db.clear('transfers'),
      db.clear('cards'),
      db.clear('beneficiaries'),
      db.clear('pendingTransfers'),
      db.clear('cache'),
    ]);
  }

  async getStorageUsage(): Promise<{ used: number; available: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        available: estimate.quota || 0,
      };
    }
    return { used: 0, available: 0 };
  }
}

// Singleton instance
export const storageService = new StorageService();
export default storageService;

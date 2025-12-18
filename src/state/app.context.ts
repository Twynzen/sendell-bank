/* ═══════════════════════════════════════════════════════════════════════════
   SENDELLBANK APPLICATION CONTEXT
   Lit Context providers for global state management
   ═══════════════════════════════════════════════════════════════════════════ */

import { createContext } from '@lit/context';
import type { User, Account, Notification } from '../types';

// ═══════════════════════════════════════════════════════════
// USER CONTEXT
// ═══════════════════════════════════════════════════════════

export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  refreshToken: string | null;
  sessionExpiresAt: number | null;
}

export const initialUserState: UserState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  token: null,
  refreshToken: null,
  sessionExpiresAt: null,
};

export const userContext = createContext<UserState>('user-context');

// ═══════════════════════════════════════════════════════════
// ACCOUNTS CONTEXT
// ═══════════════════════════════════════════════════════════

export interface AccountsState {
  accounts: Account[];
  selectedAccountId: string | null;
  isLoading: boolean;
  error: string | null;
  totalBalance: number;
}

export const initialAccountsState: AccountsState = {
  accounts: [],
  selectedAccountId: null,
  isLoading: false,
  error: null,
  totalBalance: 0,
};

export const accountsContext = createContext<AccountsState>('accounts-context');

// ═══════════════════════════════════════════════════════════
// UI CONTEXT
// ═══════════════════════════════════════════════════════════

export interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  isMobile: boolean;
  currentRoute: string;
  isLoading: boolean;
  loadingMessage: string;
}

export const initialUIState: UIState = {
  theme: 'light',
  sidebarOpen: true,
  sidebarCollapsed: false,
  isMobile: false,
  currentRoute: '/',
  isLoading: false,
  loadingMessage: '',
};

export const uiContext = createContext<UIState>('ui-context');

// ═══════════════════════════════════════════════════════════
// NOTIFICATIONS CONTEXT
// ═══════════════════════════════════════════════════════════

export interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
}

export const initialNotificationsState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
};

export const notificationsContext = createContext<NotificationsState>('notifications-context');

// ═══════════════════════════════════════════════════════════
// CONTEXT PROVIDERS MIXIN
// ═══════════════════════════════════════════════════════════

import { LitElement } from 'lit';
import { provide } from '@lit/context';
import { property, state } from 'lit/decorators.js';

type Constructor<T = object> = new (...args: unknown[]) => T;

export function withUserContext<T extends Constructor<LitElement>>(Base: T) {
  return class extends Base {
    @provide({ context: userContext })
    @state()
    userState: UserState = { ...initialUserState };

    updateUserState(updates: Partial<UserState>) {
      this.userState = { ...this.userState, ...updates };
    }

    setUser(user: User | null, token?: string | null) {
      this.userState = {
        ...this.userState,
        user,
        token: token ?? null,
        isAuthenticated: !!user,
      };
    }

    clearUser() {
      this.userState = { ...initialUserState };
    }
  };
}

export function withAccountsContext<T extends Constructor<LitElement>>(Base: T) {
  return class extends Base {
    @provide({ context: accountsContext })
    @state()
    accountsState: AccountsState = { ...initialAccountsState };

    updateAccountsState(updates: Partial<AccountsState>) {
      this.accountsState = { ...this.accountsState, ...updates };
    }

    setAccounts(accounts: Account[]) {
      const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
      this.accountsState = {
        ...this.accountsState,
        accounts,
        totalBalance,
        selectedAccountId: this.accountsState.selectedAccountId || accounts[0]?.id || null,
      };
    }

    selectAccount(accountId: string) {
      this.accountsState = {
        ...this.accountsState,
        selectedAccountId: accountId,
      };
    }
  };
}

export function withUIContext<T extends Constructor<LitElement>>(Base: T) {
  return class extends Base {
    @provide({ context: uiContext })
    @state()
    uiState: UIState = { ...initialUIState };

    updateUIState(updates: Partial<UIState>) {
      this.uiState = { ...this.uiState, ...updates };
    }

    setTheme(theme: 'light' | 'dark' | 'system') {
      this.uiState = { ...this.uiState, theme };
      document.documentElement.setAttribute('data-theme', theme === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme
      );
      localStorage.setItem('theme', theme);
    }

    toggleSidebar() {
      this.uiState = {
        ...this.uiState,
        sidebarOpen: !this.uiState.sidebarOpen,
      };
    }

    setLoading(isLoading: boolean, message = '') {
      this.uiState = {
        ...this.uiState,
        isLoading,
        loadingMessage: message,
      };
    }
  };
}

// ═══════════════════════════════════════════════════════════
// CONTEXT CONSUMERS
// ═══════════════════════════════════════════════════════════

import { consume } from '@lit/context';

export function consumeUserContext<T extends Constructor<LitElement>>(Base: T) {
  return class extends Base {
    @consume({ context: userContext, subscribe: true })
    @property({ attribute: false })
    userState?: UserState;
  };
}

export function consumeAccountsContext<T extends Constructor<LitElement>>(Base: T) {
  return class extends Base {
    @consume({ context: accountsContext, subscribe: true })
    @property({ attribute: false })
    accountsState?: AccountsState;
  };
}

export function consumeUIContext<T extends Constructor<LitElement>>(Base: T) {
  return class extends Base {
    @consume({ context: uiContext, subscribe: true })
    @property({ attribute: false })
    uiState?: UIState;
  };
}

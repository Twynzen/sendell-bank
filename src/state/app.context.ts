/* ═══════════════════════════════════════════════════════════════════════════
   SENDELLBANK APPLICATION CONTEXT
   Lit Context providers for global state management
   ═══════════════════════════════════════════════════════════════════════════ */

import { createContext } from '@lit/context';
import { ContextProvider, ContextConsumer } from '@lit/context';
import { ReactiveController, ReactiveControllerHost } from 'lit';
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
// CONTEXT PROVIDER CONTROLLERS
// ═══════════════════════════════════════════════════════════

/**
 * User Context Provider Controller
 * Add to your root element to provide user state to the app
 */
export class UserContextProvider implements ReactiveController {
  host: ReactiveControllerHost;
  private provider: ContextProvider<typeof userContext>;
  private _state: UserState = { ...initialUserState };

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
    this.provider = new ContextProvider(host as HTMLElement, {
      context: userContext,
      initialValue: this._state,
    });
  }

  hostConnected() {}

  get state(): UserState {
    return this._state;
  }

  setState(updates: Partial<UserState>) {
    this._state = { ...this._state, ...updates };
    this.provider.setValue(this._state);
    this.host.requestUpdate();
  }

  setUser(user: User | null, token?: string | null) {
    this.setState({
      user,
      token: token ?? null,
      isAuthenticated: !!user,
    });
  }

  clearUser() {
    this.setState({ ...initialUserState });
  }
}

/**
 * Accounts Context Provider Controller
 */
export class AccountsContextProvider implements ReactiveController {
  host: ReactiveControllerHost;
  private provider: ContextProvider<typeof accountsContext>;
  private _state: AccountsState = { ...initialAccountsState };

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
    this.provider = new ContextProvider(host as HTMLElement, {
      context: accountsContext,
      initialValue: this._state,
    });
  }

  hostConnected() {}

  get state(): AccountsState {
    return this._state;
  }

  setState(updates: Partial<AccountsState>) {
    this._state = { ...this._state, ...updates };
    this.provider.setValue(this._state);
    this.host.requestUpdate();
  }

  setAccounts(accounts: Account[]) {
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    this.setState({
      accounts,
      totalBalance,
      selectedAccountId: this._state.selectedAccountId || accounts[0]?.id || null,
    });
  }

  selectAccount(accountId: string) {
    this.setState({ selectedAccountId: accountId });
  }
}

/**
 * UI Context Provider Controller
 */
export class UIContextProvider implements ReactiveController {
  host: ReactiveControllerHost;
  private provider: ContextProvider<typeof uiContext>;
  private _state: UIState = { ...initialUIState };

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
    this.provider = new ContextProvider(host as HTMLElement, {
      context: uiContext,
      initialValue: this._state,
    });
  }

  hostConnected() {}

  get state(): UIState {
    return this._state;
  }

  setState(updates: Partial<UIState>) {
    this._state = { ...this._state, ...updates };
    this.provider.setValue(this._state);
    this.host.requestUpdate();
  }

  setTheme(theme: 'light' | 'dark' | 'system') {
    this.setState({ theme });
    document.documentElement.setAttribute(
      'data-theme',
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme
    );
    localStorage.setItem('theme', theme);
  }

  toggleSidebar() {
    this.setState({ sidebarOpen: !this._state.sidebarOpen });
  }

  setLoading(isLoading: boolean, message = '') {
    this.setState({ isLoading, loadingMessage: message });
  }
}

// ═══════════════════════════════════════════════════════════
// CONTEXT CONSUMER CONTROLLERS
// ═══════════════════════════════════════════════════════════

/**
 * User Context Consumer Controller
 * Add to components that need to read user state
 */
export class UserContextConsumer implements ReactiveController {
  host: ReactiveControllerHost;
  private consumer: ContextConsumer<typeof userContext, ReactiveControllerHost>;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
    this.consumer = new ContextConsumer(host, {
      context: userContext,
      subscribe: true,
    });
  }

  hostConnected() {}

  get value(): UserState | undefined {
    return this.consumer.value;
  }
}

/**
 * Accounts Context Consumer Controller
 */
export class AccountsContextConsumer implements ReactiveController {
  host: ReactiveControllerHost;
  private consumer: ContextConsumer<typeof accountsContext, ReactiveControllerHost>;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
    this.consumer = new ContextConsumer(host, {
      context: accountsContext,
      subscribe: true,
    });
  }

  hostConnected() {}

  get value(): AccountsState | undefined {
    return this.consumer.value;
  }
}

/**
 * UI Context Consumer Controller
 */
export class UIContextConsumer implements ReactiveController {
  host: ReactiveControllerHost;
  private consumer: ContextConsumer<typeof uiContext, ReactiveControllerHost>;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
    this.consumer = new ContextConsumer(host, {
      context: uiContext,
      subscribe: true,
    });
  }

  hostConnected() {}

  get value(): UIState | undefined {
    return this.consumer.value;
  }
}

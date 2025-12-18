/* ═══════════════════════════════════════════════════════════════════════════
   SENDELLBANK EVENT BUS
   Centralized event management for cross-component communication
   ═══════════════════════════════════════════════════════════════════════════ */

type EventCallback<T = unknown> = (data: T) => void;

interface Subscription {
  unsubscribe: () => void;
}

/**
 * Event Bus for application-wide event communication
 * Implements the publish/subscribe pattern
 */
class EventBus {
  private _listeners: Map<string, Set<EventCallback>> = new Map();
  private _history: Map<string, unknown> = new Map();

  /**
   * Emit an event with optional data
   */
  emit<T>(eventName: string, data?: T): void {
    this._history.set(eventName, data);
    const listeners = this._listeners.get(eventName);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for "${eventName}":`, error);
        }
      });
    }
  }

  /**
   * Subscribe to an event
   */
  on<T>(eventName: string, callback: EventCallback<T>): Subscription {
    if (!this._listeners.has(eventName)) {
      this._listeners.set(eventName, new Set());
    }
    this._listeners.get(eventName)!.add(callback as EventCallback);

    return {
      unsubscribe: () => this.off(eventName, callback as EventCallback),
    };
  }

  /**
   * Subscribe to an event once
   */
  once<T>(eventName: string, callback: EventCallback<T>): Subscription {
    const wrapper: EventCallback<T> = (data) => {
      this.off(eventName, wrapper as EventCallback);
      callback(data);
    };
    return this.on(eventName, wrapper);
  }

  /**
   * Unsubscribe from an event
   */
  off(eventName: string, callback: EventCallback): void {
    this._listeners.get(eventName)?.delete(callback);
  }

  /**
   * Remove all listeners for an event
   */
  clear(eventName?: string): void {
    if (eventName) {
      this._listeners.delete(eventName);
    } else {
      this._listeners.clear();
    }
  }

  /**
   * Get the last emitted value for an event
   */
  getLastValue<T>(eventName: string): T | undefined {
    return this._history.get(eventName) as T | undefined;
  }

  /**
   * Check if there are listeners for an event
   */
  hasListeners(eventName: string): boolean {
    return (this._listeners.get(eventName)?.size ?? 0) > 0;
  }
}

// Singleton instance
export const eventBus = new EventBus();

// Event names as constants for type safety
export const AppEvents = {
  // Authentication events
  AUTH_LOGIN_SUCCESS: 'auth:login-success',
  AUTH_LOGIN_FAILED: 'auth:login-failed',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_SESSION_EXPIRED: 'auth:session-expired',
  AUTH_OTP_REQUIRED: 'auth:otp-required',
  AUTH_OTP_VERIFIED: 'auth:otp-verified',

  // Account events
  ACCOUNT_BALANCE_UPDATED: 'account:balance-updated',
  ACCOUNT_SELECTED: 'account:selected',

  // Transfer events
  TRANSFER_INITIATED: 'transfer:initiated',
  TRANSFER_COMPLETED: 'transfer:completed',
  TRANSFER_FAILED: 'transfer:failed',
  TRANSFER_CANCELLED: 'transfer:cancelled',

  // Card events
  CARD_STATUS_CHANGED: 'card:status-changed',
  CARD_BLOCKED: 'card:blocked',
  CARD_UNBLOCKED: 'card:unblocked',

  // Notification events
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',

  // UI events
  THEME_CHANGED: 'theme:changed',
  SIDEBAR_TOGGLED: 'sidebar:toggled',
  MODAL_OPENED: 'modal:opened',
  MODAL_CLOSED: 'modal:closed',

  // Navigation events
  ROUTE_CHANGED: 'route:changed',
  NAVIGATION_START: 'navigation:start',
  NAVIGATION_END: 'navigation:end',
} as const;

// Type for event payloads
export interface EventPayloads {
  [AppEvents.AUTH_LOGIN_SUCCESS]: { user: { id: string; name: string } };
  [AppEvents.AUTH_LOGOUT]: void;
  [AppEvents.AUTH_SESSION_EXPIRED]: { message: string };
  [AppEvents.ACCOUNT_BALANCE_UPDATED]: { accountId: string; balance: number };
  [AppEvents.TRANSFER_COMPLETED]: { transferId: string; amount: number };
  [AppEvents.THEME_CHANGED]: { theme: 'light' | 'dark' };
  [AppEvents.NOTIFICATION_NEW]: {
    id: string;
    type: string;
    message: string;
  };
}

// Typed event emitter helper
export function emitEvent<K extends keyof EventPayloads>(
  event: K,
  data: EventPayloads[K]
): void {
  eventBus.emit(event, data);
}

// Typed event listener helper
export function onEvent<K extends keyof EventPayloads>(
  event: K,
  callback: EventCallback<EventPayloads[K]>
): Subscription {
  return eventBus.on(event, callback);
}

export default eventBus;

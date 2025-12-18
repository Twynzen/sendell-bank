/* ═══════════════════════════════════════════════════════════════════════════
   STATE MANAGEMENT - BARREL EXPORT
   ═══════════════════════════════════════════════════════════════════════════ */

// Event Bus
export { eventBus, AppEvents, emitEvent, onEvent } from './event-bus';
export type { EventPayloads } from './event-bus';

// Contexts
export {
  // User context
  userContext,
  initialUserState,
  withUserContext,
  consumeUserContext,
  // Accounts context
  accountsContext,
  initialAccountsState,
  withAccountsContext,
  consumeAccountsContext,
  // UI context
  uiContext,
  initialUIState,
  withUIContext,
  consumeUIContext,
  // Notifications context
  notificationsContext,
  initialNotificationsState,
} from './app.context';

export type {
  UserState,
  AccountsState,
  UIState,
  NotificationsState,
} from './app.context';

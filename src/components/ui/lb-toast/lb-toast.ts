import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastConfig {
  id?: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
  closable?: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
}

interface ToastItem extends ToastConfig {
  id: string;
  visible: boolean;
}

/**
 * SendellBank Toast Container Component
 * @element lb-toast-container
 *
 * Use this as a singleton in your app to show toast notifications
 */
@customElement('lb-toast-container')
export class LbToastContainer extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      z-index: var(--lb-z-toast);
      pointer-events: none;
    }

    /* Positions */
    :host([position="top-right"]) {
      top: var(--lb-space-4);
      right: var(--lb-space-4);
    }

    :host([position="top-left"]) {
      top: var(--lb-space-4);
      left: var(--lb-space-4);
    }

    :host([position="bottom-right"]) {
      bottom: var(--lb-space-4);
      right: var(--lb-space-4);
    }

    :host([position="bottom-left"]) {
      bottom: var(--lb-space-4);
      left: var(--lb-space-4);
    }

    :host([position="top-center"]) {
      top: var(--lb-space-4);
      left: 50%;
      transform: translateX(-50%);
    }

    :host([position="bottom-center"]) {
      bottom: var(--lb-space-4);
      left: 50%;
      transform: translateX(-50%);
    }

    .toast-list {
      display: flex;
      flex-direction: column;
      gap: var(--lb-space-3);
    }

    :host([position^="bottom"]) .toast-list {
      flex-direction: column-reverse;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: var(--lb-space-3);
      min-width: 320px;
      max-width: 420px;
      padding: var(--lb-space-4);
      background: var(--lb-color-surface);
      border-radius: var(--lb-radius-lg);
      box-shadow: var(--lb-shadow-lg);
      border-left: 4px solid;
      pointer-events: auto;
      opacity: 0;
      transform: translateX(100%);
      transition: all var(--lb-transition-normal);
    }

    :host([position$="-left"]) .toast {
      transform: translateX(-100%);
    }

    :host([position$="-center"]) .toast {
      transform: translateY(-20px);
    }

    .toast.visible {
      opacity: 1;
      transform: translateX(0) translateY(0);
    }

    .toast.removing {
      opacity: 0;
      transform: translateX(100%);
    }

    /* Types */
    .toast-success {
      border-color: var(--lb-color-success);
    }

    .toast-success .icon {
      color: var(--lb-color-success);
    }

    .toast-error {
      border-color: var(--lb-color-error);
    }

    .toast-error .icon {
      color: var(--lb-color-error);
    }

    .toast-warning {
      border-color: var(--lb-color-warning);
    }

    .toast-warning .icon {
      color: var(--lb-color-warning);
    }

    .toast-info {
      border-color: var(--lb-color-info);
    }

    .toast-info .icon {
      color: var(--lb-color-info);
    }

    .icon {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .content {
      flex: 1;
      min-width: 0;
    }

    .title {
      font-weight: var(--lb-font-weight-semibold);
      color: var(--lb-color-text-primary);
      margin-bottom: var(--lb-space-1);
    }

    .message {
      font-size: var(--lb-font-size-sm);
      color: var(--lb-color-text-secondary);
      word-wrap: break-word;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: var(--lb-space-2);
      margin-top: var(--lb-space-2);
    }

    .action-button {
      font-size: var(--lb-font-size-sm);
      font-weight: var(--lb-font-weight-medium);
      color: var(--lb-color-primary-500);
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
    }

    .action-button:hover {
      text-decoration: underline;
    }

    .close-button {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: var(--lb-radius-md);
      cursor: pointer;
      color: var(--lb-color-text-tertiary);
      transition: all var(--lb-transition-fast);
    }

    .close-button:hover {
      background: var(--lb-color-neutral-100);
      color: var(--lb-color-text-primary);
    }

    /* Progress bar */
    .progress {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--lb-color-neutral-200);
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      background: currentColor;
      animation: progress linear forwards;
    }

    @keyframes progress {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }
  `;

  @property({ type: String, reflect: true }) position: ToastPosition = 'top-right';

  @state() private _toasts: ToastItem[] = [];

  private _counter = 0;

  private _icons: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  render() {
    return html`
      <div class="toast-list">
        ${this._toasts.map(
          (toast) => html`
            <div
              class=${classMap({
                toast: true,
                [`toast-${toast.type}`]: true,
                visible: toast.visible,
              })}
              role="alert"
            >
              <span class="icon">${this._icons[toast.type]}</span>

              <div class="content">
                ${toast.title
                  ? html`<div class="title">${toast.title}</div>`
                  : ''}
                <div class="message">${toast.message}</div>

                ${toast.action
                  ? html`
                      <div class="actions">
                        <button
                          class="action-button"
                          @click=${() => {
                            toast.action?.handler();
                            this._removeToast(toast.id);
                          }}
                        >
                          ${toast.action.label}
                        </button>
                      </div>
                    `
                  : ''}
              </div>

              ${toast.closable !== false
                ? html`
                    <button
                      class="close-button"
                      @click=${() => this._removeToast(toast.id)}
                      aria-label="Cerrar"
                    >
                      ✕
                    </button>
                  `
                : ''}

              ${toast.duration
                ? html`
                    <div class="progress">
                      <div
                        class="progress-bar"
                        style="animation-duration: ${toast.duration}ms"
                      ></div>
                    </div>
                  `
                : ''}
            </div>
          `
        )}
      </div>
    `;
  }

  show(config: ToastConfig): string {
    const id = config.id || `toast-${++this._counter}`;
    const duration = config.duration ?? 5000;

    const toast: ToastItem = {
      ...config,
      id,
      duration,
      visible: false,
    };

    this._toasts = [...this._toasts, toast];

    // Trigger enter animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this._toasts = this._toasts.map((t) =>
          t.id === id ? { ...t, visible: true } : t
        );
      });
    });

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        this._removeToast(id);
      }, duration);
    }

    return id;
  }

  private _removeToast(id: string) {
    // Trigger exit animation
    this._toasts = this._toasts.map((t) =>
      t.id === id ? { ...t, visible: false } : t
    );

    // Remove after animation
    setTimeout(() => {
      this._toasts = this._toasts.filter((t) => t.id !== id);
    }, 300);
  }

  dismiss(id: string) {
    this._removeToast(id);
  }

  dismissAll() {
    this._toasts.forEach((t) => this._removeToast(t.id));
  }

  // Convenience methods
  success(message: string, options?: Partial<ToastConfig>) {
    return this.show({ ...options, type: 'success', message });
  }

  error(message: string, options?: Partial<ToastConfig>) {
    return this.show({ ...options, type: 'error', message });
  }

  warning(message: string, options?: Partial<ToastConfig>) {
    return this.show({ ...options, type: 'warning', message });
  }

  info(message: string, options?: Partial<ToastConfig>) {
    return this.show({ ...options, type: 'info', message });
  }
}

// Singleton helper
let toastContainer: LbToastContainer | null = null;

export function getToastContainer(): LbToastContainer {
  if (!toastContainer) {
    toastContainer = document.createElement('lb-toast-container') as LbToastContainer;
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export const toast = {
  show: (config: ToastConfig) => getToastContainer().show(config),
  success: (message: string, options?: Partial<ToastConfig>) =>
    getToastContainer().success(message, options),
  error: (message: string, options?: Partial<ToastConfig>) =>
    getToastContainer().error(message, options),
  warning: (message: string, options?: Partial<ToastConfig>) =>
    getToastContainer().warning(message, options),
  info: (message: string, options?: Partial<ToastConfig>) =>
    getToastContainer().info(message, options),
  dismiss: (id: string) => getToastContainer().dismiss(id),
  dismissAll: () => getToastContainer().dismissAll(),
};

declare global {
  interface HTMLElementTagNameMap {
    'lb-toast-container': LbToastContainer;
  }
}

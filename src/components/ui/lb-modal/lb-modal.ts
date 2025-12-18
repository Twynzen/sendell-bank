import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * SendellBank Modal Component
 * @element lb-modal
 *
 * @slot - Default slot for modal content
 * @slot header - Slot for modal header
 * @slot footer - Slot for modal footer
 *
 * @fires lb-open - Emitted when modal opens
 * @fires lb-close - Emitted when modal closes
 * @fires lb-cancel - Emitted when modal is cancelled (ESC or backdrop click)
 *
 * @csspart backdrop - The backdrop element
 * @csspart dialog - The dialog element
 * @csspart header - The header element
 * @csspart content - The content element
 * @csspart footer - The footer element
 */
@customElement('lb-modal')
export class LbModal extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: var(--lb-z-modal-backdrop);
      opacity: 0;
      visibility: hidden;
      transition: opacity var(--lb-transition-normal),
        visibility var(--lb-transition-normal);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--lb-space-4);
    }

    .backdrop.open {
      opacity: 1;
      visibility: visible;
    }

    .dialog {
      background: var(--lb-color-surface);
      border-radius: var(--lb-radius-xl);
      box-shadow: var(--lb-shadow-modal);
      z-index: var(--lb-z-modal);
      max-height: calc(100vh - var(--lb-space-8));
      display: flex;
      flex-direction: column;
      transform: scale(0.95) translateY(20px);
      opacity: 0;
      transition: transform var(--lb-transition-normal),
        opacity var(--lb-transition-normal);
      overflow: hidden;
    }

    .backdrop.open .dialog {
      transform: scale(1) translateY(0);
      opacity: 1;
    }

    /* Sizes */
    .size-sm .dialog {
      width: 100%;
      max-width: 360px;
    }

    .size-md .dialog {
      width: 100%;
      max-width: 480px;
    }

    .size-lg .dialog {
      width: 100%;
      max-width: 640px;
    }

    .size-xl .dialog {
      width: 100%;
      max-width: 800px;
    }

    .size-full .dialog {
      width: calc(100vw - var(--lb-space-8));
      height: calc(100vh - var(--lb-space-8));
      max-width: none;
      max-height: none;
    }

    /* Header */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--lb-space-4) var(--lb-space-6);
      border-bottom: 1px solid var(--lb-color-border-light);
      flex-shrink: 0;
    }

    .header-content {
      flex: 1;
    }

    .title {
      font-size: var(--lb-font-size-xl);
      font-weight: var(--lb-font-weight-semibold);
      color: var(--lb-color-text-primary);
      margin: 0;
    }

    .close-button {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      border-radius: var(--lb-radius-md);
      cursor: pointer;
      color: var(--lb-color-text-secondary);
      transition: all var(--lb-transition-fast);
      margin-left: var(--lb-space-4);
      flex-shrink: 0;
    }

    .close-button:hover {
      background: var(--lb-color-neutral-100);
      color: var(--lb-color-text-primary);
    }

    .close-button:focus-visible {
      outline: var(--lb-ring-width) solid var(--lb-ring-color);
    }

    /* Content */
    .content {
      flex: 1;
      overflow-y: auto;
      padding: var(--lb-space-6);
    }

    /* Footer */
    .footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--lb-space-3);
      padding: var(--lb-space-4) var(--lb-space-6);
      border-top: 1px solid var(--lb-color-border-light);
      background: var(--lb-color-surface-variant);
      flex-shrink: 0;
    }

    .footer:empty {
      display: none;
    }

    /* Scrollbar */
    .content::-webkit-scrollbar {
      width: 6px;
    }

    .content::-webkit-scrollbar-track {
      background: transparent;
    }

    .content::-webkit-scrollbar-thumb {
      background: var(--lb-color-neutral-300);
      border-radius: var(--lb-radius-full);
    }

    /* Prevent body scroll when modal is open */
    :host([open]) {
      /* Add to body via JS */
    }
  `;

  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: String }) modalTitle = '';
  @property({ type: String }) size: ModalSize = 'md';
  @property({ type: Boolean }) hideClose = false;
  @property({ type: Boolean }) persistent = false; // Don't close on backdrop/ESC

  @state() private _isAnimating = false;

  private _previouslyFocusedElement: HTMLElement | null = null;

  connectedCallback() {
    super.connectedCallback();
    this._handleKeydown = this._handleKeydown.bind(this);
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('open')) {
      if (this.open) {
        this._onOpen();
      } else {
        this._onClose();
      }
    }
  }

  private _onOpen() {
    this._previouslyFocusedElement = document.activeElement as HTMLElement;
    document.addEventListener('keydown', this._handleKeydown);
    document.body.style.overflow = 'hidden';

    this.dispatchEvent(
      new CustomEvent('lb-open', {
        bubbles: true,
        composed: true,
      })
    );

    // Focus first focusable element
    requestAnimationFrame(() => {
      const firstFocusable = this.shadowRoot?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusable?.focus();
    });
  }

  private _onClose() {
    document.removeEventListener('keydown', this._handleKeydown);
    document.body.style.overflow = '';

    this._previouslyFocusedElement?.focus();

    this.dispatchEvent(
      new CustomEvent('lb-close', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && !this.persistent) {
      this._handleCancel();
    }

    // Trap focus
    if (e.key === 'Tab') {
      const focusableElements = this.shadowRoot?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements && focusableElements.length > 0) {
        const first = focusableElements[0] as HTMLElement;
        const last = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }

  private _handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget && !this.persistent) {
      this._handleCancel();
    }
  }

  private _handleCancel() {
    this.dispatchEvent(
      new CustomEvent('lb-cancel', {
        bubbles: true,
        composed: true,
      })
    );
    this.close();
  }

  render() {
    const backdropClasses = {
      backdrop: true,
      open: this.open,
      [`size-${this.size}`]: true,
    };

    return html`
      <div
        part="backdrop"
        class=${classMap(backdropClasses)}
        @click=${this._handleBackdropClick}
      >
        <div
          part="dialog"
          class="dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby=${this.modalTitle ? 'modal-title' : ''}
        >
          <header class="header" part="header">
            <div class="header-content">
              ${this.modalTitle
                ? html`<h2 id="modal-title" class="title">${this.modalTitle}</h2>`
                : ''}
              <slot name="header"></slot>
            </div>
            ${!this.hideClose
              ? html`
                  <button
                    class="close-button"
                    @click=${this._handleCancel}
                    aria-label="Cerrar"
                  >
                    ✕
                  </button>
                `
              : ''}
          </header>

          <div class="content" part="content">
            <slot></slot>
          </div>

          <footer class="footer" part="footer">
            <slot name="footer"></slot>
          </footer>
        </div>
      </div>
    `;
  }

  // Public methods
  show() {
    this.open = true;
  }

  close() {
    this.open = false;
  }

  toggle() {
    this.open = !this.open;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lb-modal': LbModal;
  }
}

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * SendellBank Button Component
 * @element lb-button
 *
 * @slot - Default slot for button content
 * @slot prefix - Slot for prefix icon
 * @slot suffix - Slot for suffix icon
 *
 * @fires lb-click - Emitted when button is clicked
 *
 * @csspart button - The button element
 */
@customElement('lb-button')
export class LbButton extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }

    :host([fullWidth]) {
      display: block;
      width: 100%;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--lb-space-2);
      font-family: var(--lb-font-family-base);
      font-weight: var(--lb-font-weight-medium);
      border: 2px solid transparent;
      border-radius: var(--lb-radius-md);
      cursor: pointer;
      transition: all var(--lb-transition-fast);
      text-decoration: none;
      white-space: nowrap;
      user-select: none;
      position: relative;
      overflow: hidden;
    }

    button::before {
      content: '';
      position: absolute;
      inset: 0;
      background: currentColor;
      opacity: 0;
      transition: opacity var(--lb-transition-fast);
    }

    button:hover::before {
      opacity: 0.08;
    }

    button:active::before {
      opacity: 0.12;
    }

    /* Sizes */
    .size-sm {
      padding: var(--lb-space-1) var(--lb-space-3);
      font-size: var(--lb-font-size-sm);
      min-height: 32px;
    }

    .size-md {
      padding: var(--lb-space-2) var(--lb-space-4);
      font-size: var(--lb-font-size-md);
      min-height: 40px;
    }

    .size-lg {
      padding: var(--lb-space-3) var(--lb-space-6);
      font-size: var(--lb-font-size-lg);
      min-height: 48px;
    }

    /* Variants */
    .variant-primary {
      background: var(--lb-color-primary-500);
      color: var(--lb-color-text-inverse);
    }

    .variant-primary:hover:not(:disabled) {
      background: var(--lb-color-primary-600);
    }

    .variant-primary:active:not(:disabled) {
      background: var(--lb-color-primary-700);
    }

    .variant-secondary {
      background: var(--lb-color-neutral-200);
      color: var(--lb-color-text-primary);
    }

    .variant-secondary:hover:not(:disabled) {
      background: var(--lb-color-neutral-300);
    }

    .variant-outline {
      background: transparent;
      border-color: var(--lb-color-primary-500);
      color: var(--lb-color-primary-500);
    }

    .variant-outline:hover:not(:disabled) {
      background: var(--lb-color-primary-50);
    }

    .variant-ghost {
      background: transparent;
      color: var(--lb-color-primary-500);
    }

    .variant-ghost:hover:not(:disabled) {
      background: var(--lb-color-primary-50);
    }

    .variant-danger {
      background: var(--lb-color-error);
      color: var(--lb-color-text-inverse);
    }

    .variant-danger:hover:not(:disabled) {
      background: var(--lb-color-error-dark);
    }

    .variant-success {
      background: var(--lb-color-success);
      color: var(--lb-color-text-inverse);
    }

    .variant-success:hover:not(:disabled) {
      background: var(--lb-color-success-dark);
    }

    /* States */
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    button:disabled::before {
      display: none;
    }

    .full-width {
      width: 100%;
    }

    /* Focus */
    button:focus-visible {
      outline: var(--lb-ring-width) solid var(--lb-ring-color);
      outline-offset: var(--lb-ring-offset);
    }

    /* Loading */
    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }

    .size-sm .spinner {
      width: 14px;
      height: 14px;
    }

    .size-lg .spinner {
      width: 22px;
      height: 22px;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .loading-content {
      opacity: 0;
    }

    /* Icon only */
    .icon-only {
      padding: var(--lb-space-2);
      aspect-ratio: 1;
    }

    .icon-only.size-sm {
      padding: var(--lb-space-1);
    }

    .icon-only.size-lg {
      padding: var(--lb-space-3);
    }

    /* Slots */
    ::slotted([slot="prefix"]),
    ::slotted([slot="suffix"]) {
      display: flex;
      align-items: center;
    }
  `;

  @property({ type: String }) variant: ButtonVariant = 'primary';
  @property({ type: String }) size: ButtonSize = 'md';
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) loading = false;
  @property({ type: Boolean, reflect: true }) fullWidth = false;
  @property({ type: Boolean }) iconOnly = false;
  @property({ type: String }) type: 'button' | 'submit' | 'reset' = 'button';

  render() {
    const classes = {
      [`variant-${this.variant}`]: true,
      [`size-${this.size}`]: true,
      'full-width': this.fullWidth,
      'icon-only': this.iconOnly,
    };

    return html`
      <button
        part="button"
        class=${classMap(classes)}
        type=${this.type}
        ?disabled=${this.disabled || this.loading}
        @click=${this._handleClick}
      >
        ${this.loading
          ? html`<span class="spinner"></span>`
          : html`
              <slot name="prefix"></slot>
              <span class=${this.loading ? 'loading-content' : ''}>
                <slot></slot>
              </span>
              <slot name="suffix"></slot>
            `}
      </button>
    `;
  }

  private _handleClick(e: Event) {
    if (this.disabled || this.loading) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    this.dispatchEvent(
      new CustomEvent('lb-click', {
        bubbles: true,
        composed: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lb-button': LbButton;
  }
}

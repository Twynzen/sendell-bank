import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'interactive';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * SendellBank Card Component
 * @element lb-card
 *
 * @slot - Default slot for card content
 * @slot header - Slot for card header
 * @slot footer - Slot for card footer
 * @slot media - Slot for card media (image/video)
 *
 * @fires lb-click - Emitted when interactive card is clicked
 *
 * @csspart card - The card container
 * @csspart header - The card header
 * @csspart content - The card content
 * @csspart footer - The card footer
 */
@customElement('lb-card')
export class LbCard extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .card {
      background: var(--lb-card-background);
      border-radius: var(--lb-radius-lg);
      overflow: hidden;
      transition: all var(--lb-transition-normal);
    }

    /* Variants */
    .variant-default {
      border: 1px solid var(--lb-card-border);
    }

    .variant-outlined {
      border: 1px solid var(--lb-color-border);
      background: transparent;
    }

    .variant-elevated {
      box-shadow: var(--lb-shadow-card);
      border: none;
    }

    .variant-interactive {
      border: 1px solid var(--lb-card-border);
      cursor: pointer;
    }

    .variant-interactive:hover {
      border-color: var(--lb-color-primary-300);
      box-shadow: var(--lb-shadow-md);
      transform: translateY(-2px);
    }

    .variant-interactive:active {
      transform: translateY(0);
    }

    /* Padding */
    .padding-none .content {
      padding: 0;
    }

    .padding-sm .content {
      padding: var(--lb-space-3);
    }

    .padding-md .content {
      padding: var(--lb-space-4);
    }

    .padding-lg .content {
      padding: var(--lb-space-6);
    }

    /* Header */
    .header {
      padding: var(--lb-space-4);
      border-bottom: 1px solid var(--lb-color-border-light);
    }

    .header:empty {
      display: none;
    }

    ::slotted([slot="header"]) {
      display: block;
    }

    /* Media */
    .media {
      width: 100%;
      overflow: hidden;
    }

    .media:empty {
      display: none;
    }

    ::slotted([slot="media"]) {
      width: 100%;
      display: block;
    }

    /* Content */
    .content {
      padding: var(--lb-space-4);
    }

    /* Footer */
    .footer {
      padding: var(--lb-space-4);
      border-top: 1px solid var(--lb-color-border-light);
      background: var(--lb-color-surface-variant);
    }

    .footer:empty {
      display: none;
    }

    /* Full height */
    .full-height {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .full-height .content {
      flex: 1;
    }

    /* Clickable state */
    .card:focus-visible {
      outline: var(--lb-ring-width) solid var(--lb-ring-color);
      outline-offset: var(--lb-ring-offset);
    }

    /* Loading state */
    .loading {
      position: relative;
      pointer-events: none;
    }

    .loading::after {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Disabled */
    .disabled {
      opacity: 0.6;
      pointer-events: none;
    }
  `;

  @property({ type: String }) variant: CardVariant = 'default';
  @property({ type: String }) padding: CardPadding = 'md';
  @property({ type: Boolean }) fullHeight = false;
  @property({ type: Boolean }) loading = false;
  @property({ type: Boolean }) disabled = false;

  render() {
    const classes = {
      card: true,
      [`variant-${this.variant}`]: true,
      [`padding-${this.padding}`]: true,
      'full-height': this.fullHeight,
      loading: this.loading,
      disabled: this.disabled,
    };

    const isInteractive = this.variant === 'interactive';

    return html`
      <div
        part="card"
        class=${classMap(classes)}
        role=${isInteractive ? 'button' : 'article'}
        tabindex=${isInteractive ? '0' : '-1'}
        @click=${isInteractive ? this._handleClick : null}
        @keydown=${isInteractive ? this._handleKeydown : null}
      >
        <div class="header" part="header">
          <slot name="header"></slot>
        </div>

        <div class="media">
          <slot name="media"></slot>
        </div>

        <div class="content" part="content">
          <slot></slot>
        </div>

        <div class="footer" part="footer">
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }

  private _handleClick() {
    if (this.disabled || this.loading) return;

    this.dispatchEvent(
      new CustomEvent('lb-click', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._handleClick();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lb-card': LbCard;
  }
}

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

/**
 * SendellBank Badge Component
 * @element lb-badge
 *
 * @slot - Default slot for badge content
 */
@customElement('lb-badge')
export class LbBadge extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: var(--lb-font-family-base);
      font-weight: var(--lb-font-weight-medium);
      border-radius: var(--lb-radius-full);
      white-space: nowrap;
    }

    /* Sizes */
    .size-sm {
      font-size: var(--lb-font-size-xs);
      padding: 2px var(--lb-space-2);
      min-width: 18px;
      height: 18px;
    }

    .size-md {
      font-size: var(--lb-font-size-sm);
      padding: var(--lb-space-1) var(--lb-space-3);
      min-width: 22px;
      height: 22px;
    }

    .size-lg {
      font-size: var(--lb-font-size-md);
      padding: var(--lb-space-2) var(--lb-space-4);
      min-width: 28px;
      height: 28px;
    }

    /* Variants */
    .variant-default {
      background: var(--lb-color-neutral-200);
      color: var(--lb-color-text-primary);
    }

    .variant-primary {
      background: var(--lb-color-primary-100);
      color: var(--lb-color-primary-700);
    }

    .variant-success {
      background: var(--lb-color-success-light);
      color: var(--lb-color-success);
    }

    .variant-warning {
      background: var(--lb-color-warning-light);
      color: var(--lb-color-warning);
    }

    .variant-error {
      background: var(--lb-color-error-light);
      color: var(--lb-color-error);
    }

    .variant-info {
      background: var(--lb-color-info-light);
      color: var(--lb-color-info);
    }

    /* Pill style */
    .pill {
      border-radius: var(--lb-radius-md);
    }

    /* Dot indicator */
    .dot {
      width: 8px;
      height: 8px;
      min-width: 8px;
      padding: 0;
      border-radius: var(--lb-radius-full);
    }

    .dot.size-sm {
      width: 6px;
      height: 6px;
      min-width: 6px;
    }

    .dot.size-lg {
      width: 10px;
      height: 10px;
      min-width: 10px;
    }

    .dot.variant-default { background: var(--lb-color-neutral-400); }
    .dot.variant-primary { background: var(--lb-color-primary-500); }
    .dot.variant-success { background: var(--lb-color-success); }
    .dot.variant-warning { background: var(--lb-color-warning); }
    .dot.variant-error { background: var(--lb-color-error); }
    .dot.variant-info { background: var(--lb-color-info); }

    /* Pulsing animation for dot */
    .dot.pulse {
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `;

  @property({ type: String }) variant: BadgeVariant = 'default';
  @property({ type: String }) size: BadgeSize = 'md';
  @property({ type: Boolean }) pill = false;
  @property({ type: Boolean }) dot = false;
  @property({ type: Boolean }) pulse = false;

  render() {
    const classes = {
      badge: true,
      [`variant-${this.variant}`]: true,
      [`size-${this.size}`]: true,
      pill: this.pill,
      dot: this.dot,
      pulse: this.pulse && this.dot,
    };

    return html`
      <span class=${classMap(classes)}>
        ${this.dot ? '' : html`<slot></slot>`}
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lb-badge': LbBadge;
  }
}

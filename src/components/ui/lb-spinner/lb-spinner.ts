import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'default' | 'primary' | 'light';

/**
 * SendellBank Spinner Component
 * @element lb-spinner
 *
 * @csspart spinner - The spinner element
 */
@customElement('lb-spinner')
export class LbSpinner extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .spinner-container {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .spinner {
      border-radius: 50%;
      border-style: solid;
      animation: spin 0.8s linear infinite;
    }

    /* Sizes */
    .size-xs {
      width: 16px;
      height: 16px;
      border-width: 2px;
    }

    .size-sm {
      width: 24px;
      height: 24px;
      border-width: 2px;
    }

    .size-md {
      width: 32px;
      height: 32px;
      border-width: 3px;
    }

    .size-lg {
      width: 48px;
      height: 48px;
      border-width: 4px;
    }

    .size-xl {
      width: 64px;
      height: 64px;
      border-width: 5px;
    }

    /* Variants */
    .variant-default {
      border-color: var(--lb-color-neutral-200);
      border-top-color: var(--lb-color-primary-500);
    }

    .variant-primary {
      border-color: var(--lb-color-primary-200);
      border-top-color: var(--lb-color-primary-600);
    }

    .variant-light {
      border-color: rgba(255, 255, 255, 0.3);
      border-top-color: white;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* Full screen overlay */
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(255, 255, 255, 0.8);
      z-index: var(--lb-z-modal);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--lb-space-4);
    }

    [data-theme="dark"] .overlay {
      background: rgba(0, 0, 0, 0.8);
    }

    .overlay-text {
      color: var(--lb-color-text-secondary);
      font-size: var(--lb-font-size-md);
    }

    /* Inline with text */
    .with-text {
      display: inline-flex;
      align-items: center;
      gap: var(--lb-space-2);
    }

    .text {
      color: var(--lb-color-text-secondary);
      font-size: var(--lb-font-size-sm);
    }
  `;

  @property({ type: String }) size: SpinnerSize = 'md';
  @property({ type: String }) variant: SpinnerVariant = 'default';
  @property({ type: Boolean }) overlay = false;
  @property({ type: String }) text = '';

  render() {
    const spinnerClasses = {
      spinner: true,
      [`size-${this.size}`]: true,
      [`variant-${this.variant}`]: true,
    };

    if (this.overlay) {
      return html`
        <div class="overlay">
          <div part="spinner" class=${classMap(spinnerClasses)}></div>
          ${this.text
            ? html`<span class="overlay-text">${this.text}</span>`
            : ''}
        </div>
      `;
    }

    if (this.text) {
      return html`
        <div class="with-text">
          <div part="spinner" class=${classMap(spinnerClasses)}></div>
          <span class="text">${this.text}</span>
        </div>
      `;
    }

    return html`
      <div class="spinner-container">
        <div part="spinner" class=${classMap(spinnerClasses)}></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lb-spinner': LbSpinner;
  }
}

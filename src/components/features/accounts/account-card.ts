import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { Account } from '../../../types';
import { formatCurrency, formatAccountNumber } from '../../../utils/formatters';

/**
 * SendellBank Account Card Component
 * @element account-card
 *
 * Displays a single account with balance and quick actions
 */
@customElement('account-card')
export class AccountCard extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .account-card {
      background: var(--lb-color-surface);
      border: 1px solid var(--lb-color-border);
      border-radius: var(--lb-radius-xl);
      padding: var(--lb-space-5);
      transition: all var(--lb-transition-normal);
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .account-card:hover {
      border-color: var(--lb-color-primary-300);
      box-shadow: var(--lb-shadow-md);
      transform: translateY(-2px);
    }

    .account-card.selected {
      border-color: var(--lb-color-primary-500);
      box-shadow: 0 0 0 3px var(--lb-color-primary-100);
    }

    .account-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--lb-gradient-primary);
      opacity: 0;
      transition: opacity var(--lb-transition-fast);
    }

    .account-card:hover::before,
    .account-card.selected::before {
      opacity: 1;
    }

    /* Header */
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--lb-space-4);
    }

    .account-type {
      display: flex;
      align-items: center;
      gap: var(--lb-space-2);
    }

    .type-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--lb-radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .type-icon.savings {
      background: var(--lb-color-success-light);
    }

    .type-icon.checking {
      background: var(--lb-color-info-light);
    }

    .type-icon.investment {
      background: var(--lb-color-warning-light);
    }

    .type-icon.credit {
      background: var(--lb-color-error-light);
    }

    .type-info {
      display: flex;
      flex-direction: column;
    }

    .type-label {
      font-size: var(--lb-font-size-xs);
      color: var(--lb-color-text-tertiary);
      text-transform: uppercase;
      letter-spacing: var(--lb-letter-spacing-wide);
    }

    .account-alias {
      font-size: var(--lb-font-size-md);
      font-weight: var(--lb-font-weight-semibold);
      color: var(--lb-color-text-primary);
    }

    .main-badge {
      background: var(--lb-color-primary-100);
      color: var(--lb-color-primary-700);
      font-size: var(--lb-font-size-xs);
      padding: var(--lb-space-1) var(--lb-space-2);
      border-radius: var(--lb-radius-full);
      font-weight: var(--lb-font-weight-medium);
    }

    /* Balance */
    .balance-section {
      margin-bottom: var(--lb-space-4);
    }

    .balance-label {
      font-size: var(--lb-font-size-sm);
      color: var(--lb-color-text-secondary);
      margin-bottom: var(--lb-space-1);
    }

    .balance-amount {
      font-size: var(--lb-font-size-3xl);
      font-weight: var(--lb-font-weight-bold);
      color: var(--lb-color-text-primary);
      font-family: var(--lb-font-family-mono);
    }

    .available {
      font-size: var(--lb-font-size-sm);
      color: var(--lb-color-text-tertiary);
      margin-top: var(--lb-space-1);
    }

    .available-amount {
      color: var(--lb-color-success);
      font-weight: var(--lb-font-weight-medium);
    }

    /* Footer */
    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: var(--lb-space-4);
      border-top: 1px solid var(--lb-color-border-light);
    }

    .account-number {
      font-size: var(--lb-font-size-sm);
      color: var(--lb-color-text-tertiary);
      font-family: var(--lb-font-family-mono);
    }

    .quick-actions {
      display: flex;
      gap: var(--lb-space-2);
    }

    .action-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: var(--lb-color-neutral-100);
      border-radius: var(--lb-radius-md);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      transition: all var(--lb-transition-fast);
    }

    .action-btn:hover {
      background: var(--lb-color-primary-100);
      color: var(--lb-color-primary-600);
    }

    /* Compact variant */
    :host([compact]) .account-card {
      padding: var(--lb-space-3);
    }

    :host([compact]) .balance-amount {
      font-size: var(--lb-font-size-xl);
    }

    :host([compact]) .card-footer {
      display: none;
    }
  `;

  @property({ type: Object }) account!: Account;
  @property({ type: Boolean }) selected = false;
  @property({ type: Boolean, reflect: true }) compact = false;

  private _typeIcons: Record<string, string> = {
    savings: '🐷',
    checking: '💳',
    investment: '📈',
    credit: '💸',
  };

  private _typeLabels: Record<string, string> = {
    savings: 'Cuenta de Ahorros',
    checking: 'Cuenta Corriente',
    investment: 'Inversión',
    credit: 'Crédito',
  };

  render() {
    if (!this.account) return html``;

    const cardClasses = {
      'account-card': true,
      selected: this.selected,
    };

    return html`
      <div
        class=${classMap(cardClasses)}
        @click=${this._handleClick}
        role="button"
        tabindex="0"
        @keydown=${this._handleKeydown}
      >
        <div class="card-header">
          <div class="account-type">
            <div class="type-icon ${this.account.type}">
              ${this._typeIcons[this.account.type] || '💰'}
            </div>
            <div class="type-info">
              <span class="type-label">
                ${this._typeLabels[this.account.type] || this.account.type}
              </span>
              <span class="account-alias">${this.account.alias}</span>
            </div>
          </div>
          ${this.account.isMain
            ? html`<span class="main-badge">Principal</span>`
            : ''}
        </div>

        <div class="balance-section">
          <div class="balance-label">Saldo actual</div>
          <div class="balance-amount">
            ${formatCurrency(this.account.balance, this.account.currency)}
          </div>
          <div class="available">
            Disponible:
            <span class="available-amount">
              ${formatCurrency(
                this.account.availableBalance,
                this.account.currency
              )}
            </span>
          </div>
        </div>

        <div class="card-footer">
          <span class="account-number">
            ${formatAccountNumber(this.account.number)}
          </span>
          <div class="quick-actions">
            <button
              class="action-btn"
              title="Transferir"
              @click=${this._handleTransfer}
            >
              ↗️
            </button>
            <button
              class="action-btn"
              title="Ver movimientos"
              @click=${this._handleViewHistory}
            >
              📋
            </button>
            <button
              class="action-btn"
              title="Más opciones"
              @click=${this._handleOptions}
            >
              ⋮
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private _handleClick() {
    this.dispatchEvent(
      new CustomEvent('account-select', {
        detail: { account: this.account },
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

  private _handleTransfer(e: Event) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('account-action', {
        detail: { action: 'transfer', account: this.account },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleViewHistory(e: Event) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('account-action', {
        detail: { action: 'history', account: this.account },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleOptions(e: Event) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('account-action', {
        detail: { action: 'options', account: this.account },
        bubbles: true,
        composed: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'account-card': AccountCard;
  }
}

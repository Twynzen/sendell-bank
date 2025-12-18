import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Account, AccountSummary as AccountSummaryType } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';
import { accountsService } from '../../../services/accounts.service';

// Import components
import '../../ui/lb-spinner/lb-spinner';
import './account-card';

/**
 * SendellBank Account Summary Component
 * @element account-summary
 *
 * Displays total balance and list of accounts
 */
@customElement('account-summary')
export class AccountSummary extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .summary-container {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Total Balance Card */
    .total-balance-card {
      background: var(--lb-gradient-primary);
      border-radius: var(--lb-radius-2xl);
      padding: var(--lb-space-6);
      color: white;
      margin-bottom: var(--lb-space-6);
      position: relative;
      overflow: hidden;
    }

    .total-balance-card::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 300px;
      height: 300px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
    }

    .total-balance-card::after {
      content: '';
      position: absolute;
      bottom: -30%;
      left: -10%;
      width: 200px;
      height: 200px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 50%;
    }

    .balance-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 1;
    }

    .balance-title {
      font-size: var(--lb-font-size-sm);
      opacity: 0.9;
      margin-bottom: var(--lb-space-2);
    }

    .balance-amount {
      font-size: var(--lb-font-size-4xl);
      font-weight: var(--lb-font-weight-bold);
      font-family: var(--lb-font-family-mono);
      letter-spacing: var(--lb-letter-spacing-tight);
    }

    .balance-change {
      display: flex;
      align-items: center;
      gap: var(--lb-space-2);
      font-size: var(--lb-font-size-sm);
      margin-top: var(--lb-space-2);
      opacity: 0.9;
    }

    .change-positive {
      color: #4ade80;
    }

    .change-negative {
      color: #f87171;
    }

    .quick-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--lb-space-4);
      margin-top: var(--lb-space-6);
      padding-top: var(--lb-space-4);
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      z-index: 1;
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      font-size: var(--lb-font-size-xl);
      font-weight: var(--lb-font-weight-semibold);
      font-family: var(--lb-font-family-mono);
    }

    .stat-label {
      font-size: var(--lb-font-size-xs);
      opacity: 0.8;
      margin-top: var(--lb-space-1);
    }

    /* Section Header */
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--lb-space-4);
    }

    .section-title {
      font-size: var(--lb-font-size-lg);
      font-weight: var(--lb-font-weight-semibold);
      color: var(--lb-color-text-primary);
    }

    .view-all-link {
      color: var(--lb-color-primary-500);
      font-size: var(--lb-font-size-sm);
      text-decoration: none;
      cursor: pointer;
    }

    .view-all-link:hover {
      text-decoration: underline;
    }

    /* Accounts Grid */
    .accounts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--lb-space-4);
    }

    /* Loading & Error States */
    .loading-state,
    .error-state,
    .empty-state {
      text-align: center;
      padding: var(--lb-space-10);
    }

    .error-state {
      color: var(--lb-color-error);
    }

    .empty-state {
      color: var(--lb-color-text-secondary);
    }

    .error-icon,
    .empty-icon {
      font-size: 3rem;
      margin-bottom: var(--lb-space-4);
    }

    .retry-button {
      margin-top: var(--lb-space-4);
    }
  `;

  @property({ type: String }) selectedAccountId: string | null = null;

  @state() private _summary: AccountSummaryType | null = null;
  @state() private _isLoading = true;
  @state() private _error: string | null = null;

  connectedCallback() {
    super.connectedCallback();
    this._loadAccounts();
  }

  private async _loadAccounts() {
    this._isLoading = true;
    this._error = null;

    try {
      this._summary = await accountsService.getAccountsSummary();
      if (!this._summary) {
        this._error = 'No se pudieron cargar las cuentas';
      }
    } catch (error) {
      this._error = 'Error al cargar las cuentas';
    } finally {
      this._isLoading = false;
    }
  }

  render() {
    if (this._isLoading) {
      return this._renderLoading();
    }

    if (this._error) {
      return this._renderError();
    }

    if (!this._summary || this._summary.accounts.length === 0) {
      return this._renderEmpty();
    }

    return this._renderContent();
  }

  private _renderLoading() {
    return html`
      <div class="loading-state">
        <lb-spinner size="lg" text="Cargando tus cuentas..."></lb-spinner>
      </div>
    `;
  }

  private _renderError() {
    return html`
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <p>${this._error}</p>
        <lb-button
          class="retry-button"
          variant="outline"
          @click=${this._loadAccounts}
        >
          Reintentar
        </lb-button>
      </div>
    `;
  }

  private _renderEmpty() {
    return html`
      <div class="empty-state">
        <div class="empty-icon">🏦</div>
        <p>No tienes cuentas registradas</p>
      </div>
    `;
  }

  private _renderContent() {
    const summary = this._summary!;
    const income = 5000000; // Mock data - would come from transactions
    const expenses = 2500000;

    return html`
      <div class="summary-container">
        <div class="total-balance-card">
          <div class="balance-header">
            <div>
              <div class="balance-title">Saldo total</div>
              <div class="balance-amount">
                ${formatCurrency(summary.totalBalance, summary.currency)}
              </div>
              <div class="balance-change change-positive">
                <span>↑</span>
                <span>+2.4% este mes</span>
              </div>
            </div>
          </div>

          <div class="quick-stats">
            <div class="stat-item">
              <div class="stat-value">${summary.accounts.length}</div>
              <div class="stat-label">Cuentas</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">
                ${formatCurrency(income, summary.currency)}
              </div>
              <div class="stat-label">Ingresos</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">
                ${formatCurrency(expenses, summary.currency)}
              </div>
              <div class="stat-label">Gastos</div>
            </div>
          </div>
        </div>

        <div class="section-header">
          <h2 class="section-title">Mis Cuentas</h2>
          <a class="view-all-link" @click=${this._handleViewAll}>
            Ver todas →
          </a>
        </div>

        <div class="accounts-grid">
          ${summary.accounts.map(
            (account) => html`
              <account-card
                .account=${account}
                ?selected=${account.id === this.selectedAccountId}
                @account-select=${this._handleAccountSelect}
                @account-action=${this._handleAccountAction}
              ></account-card>
            `
          )}
        </div>
      </div>
    `;
  }

  private _handleAccountSelect(e: CustomEvent<{ account: Account }>) {
    this.selectedAccountId = e.detail.account.id;
    this.dispatchEvent(
      new CustomEvent('account-selected', {
        detail: { account: e.detail.account },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleAccountAction(
    e: CustomEvent<{ action: string; account: Account }>
  ) {
    this.dispatchEvent(
      new CustomEvent('account-action', {
        detail: e.detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleViewAll() {
    this.dispatchEvent(
      new CustomEvent('navigate', {
        detail: { path: '/accounts' },
        bubbles: true,
        composed: true,
      })
    );
  }

  // Public method to refresh
  async refresh() {
    await this._loadAccounts();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'account-summary': AccountSummary;
  }
}

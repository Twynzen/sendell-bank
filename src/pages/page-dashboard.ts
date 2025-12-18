import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Router } from '@vaadin/router';
import type { Account, Transaction } from '../types';
import { formatCurrency, formatRelativeTime } from '../utils/formatters';

// Import components
import '../components/ui/lb-card/lb-card';
import '../components/ui/lb-button/lb-button';
import '../components/ui/lb-spinner/lb-spinner';
import '../components/features/accounts/account-summary';

/**
 * SendellBank Dashboard Page
 * @element page-dashboard
 */
@customElement('page-dashboard')
export class PageDashboard extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .dashboard-container {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Page Header */
    .page-header {
      margin-bottom: var(--lb-space-6);
    }

    .greeting {
      font-size: var(--lb-font-size-3xl);
      font-weight: var(--lb-font-weight-bold);
      color: var(--lb-color-text-primary);
      margin-bottom: var(--lb-space-1);
    }

    .date-info {
      font-size: var(--lb-font-size-md);
      color: var(--lb-color-text-secondary);
    }

    /* Quick Actions */
    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--lb-space-4);
      margin-bottom: var(--lb-space-8);
    }

    .quick-action-card {
      background: var(--lb-color-surface);
      border: 1px solid var(--lb-color-border);
      border-radius: var(--lb-radius-lg);
      padding: var(--lb-space-4);
      text-align: center;
      cursor: pointer;
      transition: all var(--lb-transition-fast);
    }

    .quick-action-card:hover {
      border-color: var(--lb-color-primary-300);
      transform: translateY(-2px);
      box-shadow: var(--lb-shadow-md);
    }

    .quick-action-icon {
      width: 48px;
      height: 48px;
      background: var(--lb-color-primary-50);
      border-radius: var(--lb-radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      margin: 0 auto var(--lb-space-3);
    }

    .quick-action-label {
      font-size: var(--lb-font-size-sm);
      font-weight: var(--lb-font-weight-medium);
      color: var(--lb-color-text-primary);
    }

    /* Dashboard Grid */
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: var(--lb-space-6);
    }

    @media (max-width: 1024px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Sections */
    .section {
      margin-bottom: var(--lb-space-8);
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--lb-space-4);
    }

    .section-title {
      font-size: var(--lb-font-size-xl);
      font-weight: var(--lb-font-weight-semibold);
      color: var(--lb-color-text-primary);
    }

    .view-all {
      color: var(--lb-color-primary-500);
      font-size: var(--lb-font-size-sm);
      text-decoration: none;
      cursor: pointer;
    }

    .view-all:hover {
      text-decoration: underline;
    }

    /* Recent Transactions */
    .transactions-list {
      background: var(--lb-color-surface);
      border: 1px solid var(--lb-color-border);
      border-radius: var(--lb-radius-lg);
      overflow: hidden;
    }

    .transaction-item {
      display: flex;
      align-items: center;
      padding: var(--lb-space-4);
      border-bottom: 1px solid var(--lb-color-border-light);
      cursor: pointer;
      transition: background var(--lb-transition-fast);
    }

    .transaction-item:last-child {
      border-bottom: none;
    }

    .transaction-item:hover {
      background: var(--lb-color-hover);
    }

    .transaction-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--lb-radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      margin-right: var(--lb-space-3);
    }

    .transaction-icon.income {
      background: var(--lb-color-success-light);
    }

    .transaction-icon.expense {
      background: var(--lb-color-error-light);
    }

    .transaction-info {
      flex: 1;
      min-width: 0;
    }

    .transaction-description {
      font-size: var(--lb-font-size-md);
      font-weight: var(--lb-font-weight-medium);
      color: var(--lb-color-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .transaction-date {
      font-size: var(--lb-font-size-sm);
      color: var(--lb-color-text-tertiary);
    }

    .transaction-amount {
      font-size: var(--lb-font-size-md);
      font-weight: var(--lb-font-weight-semibold);
      font-family: var(--lb-font-family-mono);
    }

    .transaction-amount.positive {
      color: var(--lb-color-success);
    }

    .transaction-amount.negative {
      color: var(--lb-color-text-primary);
    }

    /* Sidebar Widgets */
    .sidebar-widget {
      background: var(--lb-color-surface);
      border: 1px solid var(--lb-color-border);
      border-radius: var(--lb-radius-lg);
      padding: var(--lb-space-5);
      margin-bottom: var(--lb-space-4);
    }

    .widget-title {
      font-size: var(--lb-font-size-lg);
      font-weight: var(--lb-font-weight-semibold);
      color: var(--lb-color-text-primary);
      margin-bottom: var(--lb-space-4);
    }

    /* Scheduled Payments */
    .payment-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--lb-space-3) 0;
      border-bottom: 1px solid var(--lb-color-border-light);
    }

    .payment-item:last-child {
      border-bottom: none;
    }

    .payment-name {
      font-size: var(--lb-font-size-sm);
      font-weight: var(--lb-font-weight-medium);
    }

    .payment-date {
      font-size: var(--lb-font-size-xs);
      color: var(--lb-color-text-tertiary);
    }

    .payment-amount {
      font-size: var(--lb-font-size-sm);
      font-weight: var(--lb-font-weight-semibold);
      font-family: var(--lb-font-family-mono);
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: var(--lb-space-8);
      color: var(--lb-color-text-secondary);
    }
  `;

  @state() private _userName = 'Daniel';
  @state() private _recentTransactions: Transaction[] = [];
  @state() private _isLoading = true;

  connectedCallback() {
    super.connectedCallback();
    this._loadDashboardData();
  }

  private async _loadDashboardData() {
    // Simulate loading
    setTimeout(() => {
      this._recentTransactions = [
        {
          id: 'tx-001',
          accountId: 'acc-001',
          type: 'transfer_in',
          category: 'salary',
          amount: 5000000,
          currency: 'COP',
          description: 'Pago nómina - Empresa XYZ',
          status: 'completed',
          date: new Date().toISOString(),
        },
        {
          id: 'tx-002',
          accountId: 'acc-001',
          type: 'payment',
          category: 'utilities',
          amount: -150000,
          currency: 'COP',
          description: 'Pago servicios públicos',
          status: 'completed',
          date: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'tx-003',
          accountId: 'acc-001',
          type: 'purchase',
          category: 'food',
          amount: -85000,
          currency: 'COP',
          description: 'Supermercado Éxito',
          status: 'completed',
          date: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: 'tx-004',
          accountId: 'acc-001',
          type: 'transfer_out',
          category: 'other',
          amount: -500000,
          currency: 'COP',
          description: 'Transferencia a Juan Pérez',
          status: 'completed',
          date: new Date(Date.now() - 259200000).toISOString(),
        },
      ];
      this._isLoading = false;
    }, 1000);
  }

  render() {
    const currentDate = new Date().toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return html`
      <div class="dashboard-container">
        ${this._renderHeader(currentDate)}
        ${this._renderQuickActions()}

        <div class="dashboard-grid">
          <div class="main-column">
            ${this._renderAccountsSummary()}
            ${this._renderRecentTransactions()}
          </div>
          <div class="sidebar-column">
            ${this._renderScheduledPayments()}
            ${this._renderSpendingInsights()}
          </div>
        </div>
      </div>
    `;
  }

  private _renderHeader(date: string) {
    return html`
      <div class="page-header">
        <h1 class="greeting">Hola, ${this._userName} 👋</h1>
        <p class="date-info">${date}</p>
      </div>
    `;
  }

  private _renderQuickActions() {
    const actions = [
      { icon: '↗️', label: 'Transferir', path: '/transfers/new' },
      { icon: '📱', label: 'Recargar', path: '/recharge' },
      { icon: '📄', label: 'Pagar', path: '/payments' },
      { icon: '📊', label: 'Historial', path: '/history' },
    ];

    return html`
      <div class="quick-actions">
        ${actions.map(
          (action) => html`
            <div
              class="quick-action-card"
              @click=${() => Router.go(action.path)}
            >
              <div class="quick-action-icon">${action.icon}</div>
              <div class="quick-action-label">${action.label}</div>
            </div>
          `
        )}
      </div>
    `;
  }

  private _renderAccountsSummary() {
    return html`
      <div class="section">
        <account-summary
          @account-selected=${this._handleAccountSelected}
          @account-action=${this._handleAccountAction}
          @navigate=${this._handleNavigate}
        ></account-summary>
      </div>
    `;
  }

  private _renderRecentTransactions() {
    return html`
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Movimientos Recientes</h2>
          <a class="view-all" @click=${() => Router.go('/history')}>
            Ver todos →
          </a>
        </div>

        ${this._isLoading
          ? html`
              <div class="transactions-list">
                <div class="empty-state">
                  <lb-spinner text="Cargando movimientos..."></lb-spinner>
                </div>
              </div>
            `
          : html`
              <div class="transactions-list">
                ${this._recentTransactions.length === 0
                  ? html`
                      <div class="empty-state">
                        No hay movimientos recientes
                      </div>
                    `
                  : this._recentTransactions.map((tx) =>
                      this._renderTransactionItem(tx)
                    )}
              </div>
            `}
      </div>
    `;
  }

  private _renderTransactionItem(tx: Transaction) {
    const isIncome = tx.amount > 0;

    return html`
      <div class="transaction-item" @click=${() => this._viewTransaction(tx)}>
        <div class="transaction-icon ${isIncome ? 'income' : 'expense'}">
          ${isIncome ? '↓' : '↑'}
        </div>
        <div class="transaction-info">
          <div class="transaction-description">${tx.description}</div>
          <div class="transaction-date">${formatRelativeTime(tx.date)}</div>
        </div>
        <div class="transaction-amount ${isIncome ? 'positive' : 'negative'}">
          ${isIncome ? '+' : ''}${formatCurrency(tx.amount, tx.currency)}
        </div>
      </div>
    `;
  }

  private _renderScheduledPayments() {
    const payments = [
      { name: 'Netflix', date: '25 de este mes', amount: 45900 },
      { name: 'Seguro de vida', date: '1 del próximo mes', amount: 150000 },
      { name: 'Cuota préstamo', date: '5 del próximo mes', amount: 850000 },
    ];

    return html`
      <div class="sidebar-widget">
        <h3 class="widget-title">📅 Pagos Programados</h3>
        ${payments.map(
          (payment) => html`
            <div class="payment-item">
              <div>
                <div class="payment-name">${payment.name}</div>
                <div class="payment-date">${payment.date}</div>
              </div>
              <div class="payment-amount">
                ${formatCurrency(payment.amount, 'COP')}
              </div>
            </div>
          `
        )}
      </div>
    `;
  }

  private _renderSpendingInsights() {
    return html`
      <div class="sidebar-widget">
        <h3 class="widget-title">💡 Resumen del Mes</h3>
        <p style="color: var(--lb-color-text-secondary); font-size: var(--lb-font-size-sm);">
          Has gastado un <strong style="color: var(--lb-color-success);">12% menos</strong>
          que el mes pasado en compras de supermercado.
        </p>
        <lb-button
          variant="ghost"
          size="sm"
          style="margin-top: var(--lb-space-3);"
          @click=${() => Router.go('/insights')}
        >
          Ver análisis completo →
        </lb-button>
      </div>
    `;
  }

  private _handleAccountSelected(e: CustomEvent<{ account: Account }>) {
    Router.go(`/accounts/${e.detail.account.id}`);
  }

  private _handleAccountAction(
    e: CustomEvent<{ action: string; account: Account }>
  ) {
    const { action, account } = e.detail;
    switch (action) {
      case 'transfer':
        Router.go(`/transfers/new?from=${account.id}`);
        break;
      case 'history':
        Router.go(`/accounts/${account.id}/history`);
        break;
    }
  }

  private _handleNavigate(e: CustomEvent<{ path: string }>) {
    Router.go(e.detail.path);
  }

  private _viewTransaction(tx: Transaction) {
    Router.go(`/history?tx=${tx.id}`);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'page-dashboard': PageDashboard;
  }
}

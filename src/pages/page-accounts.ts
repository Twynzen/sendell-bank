import { LitElement, html, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { Router, RouterLocation } from '@vaadin/router';
import type { Account } from '../types';
import { accountsService } from '../services/accounts.service';
import { formatCurrency, formatAccountNumber } from '../utils/formatters';

// Import components
import '../components/ui/lb-card/lb-card';
import '../components/ui/lb-button/lb-button';
import '../components/ui/lb-spinner/lb-spinner';
import '../components/ui/lb-tabs/lb-tabs';
import '../components/features/accounts/account-card';

/**
 * SendellBank Accounts Page
 * @element page-accounts
 */
@customElement('page-accounts')
export class PageAccounts extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .page-header {
      margin-bottom: var(--lb-space-6);
    }

    .page-title {
      font-size: var(--lb-font-size-3xl);
      font-weight: var(--lb-font-weight-bold);
      color: var(--lb-color-text-primary);
      margin-bottom: var(--lb-space-2);
    }

    .page-subtitle {
      font-size: var(--lb-font-size-md);
      color: var(--lb-color-text-secondary);
    }

    /* Accounts Grid */
    .accounts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: var(--lb-space-4);
      margin-bottom: var(--lb-space-8);
    }

    /* Account Detail */
    .account-detail {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: var(--lb-space-6);
    }

    @media (max-width: 1024px) {
      .account-detail {
        grid-template-columns: 1fr;
      }
    }

    .detail-card {
      background: var(--lb-color-surface);
      border: 1px solid var(--lb-color-border);
      border-radius: var(--lb-radius-xl);
      overflow: hidden;
    }

    .detail-header {
      background: var(--lb-gradient-primary);
      color: white;
      padding: var(--lb-space-6);
    }

    .detail-type {
      font-size: var(--lb-font-size-sm);
      opacity: 0.9;
      margin-bottom: var(--lb-space-2);
    }

    .detail-alias {
      font-size: var(--lb-font-size-2xl);
      font-weight: var(--lb-font-weight-bold);
      margin-bottom: var(--lb-space-1);
    }

    .detail-number {
      font-size: var(--lb-font-size-sm);
      font-family: var(--lb-font-family-mono);
      opacity: 0.9;
    }

    .detail-balance {
      padding: var(--lb-space-6);
      text-align: center;
      border-bottom: 1px solid var(--lb-color-border-light);
    }

    .balance-label {
      font-size: var(--lb-font-size-sm);
      color: var(--lb-color-text-secondary);
      margin-bottom: var(--lb-space-1);
    }

    .balance-amount {
      font-size: var(--lb-font-size-4xl);
      font-weight: var(--lb-font-weight-bold);
      font-family: var(--lb-font-family-mono);
      color: var(--lb-color-text-primary);
    }

    .detail-actions {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--lb-space-3);
      padding: var(--lb-space-4);
    }

    .action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--lb-space-2);
      padding: var(--lb-space-3);
      background: var(--lb-color-surface-variant);
      border: none;
      border-radius: var(--lb-radius-md);
      cursor: pointer;
      transition: all var(--lb-transition-fast);
    }

    .action-btn:hover {
      background: var(--lb-color-primary-50);
    }

    .action-icon {
      font-size: 1.5rem;
    }

    .action-label {
      font-size: var(--lb-font-size-xs);
      color: var(--lb-color-text-secondary);
    }

    /* Transactions Section */
    .transactions-section {
      background: var(--lb-color-surface);
      border: 1px solid var(--lb-color-border);
      border-radius: var(--lb-radius-xl);
      overflow: hidden;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--lb-space-4) var(--lb-space-5);
      border-bottom: 1px solid var(--lb-color-border-light);
    }

    .section-title {
      font-size: var(--lb-font-size-lg);
      font-weight: var(--lb-font-weight-semibold);
    }

    /* Back button */
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: var(--lb-space-2);
      color: var(--lb-color-primary-500);
      font-size: var(--lb-font-size-sm);
      text-decoration: none;
      cursor: pointer;
      margin-bottom: var(--lb-space-4);
    }

    .back-link:hover {
      text-decoration: underline;
    }

    /* Loading */
    .loading-container {
      display: flex;
      justify-content: center;
      padding: var(--lb-space-10);
    }
  `;

  @property({ type: Object }) location?: RouterLocation;

  @state() private _accounts: Account[] = [];
  @state() private _selectedAccount: Account | null = null;
  @state() private _isLoading = true;

  connectedCallback() {
    super.connectedCallback();
    this._loadAccounts();
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('location')) {
      const accountId = this.location?.params?.id as string;
      if (accountId) {
        this._selectAccountById(accountId);
      } else {
        this._selectedAccount = null;
      }
    }
  }

  private async _loadAccounts() {
    this._isLoading = true;
    try {
      this._accounts = await accountsService.getAccounts();

      // Check if we need to show detail
      const accountId = this.location?.params?.id as string;
      if (accountId) {
        this._selectAccountById(accountId);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      this._isLoading = false;
    }
  }

  private _selectAccountById(id: string) {
    this._selectedAccount =
      this._accounts.find((acc) => acc.id === id) || null;
  }

  render() {
    if (this._isLoading) {
      return html`
        <div class="loading-container">
          <lb-spinner size="lg" text="Cargando cuentas..."></lb-spinner>
        </div>
      `;
    }

    if (this._selectedAccount) {
      return this._renderAccountDetail();
    }

    return this._renderAccountsList();
  }

  private _renderAccountsList() {
    return html`
      <div class="page-header">
        <h1 class="page-title">Mis Cuentas</h1>
        <p class="page-subtitle">
          Administra tus cuentas y revisa los movimientos
        </p>
      </div>

      <div class="accounts-grid">
        ${this._accounts.map(
          (account) => html`
            <account-card
              .account=${account}
              @account-select=${() => this._viewAccountDetail(account)}
              @account-action=${(
                e: CustomEvent<{ action: string; account: Account }>
              ) => this._handleAccountAction(e.detail.action, e.detail.account)}
            ></account-card>
          `
        )}
      </div>
    `;
  }

  private _renderAccountDetail() {
    const account = this._selectedAccount!;
    const typeLabels: Record<string, string> = {
      savings: 'Cuenta de Ahorros',
      checking: 'Cuenta Corriente',
      investment: 'Inversión',
      credit: 'Crédito',
    };

    return html`
      <a class="back-link" @click=${this._goBack}>
        ← Volver a mis cuentas
      </a>

      <div class="account-detail">
        <div>
          <div class="detail-card">
            <div class="detail-header">
              <div class="detail-type">
                ${typeLabels[account.type] || account.type}
              </div>
              <div class="detail-alias">${account.alias}</div>
              <div class="detail-number">
                ${formatAccountNumber(account.number, false)}
              </div>
            </div>

            <div class="detail-balance">
              <div class="balance-label">Saldo disponible</div>
              <div class="balance-amount">
                ${formatCurrency(account.availableBalance, account.currency)}
              </div>
            </div>

            <div class="detail-actions">
              <button
                class="action-btn"
                @click=${() => this._handleAccountAction('transfer', account)}
              >
                <span class="action-icon">↗️</span>
                <span class="action-label">Transferir</span>
              </button>
              <button
                class="action-btn"
                @click=${() => this._handleAccountAction('download', account)}
              >
                <span class="action-icon">📄</span>
                <span class="action-label">Extracto</span>
              </button>
              <button
                class="action-btn"
                @click=${() => this._handleAccountAction('settings', account)}
              >
                <span class="action-icon">⚙️</span>
                <span class="action-label">Configurar</span>
              </button>
            </div>
          </div>

          <div class="transactions-section" style="margin-top: var(--lb-space-4);">
            <div class="section-header">
              <h3 class="section-title">Últimos Movimientos</h3>
              <lb-button
                variant="ghost"
                size="sm"
                @click=${() => Router.go('/history?account=' + account.id)}
              >
                Ver todos
              </lb-button>
            </div>
            <div style="padding: var(--lb-space-8); text-align: center; color: var(--lb-color-text-secondary);">
              Los movimientos aparecerán aquí
            </div>
          </div>
        </div>

        <div>
          <div class="detail-card" style="padding: var(--lb-space-5);">
            <h3 style="font-size: var(--lb-font-size-lg); font-weight: var(--lb-font-weight-semibold); margin-bottom: var(--lb-space-4);">
              Información de la Cuenta
            </h3>

            <div style="display: flex; flex-direction: column; gap: var(--lb-space-3);">
              <div>
                <div style="font-size: var(--lb-font-size-sm); color: var(--lb-color-text-tertiary);">
                  Número de cuenta
                </div>
                <div style="font-family: var(--lb-font-family-mono);">
                  ${account.number}
                </div>
              </div>
              <div>
                <div style="font-size: var(--lb-font-size-sm); color: var(--lb-color-text-tertiary);">
                  Tipo de cuenta
                </div>
                <div>${typeLabels[account.type]}</div>
              </div>
              <div>
                <div style="font-size: var(--lb-font-size-sm); color: var(--lb-color-text-tertiary);">
                  Moneda
                </div>
                <div>${account.currency}</div>
              </div>
              <div>
                <div style="font-size: var(--lb-font-size-sm); color: var(--lb-color-text-tertiary);">
                  Estado
                </div>
                <div style="color: var(--lb-color-success);">
                  ● ${account.status === 'active' ? 'Activa' : account.status}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private _viewAccountDetail(account: Account) {
    Router.go(`/accounts/${account.id}`);
  }

  private _goBack() {
    Router.go('/accounts');
  }

  private _handleAccountAction(action: string, account: Account) {
    switch (action) {
      case 'transfer':
        Router.go(`/transfers/new?from=${account.id}`);
        break;
      case 'history':
        Router.go(`/history?account=${account.id}`);
        break;
      case 'download':
        // Download statement
        break;
      case 'settings':
        // Account settings
        break;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'page-accounts': PageAccounts;
  }
}

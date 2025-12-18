import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { Transaction, TransactionFilter } from '../types';
import { formatCurrency, formatTransactionDate } from '../utils/formatters';

// Import components
import '../components/ui/lb-card/lb-card';
import '../components/ui/lb-button/lb-button';
import '../components/ui/lb-input/lb-input';
import '../components/ui/lb-select/lb-select';
import '../components/ui/lb-spinner/lb-spinner';

/**
 * SendellBank History Page
 * @element page-history
 */
@customElement('page-history')
export class PageHistory extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
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

    /* Filters Section */
    .filters-section {
      background: var(--lb-color-surface);
      border: 1px solid var(--lb-color-border);
      border-radius: var(--lb-radius-xl);
      padding: var(--lb-space-4);
      margin-bottom: var(--lb-space-6);
    }

    .filters-row {
      display: flex;
      gap: var(--lb-space-4);
      flex-wrap: wrap;
    }

    .filter-item {
      flex: 1;
      min-width: 150px;
    }

    .search-input {
      flex: 2;
      min-width: 250px;
    }

    /* Transactions List */
    .transactions-container {
      background: var(--lb-color-surface);
      border: 1px solid var(--lb-color-border);
      border-radius: var(--lb-radius-xl);
      overflow: hidden;
    }

    .transaction-group {
      border-bottom: 1px solid var(--lb-color-border-light);
    }

    .transaction-group:last-child {
      border-bottom: none;
    }

    .group-header {
      padding: var(--lb-space-3) var(--lb-space-4);
      background: var(--lb-color-surface-variant);
      font-size: var(--lb-font-size-sm);
      font-weight: var(--lb-font-weight-medium);
      color: var(--lb-color-text-secondary);
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
      width: 48px;
      height: 48px;
      border-radius: var(--lb-radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      margin-right: var(--lb-space-4);
      flex-shrink: 0;
    }

    .transaction-icon.income {
      background: var(--lb-color-success-light);
    }

    .transaction-icon.expense {
      background: var(--lb-color-neutral-100);
    }

    .transaction-info {
      flex: 1;
      min-width: 0;
    }

    .transaction-description {
      font-size: var(--lb-font-size-md);
      font-weight: var(--lb-font-weight-medium);
      color: var(--lb-color-text-primary);
      margin-bottom: var(--lb-space-1);
    }

    .transaction-meta {
      display: flex;
      gap: var(--lb-space-3);
      font-size: var(--lb-font-size-sm);
      color: var(--lb-color-text-tertiary);
    }

    .transaction-category {
      background: var(--lb-color-neutral-100);
      padding: 2px 8px;
      border-radius: var(--lb-radius-full);
    }

    .transaction-amount {
      text-align: right;
      flex-shrink: 0;
      margin-left: var(--lb-space-4);
    }

    .amount-value {
      font-size: var(--lb-font-size-lg);
      font-weight: var(--lb-font-weight-semibold);
      font-family: var(--lb-font-family-mono);
    }

    .amount-value.positive {
      color: var(--lb-color-success);
    }

    .amount-value.negative {
      color: var(--lb-color-text-primary);
    }

    .transaction-status {
      font-size: var(--lb-font-size-xs);
      color: var(--lb-color-text-tertiary);
      margin-top: var(--lb-space-1);
    }

    /* Pagination */
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: var(--lb-space-4);
      padding: var(--lb-space-4);
      border-top: 1px solid var(--lb-color-border-light);
    }

    .pagination-info {
      font-size: var(--lb-font-size-sm);
      color: var(--lb-color-text-secondary);
    }

    /* Empty & Loading states */
    .empty-state,
    .loading-state {
      text-align: center;
      padding: var(--lb-space-10);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: var(--lb-space-4);
    }

    /* Export dropdown */
    .export-actions {
      display: flex;
      gap: var(--lb-space-2);
    }

    /* Stats summary */
    .stats-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--lb-space-4);
      margin-bottom: var(--lb-space-6);
    }

    .stat-card {
      background: var(--lb-color-surface);
      border: 1px solid var(--lb-color-border);
      border-radius: var(--lb-radius-lg);
      padding: var(--lb-space-4);
    }

    .stat-label {
      font-size: var(--lb-font-size-sm);
      color: var(--lb-color-text-secondary);
      margin-bottom: var(--lb-space-1);
    }

    .stat-value {
      font-size: var(--lb-font-size-2xl);
      font-weight: var(--lb-font-weight-bold);
      font-family: var(--lb-font-family-mono);
    }

    .stat-value.income {
      color: var(--lb-color-success);
    }

    .stat-value.expense {
      color: var(--lb-color-text-primary);
    }
  `;

  @state() private _transactions: Transaction[] = [];
  @state() private _isLoading = true;
  @state() private _filter: TransactionFilter = {};
  @state() private _searchQuery = '';
  @state() private _page = 1;
  @state() private _totalPages = 3;

  private _categoryIcons: Record<string, string> = {
    salary: '💰',
    food: '🍽️',
    transport: '🚗',
    utilities: '💡',
    entertainment: '🎬',
    shopping: '🛍️',
    health: '🏥',
    education: '📚',
    travel: '✈️',
    other: '📌',
  };

  private _categoryLabels: Record<string, string> = {
    salary: 'Salario',
    food: 'Alimentación',
    transport: 'Transporte',
    utilities: 'Servicios',
    entertainment: 'Entretenimiento',
    shopping: 'Compras',
    health: 'Salud',
    education: 'Educación',
    travel: 'Viajes',
    other: 'Otros',
  };

  connectedCallback() {
    super.connectedCallback();
    this._loadTransactions();
  }

  private _loadTransactions() {
    this._isLoading = true;

    // Simulate API call
    setTimeout(() => {
      this._transactions = [
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
          description: 'Pago servicios públicos - EPM',
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
          date: new Date(Date.now() - 86400000).toISOString(),
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
          date: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: 'tx-005',
          accountId: 'acc-001',
          type: 'purchase',
          category: 'transport',
          amount: -45000,
          currency: 'COP',
          description: 'Uber - Viaje al aeropuerto',
          status: 'completed',
          date: new Date(Date.now() - 259200000).toISOString(),
        },
        {
          id: 'tx-006',
          accountId: 'acc-001',
          type: 'purchase',
          category: 'entertainment',
          amount: -65000,
          currency: 'COP',
          description: 'Netflix - Suscripción mensual',
          status: 'completed',
          date: new Date(Date.now() - 345600000).toISOString(),
        },
      ];
      this._isLoading = false;
    }, 1000);
  }

  render() {
    return html`
      <div class="page-header">
        <div>
          <h1 class="page-title">Historial de Movimientos</h1>
          <p class="page-subtitle">Consulta y exporta tus transacciones</p>
        </div>
        <div class="export-actions">
          <lb-button variant="outline" size="sm" @click=${this._exportCSV}>
            📄 Exportar CSV
          </lb-button>
        </div>
      </div>

      ${this._renderStatsSummary()}
      ${this._renderFilters()}

      ${this._isLoading
        ? this._renderLoading()
        : this._transactions.length === 0
        ? this._renderEmpty()
        : this._renderTransactionsList()}
    `;
  }

  private _renderStatsSummary() {
    const income = this._transactions
      .filter((tx) => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const expenses = Math.abs(
      this._transactions
        .filter((tx) => tx.amount < 0)
        .reduce((sum, tx) => sum + tx.amount, 0)
    );

    return html`
      <div class="stats-summary">
        <div class="stat-card">
          <div class="stat-label">Ingresos del período</div>
          <div class="stat-value income">
            +${formatCurrency(income, 'COP')}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Gastos del período</div>
          <div class="stat-value expense">
            -${formatCurrency(expenses, 'COP')}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Balance</div>
          <div class="stat-value ${income - expenses >= 0 ? 'income' : 'expense'}">
            ${formatCurrency(income - expenses, 'COP')}
          </div>
        </div>
      </div>
    `;
  }

  private _renderFilters() {
    const typeOptions = [
      { value: '', label: 'Todos los tipos' },
      { value: 'transfer_in', label: 'Ingresos' },
      { value: 'transfer_out', label: 'Transferencias' },
      { value: 'payment', label: 'Pagos' },
      { value: 'purchase', label: 'Compras' },
    ];

    const categoryOptions = [
      { value: '', label: 'Todas las categorías' },
      ...Object.entries(this._categoryLabels).map(([value, label]) => ({
        value,
        label,
      })),
    ];

    return html`
      <div class="filters-section">
        <div class="filters-row">
          <div class="filter-item search-input">
            <lb-input
              placeholder="Buscar por descripción..."
              .value=${this._searchQuery}
              @lb-input=${(e: CustomEvent) =>
                (this._searchQuery = e.detail.value)}
              clearable
            >
              <span slot="prefix">🔍</span>
            </lb-input>
          </div>

          <div class="filter-item">
            <lb-select
              placeholder="Tipo"
              .options=${typeOptions}
              .value=${this._filter.type || ''}
              @lb-change=${(e: CustomEvent) =>
                (this._filter = { ...this._filter, type: e.detail.value })}
            ></lb-select>
          </div>

          <div class="filter-item">
            <lb-select
              placeholder="Categoría"
              .options=${categoryOptions}
              .value=${this._filter.category || ''}
              @lb-change=${(e: CustomEvent) =>
                (this._filter = { ...this._filter, category: e.detail.value })}
            ></lb-select>
          </div>

          <lb-button variant="outline" @click=${this._clearFilters}>
            Limpiar
          </lb-button>
        </div>
      </div>
    `;
  }

  private _renderLoading() {
    return html`
      <div class="loading-state">
        <lb-spinner size="lg" text="Cargando movimientos..."></lb-spinner>
      </div>
    `;
  }

  private _renderEmpty() {
    return html`
      <div class="transactions-container">
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <p>No hay movimientos para mostrar</p>
        </div>
      </div>
    `;
  }

  private _renderTransactionsList() {
    // Group transactions by date
    const grouped = this._groupTransactionsByDate();

    return html`
      <div class="transactions-container">
        ${Object.entries(grouped).map(
          ([date, transactions]) => html`
            <div class="transaction-group">
              <div class="group-header">${date}</div>
              ${transactions.map((tx) => this._renderTransaction(tx))}
            </div>
          `
        )}

        ${this._renderPagination()}
      </div>
    `;
  }

  private _groupTransactionsByDate(): Record<string, Transaction[]> {
    const groups: Record<string, Transaction[]> = {};

    this._transactions.forEach((tx) => {
      const date = new Date(tx.date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let key: string;
      if (date.toDateString() === today.toDateString()) {
        key = 'Hoy';
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = 'Ayer';
      } else {
        key = date.toLocaleDateString('es-CO', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        });
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(tx);
    });

    return groups;
  }

  private _renderTransaction(tx: Transaction) {
    const isIncome = tx.amount > 0;
    const category = tx.category || 'other';

    return html`
      <div class="transaction-item" @click=${() => this._viewDetail(tx)}>
        <div class="transaction-icon ${isIncome ? 'income' : 'expense'}">
          ${this._categoryIcons[category] || '📌'}
        </div>

        <div class="transaction-info">
          <div class="transaction-description">${tx.description}</div>
          <div class="transaction-meta">
            <span class="transaction-category">
              ${this._categoryLabels[category] || 'Otros'}
            </span>
            <span>${formatTransactionDate(tx.date)}</span>
          </div>
        </div>

        <div class="transaction-amount">
          <div class="amount-value ${isIncome ? 'positive' : 'negative'}">
            ${isIncome ? '+' : ''}${formatCurrency(tx.amount, tx.currency)}
          </div>
          <div class="transaction-status">
            ${tx.status === 'completed' ? '✓ Completada' : tx.status}
          </div>
        </div>
      </div>
    `;
  }

  private _renderPagination() {
    return html`
      <div class="pagination">
        <lb-button
          variant="ghost"
          size="sm"
          ?disabled=${this._page === 1}
          @click=${() => this._changePage(this._page - 1)}
        >
          ← Anterior
        </lb-button>

        <span class="pagination-info">
          Página ${this._page} de ${this._totalPages}
        </span>

        <lb-button
          variant="ghost"
          size="sm"
          ?disabled=${this._page === this._totalPages}
          @click=${() => this._changePage(this._page + 1)}
        >
          Siguiente →
        </lb-button>
      </div>
    `;
  }

  private _clearFilters() {
    this._filter = {};
    this._searchQuery = '';
  }

  private _changePage(page: number) {
    this._page = page;
    this._loadTransactions();
  }

  private _viewDetail(_tx: Transaction) {
    // Open transaction detail modal
    console.log('View transaction:', _tx);
  }

  private _exportCSV() {
    // Export transactions to CSV
    console.log('Export CSV');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'page-history': PageHistory;
  }
}

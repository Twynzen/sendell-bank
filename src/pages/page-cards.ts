import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { Card } from '../types';
import { toast } from '../components/ui/lb-toast/lb-toast';

// Import components
import '../components/ui/lb-card/lb-card';
import '../components/ui/lb-button/lb-button';
import '../components/ui/lb-modal/lb-modal';
import '../components/ui/lb-spinner/lb-spinner';

/**
 * SendellBank Cards Page
 * @element page-cards
 */
@customElement('page-cards')
export class PageCards extends LitElement {
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

    /* Cards Grid */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: var(--lb-space-6);
    }

    /* Card Visual */
    .card-container {
      perspective: 1000px;
    }

    .card-visual {
      width: 100%;
      aspect-ratio: 1.586;
      border-radius: var(--lb-radius-2xl);
      padding: var(--lb-space-5);
      position: relative;
      overflow: hidden;
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform var(--lb-transition-normal);
      cursor: pointer;
    }

    .card-visual:hover {
      transform: translateY(-4px);
    }

    .card-visual.visa {
      background: linear-gradient(135deg, #1a1f71 0%, #2b3990 100%);
    }

    .card-visual.mastercard {
      background: linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%);
    }

    .card-visual::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -30%;
      width: 300px;
      height: 300px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
    }

    .card-visual::after {
      content: '';
      position: absolute;
      bottom: -40%;
      left: -20%;
      width: 250px;
      height: 250px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 50%;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      position: relative;
      z-index: 1;
    }

    .card-type {
      font-size: var(--lb-font-size-sm);
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .card-chip {
      width: 50px;
      height: 38px;
      background: linear-gradient(135deg, #ffd700 0%, #b8860b 100%);
      border-radius: var(--lb-radius-sm);
    }

    .card-body {
      position: relative;
      z-index: 1;
    }

    .card-number {
      font-size: var(--lb-font-size-xl);
      font-family: var(--lb-font-family-mono);
      letter-spacing: 4px;
      margin-bottom: var(--lb-space-4);
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      position: relative;
      z-index: 1;
    }

    .card-holder {
      font-size: var(--lb-font-size-sm);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .card-expiry {
      text-align: right;
    }

    .expiry-label {
      font-size: var(--lb-font-size-xs);
      opacity: 0.8;
    }

    .expiry-value {
      font-size: var(--lb-font-size-md);
      font-family: var(--lb-font-family-mono);
    }

    .card-brand {
      position: absolute;
      bottom: var(--lb-space-5);
      right: var(--lb-space-5);
      font-size: 2rem;
      z-index: 1;
    }

    /* Card Status Badge */
    .card-status {
      position: absolute;
      top: var(--lb-space-3);
      right: var(--lb-space-3);
      padding: var(--lb-space-1) var(--lb-space-2);
      border-radius: var(--lb-radius-full);
      font-size: var(--lb-font-size-xs);
      font-weight: var(--lb-font-weight-semibold);
    }

    .card-status.active {
      background: var(--lb-color-success);
    }

    .card-status.blocked {
      background: var(--lb-color-error);
    }

    /* Card Actions Panel */
    .card-actions-panel {
      background: var(--lb-color-surface);
      border: 1px solid var(--lb-color-border);
      border-radius: var(--lb-radius-xl);
      padding: var(--lb-space-5);
      margin-top: var(--lb-space-4);
    }

    .panel-title {
      font-size: var(--lb-font-size-lg);
      font-weight: var(--lb-font-weight-semibold);
      margin-bottom: var(--lb-space-4);
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--lb-space-3);
    }

    .action-item {
      display: flex;
      align-items: center;
      gap: var(--lb-space-3);
      padding: var(--lb-space-3);
      border: 1px solid var(--lb-color-border-light);
      border-radius: var(--lb-radius-md);
      cursor: pointer;
      transition: all var(--lb-transition-fast);
    }

    .action-item:hover {
      background: var(--lb-color-hover);
      border-color: var(--lb-color-primary-300);
    }

    .action-item.danger:hover {
      background: var(--lb-color-error-light);
      border-color: var(--lb-color-error);
    }

    .action-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--lb-radius-md);
      background: var(--lb-color-surface-variant);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .action-info {
      flex: 1;
    }

    .action-label {
      font-weight: var(--lb-font-weight-medium);
      font-size: var(--lb-font-size-sm);
    }

    .action-desc {
      font-size: var(--lb-font-size-xs);
      color: var(--lb-color-text-tertiary);
    }

    /* Toggle Switch */
    .toggle-switch {
      position: relative;
      width: 48px;
      height: 24px;
      background: var(--lb-color-neutral-300);
      border-radius: var(--lb-radius-full);
      cursor: pointer;
      transition: background var(--lb-transition-fast);
    }

    .toggle-switch.active {
      background: var(--lb-color-success);
    }

    .toggle-switch::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: var(--lb-radius-full);
      transition: transform var(--lb-transition-fast);
      box-shadow: var(--lb-shadow-sm);
    }

    .toggle-switch.active::after {
      transform: translateX(24px);
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: var(--lb-space-10);
      color: var(--lb-color-text-secondary);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: var(--lb-space-4);
    }
  `;

  @state() private _cards: Card[] = [];
  @state() private _selectedCard: Card | null = null;
  @state() private _isLoading = true;
  @state() private _showBlockModal = false;

  connectedCallback() {
    super.connectedCallback();
    this._loadCards();
  }

  private _loadCards() {
    // Simulate API call
    setTimeout(() => {
      this._cards = [
        {
          id: 'card-001',
          userId: 'user-001',
          accountId: 'acc-001',
          type: 'debit',
          brand: 'visa',
          number: '**** **** **** 3456',
          holderName: 'DANIEL MARTINEZ',
          expiryDate: '12/27',
          status: 'active',
          isVirtual: false,
          isContactless: true,
          limits: {
            dailyPurchase: 5000000,
            dailyWithdrawal: 2000000,
            monthlyPurchase: 50000000,
            onlinePurchase: 3000000,
            internationalPurchase: 5000000,
            contactlessLimit: 500000,
          },
          design: { color: '#1a1f71' },
          createdAt: '2023-01-15',
        },
        {
          id: 'card-002',
          userId: 'user-001',
          accountId: 'acc-002',
          type: 'credit',
          brand: 'mastercard',
          number: '**** **** **** 7890',
          holderName: 'DANIEL MARTINEZ',
          expiryDate: '08/26',
          status: 'active',
          isVirtual: false,
          isContactless: true,
          limits: {
            dailyPurchase: 10000000,
            dailyWithdrawal: 3000000,
            monthlyPurchase: 100000000,
            onlinePurchase: 8000000,
            internationalPurchase: 10000000,
            contactlessLimit: 500000,
          },
          design: { color: '#1a1a1a' },
          createdAt: '2022-08-20',
        },
      ];
      this._isLoading = false;
    }, 1000);
  }

  render() {
    return html`
      <div class="page-header">
        <h1 class="page-title">Mis Tarjetas</h1>
        <p class="page-subtitle">Administra y controla tus tarjetas</p>
      </div>

      ${this._isLoading
        ? html`
            <div class="empty-state">
              <lb-spinner size="lg" text="Cargando tarjetas..."></lb-spinner>
            </div>
          `
        : this._cards.length === 0
        ? html`
            <div class="empty-state">
              <div class="empty-icon">💳</div>
              <p>No tienes tarjetas registradas</p>
            </div>
          `
        : html`
            <div class="cards-grid">
              ${this._cards.map((card) => this._renderCardItem(card))}
            </div>
          `}

      ${this._renderBlockModal()}
    `;
  }

  private _renderCardItem(card: Card) {
    const brandLogos: Record<string, string> = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
    };

    return html`
      <div class="card-container">
        <div
          class="card-visual ${card.brand}"
          @click=${() => (this._selectedCard = card)}
        >
          <span class="card-status ${card.status}">
            ${card.status === 'active' ? 'Activa' : 'Bloqueada'}
          </span>

          <div class="card-header">
            <span class="card-type">
              ${card.type === 'debit' ? 'Débito' : 'Crédito'}
            </span>
            <div class="card-chip"></div>
          </div>

          <div class="card-body">
            <div class="card-number">${card.number}</div>
          </div>

          <div class="card-footer">
            <div class="card-holder">${card.holderName}</div>
            <div class="card-expiry">
              <div class="expiry-label">Válida hasta</div>
              <div class="expiry-value">${card.expiryDate}</div>
            </div>
          </div>

          <span class="card-brand">${brandLogos[card.brand]}</span>
        </div>

        <div class="card-actions-panel">
          <h3 class="panel-title">Acciones rápidas</h3>
          <div class="actions-grid">
            <div class="action-item" @click=${() => this._toggleCard(card)}>
              <div class="action-icon">
                ${card.status === 'active' ? '🔒' : '🔓'}
              </div>
              <div class="action-info">
                <div class="action-label">
                  ${card.status === 'active'
                    ? 'Bloquear tarjeta'
                    : 'Desbloquear'}
                </div>
                <div class="action-desc">
                  ${card.status === 'active'
                    ? 'Bloqueo temporal'
                    : 'Reactivar tarjeta'}
                </div>
              </div>
            </div>

            <div class="action-item" @click=${() => this._viewPin(card)}>
              <div class="action-icon">🔢</div>
              <div class="action-info">
                <div class="action-label">Ver PIN</div>
                <div class="action-desc">Consultar PIN de seguridad</div>
              </div>
            </div>

            <div class="action-item" @click=${() => this._changeLimits(card)}>
              <div class="action-icon">📊</div>
              <div class="action-info">
                <div class="action-label">Límites</div>
                <div class="action-desc">Modificar límites</div>
              </div>
            </div>

            <div
              class="action-item danger"
              @click=${() => this._reportLost(card)}
            >
              <div class="action-icon">⚠️</div>
              <div class="action-info">
                <div class="action-label">Reportar</div>
                <div class="action-desc">Pérdida o robo</div>
              </div>
            </div>
          </div>

          <div style="margin-top: var(--lb-space-4); padding-top: var(--lb-space-4); border-top: 1px solid var(--lb-color-border-light);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--lb-space-3);">
              <div>
                <div style="font-weight: var(--lb-font-weight-medium);">
                  Compras en línea
                </div>
                <div style="font-size: var(--lb-font-size-xs); color: var(--lb-color-text-tertiary);">
                  Permitir compras por internet
                </div>
              </div>
              <div
                class="toggle-switch active"
                @click=${() => this._toggleOnline(card)}
              ></div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: var(--lb-font-weight-medium);">
                  Compras internacionales
                </div>
                <div style="font-size: var(--lb-font-size-xs); color: var(--lb-color-text-tertiary);">
                  Usar tarjeta en el exterior
                </div>
              </div>
              <div
                class="toggle-switch"
                @click=${() => this._toggleInternational(card)}
              ></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private _renderBlockModal() {
    return html`
      <lb-modal
        ?open=${this._showBlockModal}
        modalTitle="Bloquear tarjeta"
        @lb-close=${() => (this._showBlockModal = false)}
      >
        <p>
          ¿Estás seguro de que deseas bloquear esta tarjeta? Podrás
          desbloquearla en cualquier momento.
        </p>

        <div slot="footer">
          <lb-button
            variant="outline"
            @click=${() => (this._showBlockModal = false)}
          >
            Cancelar
          </lb-button>
          <lb-button variant="danger" @click=${this._confirmBlock}>
            Bloquear
          </lb-button>
        </div>
      </lb-modal>
    `;
  }

  private _toggleCard(card: Card) {
    if (card.status === 'active') {
      this._selectedCard = card;
      this._showBlockModal = true;
    } else {
      // Unblock
      toast.success('Tarjeta desbloqueada');
    }
  }

  private _confirmBlock() {
    this._showBlockModal = false;
    toast.success('Tarjeta bloqueada temporalmente');
  }

  private _viewPin(_card: Card) {
    toast.info('Se enviará un código de verificación a tu teléfono');
  }

  private _changeLimits(_card: Card) {
    toast.info('Próximamente: Configuración de límites');
  }

  private _reportLost(_card: Card) {
    toast.warning('Contacta con atención al cliente: 01 800 123 4567');
  }

  private _toggleOnline(_card: Card) {
    toast.success('Configuración actualizada');
  }

  private _toggleInternational(_card: Card) {
    toast.success('Configuración actualizada');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'page-cards': PageCards;
  }
}

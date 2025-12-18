import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Router } from '@vaadin/router';
import type { Account, Beneficiary } from '../types';
import { formatCurrency } from '../utils/formatters';
import { validateTransferAmount } from '../utils/validators';
import { toast } from '../components/ui/lb-toast/lb-toast';

// Import components
import '../components/ui/lb-card/lb-card';
import '../components/ui/lb-button/lb-button';
import '../components/ui/lb-input/lb-input';
import '../components/ui/lb-select/lb-select';
import '../components/ui/lb-spinner/lb-spinner';

type TransferStep = 'type' | 'details' | 'confirm' | 'success';
type TransferType = 'own' | 'third' | 'scheduled';

/**
 * SendellBank Transfers Page
 * @element page-transfers
 */
@customElement('page-transfers')
export class PageTransfers extends LitElement {
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

    /* Transfer Form Container */
    .transfer-container {
      max-width: 600px;
      margin: 0 auto;
    }

    .transfer-card {
      background: var(--lb-color-surface);
      border: 1px solid var(--lb-color-border);
      border-radius: var(--lb-radius-xl);
      overflow: hidden;
    }

    /* Progress Steps */
    .progress-steps {
      display: flex;
      padding: var(--lb-space-4);
      background: var(--lb-color-surface-variant);
      border-bottom: 1px solid var(--lb-color-border-light);
    }

    .step {
      flex: 1;
      display: flex;
      align-items: center;
      gap: var(--lb-space-2);
      font-size: var(--lb-font-size-sm);
      color: var(--lb-color-text-tertiary);
    }

    .step.active {
      color: var(--lb-color-primary-500);
    }

    .step.completed {
      color: var(--lb-color-success);
    }

    .step-number {
      width: 24px;
      height: 24px;
      border-radius: var(--lb-radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--lb-font-size-xs);
      font-weight: var(--lb-font-weight-semibold);
      background: var(--lb-color-neutral-200);
    }

    .step.active .step-number {
      background: var(--lb-color-primary-500);
      color: white;
    }

    .step.completed .step-number {
      background: var(--lb-color-success);
      color: white;
    }

    .step-line {
      flex: 1;
      height: 2px;
      background: var(--lb-color-neutral-200);
      margin: 0 var(--lb-space-2);
    }

    .step.completed + .step .step-line {
      background: var(--lb-color-success);
    }

    /* Form Content */
    .form-content {
      padding: var(--lb-space-6);
    }

    .form-section {
      margin-bottom: var(--lb-space-6);
    }

    .form-section:last-child {
      margin-bottom: 0;
    }

    .section-label {
      font-size: var(--lb-font-size-sm);
      font-weight: var(--lb-font-weight-medium);
      color: var(--lb-color-text-secondary);
      margin-bottom: var(--lb-space-3);
    }

    /* Transfer Type Selection */
    .type-options {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--lb-space-3);
    }

    .type-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--lb-space-4);
      border: 2px solid var(--lb-color-border);
      border-radius: var(--lb-radius-lg);
      cursor: pointer;
      transition: all var(--lb-transition-fast);
    }

    .type-option:hover {
      border-color: var(--lb-color-primary-300);
    }

    .type-option.selected {
      border-color: var(--lb-color-primary-500);
      background: var(--lb-color-primary-50);
    }

    .type-icon {
      font-size: 2rem;
      margin-bottom: var(--lb-space-2);
    }

    .type-label {
      font-size: var(--lb-font-size-sm);
      font-weight: var(--lb-font-weight-medium);
      text-align: center;
    }

    /* Amount Input */
    .amount-input-wrapper {
      position: relative;
    }

    .amount-prefix {
      position: absolute;
      left: var(--lb-space-4);
      top: 50%;
      transform: translateY(-50%);
      font-size: var(--lb-font-size-xl);
      font-weight: var(--lb-font-weight-semibold);
      color: var(--lb-color-text-secondary);
    }

    .amount-input {
      width: 100%;
      padding: var(--lb-space-4);
      padding-left: 50px;
      font-size: var(--lb-font-size-3xl);
      font-weight: var(--lb-font-weight-bold);
      font-family: var(--lb-font-family-mono);
      border: 2px solid var(--lb-color-border);
      border-radius: var(--lb-radius-lg);
      text-align: center;
      transition: border-color var(--lb-transition-fast);
    }

    .amount-input:focus {
      outline: none;
      border-color: var(--lb-color-primary-500);
    }

    .amount-hint {
      font-size: var(--lb-font-size-sm);
      color: var(--lb-color-text-tertiary);
      text-align: center;
      margin-top: var(--lb-space-2);
    }

    /* Beneficiary Selection */
    .beneficiary-list {
      display: flex;
      flex-direction: column;
      gap: var(--lb-space-2);
    }

    .beneficiary-item {
      display: flex;
      align-items: center;
      gap: var(--lb-space-3);
      padding: var(--lb-space-3);
      border: 1px solid var(--lb-color-border);
      border-radius: var(--lb-radius-md);
      cursor: pointer;
      transition: all var(--lb-transition-fast);
    }

    .beneficiary-item:hover {
      background: var(--lb-color-hover);
    }

    .beneficiary-item.selected {
      border-color: var(--lb-color-primary-500);
      background: var(--lb-color-primary-50);
    }

    .beneficiary-avatar {
      width: 40px;
      height: 40px;
      border-radius: var(--lb-radius-full);
      background: var(--lb-color-primary-100);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: var(--lb-font-weight-semibold);
      color: var(--lb-color-primary-700);
    }

    .beneficiary-info {
      flex: 1;
    }

    .beneficiary-name {
      font-weight: var(--lb-font-weight-medium);
    }

    .beneficiary-account {
      font-size: var(--lb-font-size-sm);
      color: var(--lb-color-text-tertiary);
      font-family: var(--lb-font-family-mono);
    }

    /* Confirmation Summary */
    .summary-item {
      display: flex;
      justify-content: space-between;
      padding: var(--lb-space-3) 0;
      border-bottom: 1px solid var(--lb-color-border-light);
    }

    .summary-item:last-child {
      border-bottom: none;
    }

    .summary-label {
      color: var(--lb-color-text-secondary);
    }

    .summary-value {
      font-weight: var(--lb-font-weight-medium);
    }

    .summary-value.amount {
      font-size: var(--lb-font-size-xl);
      font-family: var(--lb-font-family-mono);
      color: var(--lb-color-primary-600);
    }

    /* Actions */
    .form-actions {
      display: flex;
      gap: var(--lb-space-3);
      padding: var(--lb-space-4);
      background: var(--lb-color-surface-variant);
      border-top: 1px solid var(--lb-color-border-light);
    }

    /* Success State */
    .success-container {
      text-align: center;
      padding: var(--lb-space-8);
    }

    .success-icon {
      width: 80px;
      height: 80px;
      background: var(--lb-color-success-light);
      color: var(--lb-color-success);
      border-radius: var(--lb-radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      margin: 0 auto var(--lb-space-4);
      animation: scaleIn 0.4s ease;
    }

    @keyframes scaleIn {
      from { transform: scale(0); }
      to { transform: scale(1); }
    }

    .success-title {
      font-size: var(--lb-font-size-2xl);
      font-weight: var(--lb-font-weight-bold);
      margin-bottom: var(--lb-space-2);
    }

    .success-amount {
      font-size: var(--lb-font-size-3xl);
      font-family: var(--lb-font-family-mono);
      color: var(--lb-color-primary-600);
      margin-bottom: var(--lb-space-4);
    }
  `;

  @state() private _currentStep: TransferStep = 'type';
  @state() private _transferType: TransferType | null = null;
  @state() private _amount = 0;
  @state() private _description = '';
  @state() private _sourceAccountId = '';
  @state() private _destinationAccountId = '';
  @state() private _beneficiaryId = '';
  @state() private _isLoading = false;
  @state() private _errors: Record<string, string> = {};

  // Mock data
  private _accounts: Account[] = [
    {
      id: 'acc-001',
      userId: 'user-001',
      type: 'savings',
      number: '1234-5678-9012-3456',
      maskedNumber: '**** 3456',
      alias: 'Cuenta Principal',
      balance: 15750000,
      availableBalance: 15750000,
      currency: 'COP',
      status: 'active',
      isMain: true,
      openedAt: '2020-01-15',
    },
    {
      id: 'acc-002',
      userId: 'user-001',
      type: 'checking',
      number: '9876-5432-1098-7654',
      maskedNumber: '**** 7654',
      alias: 'Cuenta Corriente',
      balance: 4250000,
      availableBalance: 4250000,
      currency: 'COP',
      status: 'active',
      isMain: false,
      openedAt: '2021-06-20',
    },
  ];

  private _beneficiaries: Beneficiary[] = [
    {
      id: 'ben-001',
      userId: 'user-001',
      alias: 'Juan',
      name: 'Juan Carlos Pérez',
      accountNumber: '**** 4567',
      accountType: 'savings',
      isFavorite: true,
      createdAt: '2023-01-10',
    },
    {
      id: 'ben-002',
      userId: 'user-001',
      alias: 'María',
      name: 'María García López',
      accountNumber: '**** 8901',
      accountType: 'checking',
      isFavorite: true,
      createdAt: '2023-03-15',
    },
  ];

  render() {
    return html`
      <div class="page-header">
        <h1 class="page-title">Nueva Transferencia</h1>
        <p class="page-subtitle">Envía dinero de forma segura</p>
      </div>

      <div class="transfer-container">
        <div class="transfer-card">
          ${this._renderProgressSteps()}

          <div class="form-content">
            ${this._renderCurrentStep()}
          </div>

          ${this._currentStep !== 'success' ? this._renderActions() : ''}
        </div>
      </div>
    `;
  }

  private _renderProgressSteps() {
    const steps = [
      { id: 'type', label: 'Tipo' },
      { id: 'details', label: 'Detalles' },
      { id: 'confirm', label: 'Confirmar' },
    ];

    const currentIndex = steps.findIndex((s) => s.id === this._currentStep);

    return html`
      <div class="progress-steps">
        ${steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = step.id === this._currentStep;

          return html`
            ${index > 0 ? html`<div class="step-line"></div>` : ''}
            <div
              class="step ${isCompleted ? 'completed' : ''} ${isActive
                ? 'active'
                : ''}"
            >
              <span class="step-number">
                ${isCompleted ? '✓' : index + 1}
              </span>
              <span>${step.label}</span>
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderCurrentStep() {
    switch (this._currentStep) {
      case 'type':
        return this._renderTypeStep();
      case 'details':
        return this._renderDetailsStep();
      case 'confirm':
        return this._renderConfirmStep();
      case 'success':
        return this._renderSuccessStep();
    }
  }

  private _renderTypeStep() {
    const types = [
      { id: 'own', icon: '🔄', label: 'Entre mis cuentas' },
      { id: 'third', icon: '👤', label: 'A terceros' },
      { id: 'scheduled', icon: '📅', label: 'Programada' },
    ];

    return html`
      <div class="form-section">
        <div class="section-label">Tipo de transferencia</div>
        <div class="type-options">
          ${types.map(
            (type) => html`
              <div
                class="type-option ${this._transferType === type.id
                  ? 'selected'
                  : ''}"
                @click=${() => (this._transferType = type.id as TransferType)}
              >
                <span class="type-icon">${type.icon}</span>
                <span class="type-label">${type.label}</span>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  private _renderDetailsStep() {
    return html`
      <div class="form-section">
        <lb-select
          label="Cuenta origen"
          placeholder="Selecciona una cuenta"
          .value=${this._sourceAccountId}
          .options=${this._accounts.map((acc) => ({
            value: acc.id,
            label: `${acc.alias} - ${formatCurrency(acc.balance, acc.currency)}`,
          }))}
          @lb-change=${(e: CustomEvent) =>
            (this._sourceAccountId = e.detail.value)}
        ></lb-select>
      </div>

      ${this._transferType === 'own'
        ? html`
            <div class="form-section">
              <lb-select
                label="Cuenta destino"
                placeholder="Selecciona una cuenta"
                .value=${this._destinationAccountId}
                .options=${this._accounts
                  .filter((acc) => acc.id !== this._sourceAccountId)
                  .map((acc) => ({
                    value: acc.id,
                    label: `${acc.alias} - ${acc.maskedNumber}`,
                  }))}
                @lb-change=${(e: CustomEvent) =>
                  (this._destinationAccountId = e.detail.value)}
              ></lb-select>
            </div>
          `
        : html`
            <div class="form-section">
              <div class="section-label">Destinatario</div>
              <div class="beneficiary-list">
                ${this._beneficiaries.map(
                  (ben) => html`
                    <div
                      class="beneficiary-item ${this._beneficiaryId === ben.id
                        ? 'selected'
                        : ''}"
                      @click=${() => (this._beneficiaryId = ben.id)}
                    >
                      <div class="beneficiary-avatar">
                        ${ben.name.charAt(0)}
                      </div>
                      <div class="beneficiary-info">
                        <div class="beneficiary-name">${ben.name}</div>
                        <div class="beneficiary-account">
                          ${ben.accountNumber}
                        </div>
                      </div>
                    </div>
                  `
                )}
              </div>
            </div>
          `}

      <div class="form-section">
        <div class="section-label">Monto a transferir</div>
        <div class="amount-input-wrapper">
          <span class="amount-prefix">$</span>
          <input
            type="text"
            class="amount-input"
            placeholder="0"
            .value=${this._amount ? this._amount.toLocaleString() : ''}
            @input=${this._handleAmountInput}
          />
        </div>
        <div class="amount-hint">
          Disponible: ${formatCurrency(
            this._accounts.find((a) => a.id === this._sourceAccountId)
              ?.availableBalance || 0,
            'COP'
          )}
        </div>
      </div>

      <div class="form-section">
        <lb-input
          label="Descripción (opcional)"
          placeholder="Ej: Pago arriendo"
          .value=${this._description}
          @lb-input=${(e: CustomEvent) =>
            (this._description = e.detail.value)}
        ></lb-input>
      </div>
    `;
  }

  private _renderConfirmStep() {
    const sourceAccount = this._accounts.find(
      (a) => a.id === this._sourceAccountId
    );
    const destAccount = this._accounts.find(
      (a) => a.id === this._destinationAccountId
    );
    const beneficiary = this._beneficiaries.find(
      (b) => b.id === this._beneficiaryId
    );

    return html`
      <div class="form-section">
        <div class="section-label">Resumen de la transferencia</div>

        <div class="summary-item">
          <span class="summary-label">Desde</span>
          <span class="summary-value">${sourceAccount?.alias}</span>
        </div>

        <div class="summary-item">
          <span class="summary-label">Hacia</span>
          <span class="summary-value">
            ${this._transferType === 'own'
              ? destAccount?.alias
              : beneficiary?.name}
          </span>
        </div>

        ${this._description
          ? html`
              <div class="summary-item">
                <span class="summary-label">Descripción</span>
                <span class="summary-value">${this._description}</span>
              </div>
            `
          : ''}

        <div class="summary-item">
          <span class="summary-label">Monto</span>
          <span class="summary-value amount">
            ${formatCurrency(this._amount, 'COP')}
          </span>
        </div>
      </div>
    `;
  }

  private _renderSuccessStep() {
    return html`
      <div class="success-container">
        <div class="success-icon">✓</div>
        <h2 class="success-title">¡Transferencia exitosa!</h2>
        <div class="success-amount">
          ${formatCurrency(this._amount, 'COP')}
        </div>
        <p style="color: var(--lb-color-text-secondary); margin-bottom: var(--lb-space-6);">
          Tu transferencia ha sido procesada correctamente.
        </p>
        <div style="display: flex; gap: var(--lb-space-3); justify-content: center;">
          <lb-button variant="outline" @click=${() => this._resetForm()}>
            Nueva transferencia
          </lb-button>
          <lb-button @click=${() => Router.go('/dashboard')}>
            Ir al inicio
          </lb-button>
        </div>
      </div>
    `;
  }

  private _renderActions() {
    return html`
      <div class="form-actions">
        ${this._currentStep !== 'type'
          ? html`
              <lb-button
                variant="outline"
                @click=${this._goBack}
                ?disabled=${this._isLoading}
              >
                Atrás
              </lb-button>
            `
          : ''}
        <lb-button
          style="flex: 1;"
          @click=${this._goNext}
          ?loading=${this._isLoading}
          ?disabled=${!this._canProceed()}
        >
          ${this._currentStep === 'confirm' ? 'Confirmar' : 'Continuar'}
        </lb-button>
      </div>
    `;
  }

  private _handleAmountInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    this._amount = parseInt(value, 10) || 0;
  }

  private _canProceed(): boolean {
    switch (this._currentStep) {
      case 'type':
        return !!this._transferType;
      case 'details':
        const hasSource = !!this._sourceAccountId;
        const hasDestination =
          this._transferType === 'own'
            ? !!this._destinationAccountId
            : !!this._beneficiaryId;
        const hasAmount = this._amount > 0;
        return hasSource && hasDestination && hasAmount;
      case 'confirm':
        return true;
      default:
        return false;
    }
  }

  private _goBack() {
    switch (this._currentStep) {
      case 'details':
        this._currentStep = 'type';
        break;
      case 'confirm':
        this._currentStep = 'details';
        break;
    }
  }

  private async _goNext() {
    switch (this._currentStep) {
      case 'type':
        this._currentStep = 'details';
        break;
      case 'details':
        // Validate
        const sourceAccount = this._accounts.find(
          (a) => a.id === this._sourceAccountId
        );
        const validation = validateTransferAmount(
          this._amount,
          1000,
          500000000,
          sourceAccount?.availableBalance
        );
        if (!validation.isValid) {
          toast.error(validation.errors[0]);
          return;
        }
        this._currentStep = 'confirm';
        break;
      case 'confirm':
        await this._executeTransfer();
        break;
    }
  }

  private async _executeTransfer() {
    this._isLoading = true;

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    this._isLoading = false;
    this._currentStep = 'success';
    toast.success('Transferencia realizada exitosamente');
  }

  private _resetForm() {
    this._currentStep = 'type';
    this._transferType = null;
    this._amount = 0;
    this._description = '';
    this._sourceAccountId = '';
    this._destinationAccountId = '';
    this._beneficiaryId = '';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'page-transfers': PageTransfers;
  }
}

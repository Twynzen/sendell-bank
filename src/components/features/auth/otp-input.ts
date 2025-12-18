import { LitElement, html, css } from 'lit';
import { customElement, property, state, queryAll } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

/**
 * SendellBank OTP Input Component
 * @element otp-input
 *
 * @fires otp-complete - Emitted when all digits are entered
 * @fires otp-change - Emitted when value changes
 */
@customElement('otp-input')
export class OtpInput extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .otp-container {
      display: flex;
      justify-content: center;
      gap: var(--lb-space-3);
      margin: var(--lb-space-6) 0;
    }

    .otp-input {
      width: 52px;
      height: 64px;
      text-align: center;
      font-size: var(--lb-font-size-2xl);
      font-weight: var(--lb-font-weight-bold);
      font-family: var(--lb-font-family-mono);
      border: 2px solid var(--lb-color-border);
      border-radius: var(--lb-radius-lg);
      background: var(--lb-color-surface);
      color: var(--lb-color-text-primary);
      transition: all var(--lb-transition-fast);
      caret-color: var(--lb-color-primary-500);
    }

    .otp-input:focus {
      outline: none;
      border-color: var(--lb-color-primary-500);
      box-shadow: 0 0 0 4px var(--lb-color-primary-50);
    }

    .otp-input.filled {
      border-color: var(--lb-color-primary-500);
      background: var(--lb-color-primary-50);
    }

    .otp-input.error {
      border-color: var(--lb-color-error);
      animation: shake 0.5s ease-in-out;
    }

    .otp-input:disabled {
      background: var(--lb-color-neutral-100);
      cursor: not-allowed;
    }

    .separator {
      display: flex;
      align-items: center;
      font-size: var(--lb-font-size-2xl);
      color: var(--lb-color-text-tertiary);
      font-weight: var(--lb-font-weight-bold);
    }

    .helper-text {
      text-align: center;
      font-size: var(--lb-font-size-sm);
      color: var(--lb-color-text-secondary);
      margin-top: var(--lb-space-4);
    }

    .error-text {
      color: var(--lb-color-error);
    }

    .resend-link {
      color: var(--lb-color-primary-500);
      cursor: pointer;
      text-decoration: none;
      font-weight: var(--lb-font-weight-medium);
    }

    .resend-link:hover {
      text-decoration: underline;
    }

    .resend-link:disabled,
    .resend-link.disabled {
      color: var(--lb-color-text-disabled);
      cursor: not-allowed;
    }

    .countdown {
      font-family: var(--lb-font-family-mono);
      font-weight: var(--lb-font-weight-medium);
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
      20%, 40%, 60%, 80% { transform: translateX(4px); }
    }

    /* Mobile responsive */
    @media (max-width: 480px) {
      .otp-container {
        gap: var(--lb-space-2);
      }

      .otp-input {
        width: 44px;
        height: 56px;
        font-size: var(--lb-font-size-xl);
      }
    }
  `;

  @property({ type: Number }) length = 6;
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) error = false;
  @property({ type: String }) errorMessage = '';
  @property({ type: Boolean }) autoFocus = true;
  @property({ type: Number }) resendCooldown = 60; // seconds

  @state() private _values: string[] = [];
  @state() private _resendCountdown = 0;

  @queryAll('.otp-input') private _inputs!: NodeListOf<HTMLInputElement>;

  private _resendInterval: number | null = null;

  connectedCallback() {
    super.connectedCallback();
    this._values = Array(this.length).fill('');
    this._startResendCooldown();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._resendInterval) {
      clearInterval(this._resendInterval);
    }
  }

  firstUpdated() {
    if (this.autoFocus) {
      requestAnimationFrame(() => {
        this._inputs[0]?.focus();
      });
    }
  }

  private _startResendCooldown() {
    this._resendCountdown = this.resendCooldown;
    this._resendInterval = window.setInterval(() => {
      this._resendCountdown--;
      if (this._resendCountdown <= 0 && this._resendInterval) {
        clearInterval(this._resendInterval);
        this._resendInterval = null;
      }
    }, 1000);
  }

  render() {
    const midpoint = Math.floor(this.length / 2);

    return html`
      <div class="otp-container">
        ${this._values.map((value, index) => html`
          ${index === midpoint
            ? html`<span class="separator">-</span>`
            : ''}
          <input
            type="text"
            inputmode="numeric"
            maxlength="1"
            class=${classMap({
              'otp-input': true,
              filled: !!value,
              error: this.error,
            })}
            .value=${value}
            ?disabled=${this.disabled}
            data-index=${index}
            @input=${(e: Event) => this._handleInput(e, index)}
            @keydown=${(e: KeyboardEvent) => this._handleKeydown(e, index)}
            @paste=${this._handlePaste}
            @focus=${(e: Event) => this._handleFocus(e, index)}
          />
        `)}
      </div>

      ${this.errorMessage
        ? html`
            <p class="helper-text error-text">
              ⚠️ ${this.errorMessage}
            </p>
          `
        : ''}

      <p class="helper-text">
        ¿No recibiste el código?
        ${this._resendCountdown > 0
          ? html`
              Reenviar en
              <span class="countdown">${this._formatCountdown()}</span>
            `
          : html`
              <a
                class="resend-link"
                @click=${this._handleResend}
                tabindex="0"
                role="button"
              >
                Reenviar código
              </a>
            `}
      </p>
    `;
  }

  private _formatCountdown(): string {
    const minutes = Math.floor(this._resendCountdown / 60);
    const seconds = this._resendCountdown % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private _handleInput(e: Event, index: number) {
    const input = e.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, '');

    // Update value
    this._values = [
      ...this._values.slice(0, index),
      value,
      ...this._values.slice(index + 1),
    ];

    // Move to next input
    if (value && index < this.length - 1) {
      this._focusInput(index + 1);
    }

    this._emitChange();
  }

  private _handleKeydown(e: KeyboardEvent, index: number) {
    // Backspace
    if (e.key === 'Backspace') {
      if (!this._values[index] && index > 0) {
        this._focusInput(index - 1);
      }
      this._values = [
        ...this._values.slice(0, index),
        '',
        ...this._values.slice(index + 1),
      ];
      this.requestUpdate();
    }

    // Arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      this._focusInput(index - 1);
    }
    if (e.key === 'ArrowRight' && index < this.length - 1) {
      e.preventDefault();
      this._focusInput(index + 1);
    }
  }

  private _handlePaste(e: ClipboardEvent) {
    e.preventDefault();
    const pastedData = e.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/[^0-9]/g, '').slice(0, this.length);

    if (digits) {
      this._values = [
        ...digits.split(''),
        ...Array(this.length - digits.length).fill(''),
      ];
      this.requestUpdate();

      // Focus last filled input or last input
      const focusIndex = Math.min(digits.length, this.length - 1);
      requestAnimationFrame(() => {
        this._focusInput(focusIndex);
      });

      this._emitChange();
    }
  }

  private _handleFocus(_e: Event, index: number) {
    // Select content on focus
    requestAnimationFrame(() => {
      this._inputs[index]?.select();
    });
  }

  private _focusInput(index: number) {
    requestAnimationFrame(() => {
      this._inputs[index]?.focus();
    });
  }

  private _emitChange() {
    const code = this._values.join('');

    this.dispatchEvent(
      new CustomEvent('otp-change', {
        detail: { value: code, isComplete: code.length === this.length },
        bubbles: true,
        composed: true,
      })
    );

    if (code.length === this.length) {
      this.dispatchEvent(
        new CustomEvent('otp-complete', {
          detail: { code },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  private _handleResend() {
    if (this._resendCountdown > 0) return;

    this.dispatchEvent(
      new CustomEvent('otp-resend', {
        bubbles: true,
        composed: true,
      })
    );

    this._startResendCooldown();
  }

  // Public methods
  clear() {
    this._values = Array(this.length).fill('');
    this.requestUpdate();
    this._focusInput(0);
  }

  getValue(): string {
    return this._values.join('');
  }

  focus() {
    this._focusInput(0);
  }

  setError(message: string) {
    this.error = true;
    this.errorMessage = message;
  }

  clearError() {
    this.error = false;
    this.errorMessage = '';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'otp-input': OtpInput;
  }
}

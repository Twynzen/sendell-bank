import { LitElement, html, css } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { live } from 'lit/directives/live.js';
import { ifDefined } from 'lit/directives/if-defined.js';

export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';
export type InputSize = 'sm' | 'md' | 'lg';

/**
 * SendellBank Input Component
 * @element lb-input
 *
 * @slot prefix - Slot for prefix content (icon or text)
 * @slot suffix - Slot for suffix content (icon or button)
 *
 * @fires lb-input - Emitted when input value changes
 * @fires lb-change - Emitted when input loses focus with changed value
 * @fires lb-focus - Emitted when input gains focus
 * @fires lb-blur - Emitted when input loses focus
 *
 * @csspart input - The input element
 * @csspart label - The label element
 */
@customElement('lb-input')
export class LbInput extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--lb-space-1);
    }

    .label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    label {
      font-size: var(--lb-font-size-sm);
      font-weight: var(--lb-font-weight-medium);
      color: var(--lb-color-text-secondary);
    }

    .required-indicator {
      color: var(--lb-color-error);
      margin-left: var(--lb-space-1);
    }

    .helper-text {
      font-size: var(--lb-font-size-xs);
      color: var(--lb-color-text-tertiary);
    }

    .input-container {
      display: flex;
      align-items: center;
      background: var(--lb-input-background);
      border: 1px solid var(--lb-input-border);
      border-radius: var(--lb-radius-md);
      transition: all var(--lb-transition-fast);
      position: relative;
    }

    .input-container:hover:not(.disabled) {
      border-color: var(--lb-color-neutral-400);
    }

    .input-container.focused {
      border-color: var(--lb-color-primary-500);
      box-shadow: 0 0 0 3px var(--lb-color-primary-50);
    }

    .input-container.has-error {
      border-color: var(--lb-color-error);
    }

    .input-container.has-error.focused {
      box-shadow: 0 0 0 3px var(--lb-color-error-light);
    }

    .input-container.disabled {
      background: var(--lb-color-neutral-100);
      cursor: not-allowed;
    }

    input {
      flex: 1;
      width: 100%;
      border: none;
      background: transparent;
      font-family: var(--lb-font-family-base);
      color: var(--lb-color-text-primary);
      outline: none;
    }

    input::placeholder {
      color: var(--lb-input-placeholder);
    }

    input:disabled {
      cursor: not-allowed;
      color: var(--lb-color-text-disabled);
    }

    /* Sizes */
    .size-sm input {
      padding: var(--lb-space-2) var(--lb-space-3);
      font-size: var(--lb-font-size-sm);
    }

    .size-md input {
      padding: var(--lb-space-3) var(--lb-space-4);
      font-size: var(--lb-font-size-md);
    }

    .size-lg input {
      padding: var(--lb-space-4) var(--lb-space-5);
      font-size: var(--lb-font-size-lg);
    }

    /* Prefix/Suffix */
    .prefix,
    .suffix {
      display: flex;
      align-items: center;
      color: var(--lb-color-text-tertiary);
    }

    .prefix {
      padding-left: var(--lb-space-3);
    }

    .suffix {
      padding-right: var(--lb-space-3);
    }

    .has-prefix input {
      padding-left: var(--lb-space-2);
    }

    .has-suffix input {
      padding-right: var(--lb-space-2);
    }

    /* Password toggle */
    .password-toggle {
      background: none;
      border: none;
      cursor: pointer;
      padding: var(--lb-space-2);
      color: var(--lb-color-text-tertiary);
      transition: color var(--lb-transition-fast);
    }

    .password-toggle:hover {
      color: var(--lb-color-text-primary);
    }

    /* Clear button */
    .clear-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: var(--lb-space-1);
      color: var(--lb-color-text-tertiary);
      transition: color var(--lb-transition-fast);
      border-radius: var(--lb-radius-full);
    }

    .clear-button:hover {
      color: var(--lb-color-text-primary);
      background: var(--lb-color-neutral-200);
    }

    /* Messages */
    .message {
      display: flex;
      align-items: center;
      gap: var(--lb-space-1);
      font-size: var(--lb-font-size-sm);
      margin-top: var(--lb-space-1);
    }

    .error-message {
      color: var(--lb-color-error);
    }

    .success-message {
      color: var(--lb-color-success);
    }

    /* Character counter */
    .char-counter {
      font-size: var(--lb-font-size-xs);
      color: var(--lb-color-text-tertiary);
    }

    .char-counter.limit-reached {
      color: var(--lb-color-error);
    }

    /* Number input arrows */
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    input[type="number"] {
      -moz-appearance: textfield;
    }
  `;

  @property({ type: String }) type: InputType = 'text';
  @property({ type: String }) value = '';
  @property({ type: String }) name = '';
  @property({ type: String }) label = '';
  @property({ type: String }) placeholder = '';
  @property({ type: String }) helperText = '';
  @property({ type: String }) error = '';
  @property({ type: String }) success = '';
  @property({ type: String }) size: InputSize = 'md';
  @property({ type: Boolean }) required = false;
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) readonly = false;
  @property({ type: Boolean }) clearable = false;
  @property({ type: Number }) maxlength?: number;
  @property({ type: Number }) minlength?: number;
  @property({ type: String }) pattern?: string;
  @property({ type: String }) autocomplete?: string;
  @property({ type: Number }) min?: number;
  @property({ type: Number }) max?: number;
  @property({ type: Number }) step?: number;

  @state() private _showPassword = false;
  @state() private _isFocused = false;
  @state() private _hasPrefix = false;
  @state() private _hasSuffix = false;

  @query('input') private _input!: HTMLInputElement;

  connectedCallback() {
    super.connectedCallback();
    this._checkSlots();
  }

  private _checkSlots() {
    this._hasPrefix = this.querySelector('[slot="prefix"]') !== null;
    this._hasSuffix = this.querySelector('[slot="suffix"]') !== null;
  }

  render() {
    const containerClasses = {
      'input-container': true,
      [`size-${this.size}`]: true,
      focused: this._isFocused,
      'has-error': !!this.error,
      disabled: this.disabled,
      'has-prefix': this._hasPrefix,
      'has-suffix': this._hasSuffix || this.type === 'password' || this.clearable,
    };

    const inputType =
      this.type === 'password' && this._showPassword ? 'text' : this.type;

    return html`
      <div class="input-wrapper">
        ${this.label || this.helperText
          ? html`
              <div class="label-row">
                ${this.label
                  ? html`
                      <label part="label">
                        ${this.label}
                        ${this.required
                          ? html`<span class="required-indicator">*</span>`
                          : ''}
                      </label>
                    `
                  : ''}
                ${this.helperText
                  ? html`<span class="helper-text">${this.helperText}</span>`
                  : ''}
              </div>
            `
          : ''}

        <div class=${classMap(containerClasses)}>
          ${this._hasPrefix
            ? html`<span class="prefix"><slot name="prefix"></slot></span>`
            : ''}

          <input
            part="input"
            type=${inputType}
            name=${this.name}
            .value=${live(this.value)}
            placeholder=${this.placeholder}
            ?required=${this.required}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            maxlength=${ifDefined(this.maxlength)}
            minlength=${ifDefined(this.minlength)}
            pattern=${ifDefined(this.pattern)}
            autocomplete=${ifDefined(this.autocomplete)}
            min=${ifDefined(this.min)}
            max=${ifDefined(this.max)}
            step=${ifDefined(this.step)}
            @input=${this._onInput}
            @change=${this._onChange}
            @focus=${this._onFocus}
            @blur=${this._onBlur}
          />

          ${this._renderSuffix()}
        </div>

        ${this._renderMessage()}
      </div>
    `;
  }

  private _renderSuffix() {
    const hasClearable = this.clearable && this.value && !this.disabled;

    return html`
      <span class="suffix">
        ${hasClearable
          ? html`
              <button
                type="button"
                class="clear-button"
                @click=${this._onClear}
                tabindex="-1"
              >
                ✕
              </button>
            `
          : ''}
        ${this.type === 'password'
          ? html`
              <button
                type="button"
                class="password-toggle"
                @click=${this._togglePassword}
                tabindex="-1"
              >
                ${this._showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            `
          : ''}
        <slot name="suffix"></slot>
      </span>
    `;
  }

  private _renderMessage() {
    if (this.error) {
      return html`
        <div class="message error-message">
          <span>⚠️</span>
          <span>${this.error}</span>
        </div>
      `;
    }

    if (this.success) {
      return html`
        <div class="message success-message">
          <span>✓</span>
          <span>${this.success}</span>
        </div>
      `;
    }

    if (this.maxlength) {
      const isNearLimit = this.value.length >= this.maxlength * 0.9;
      return html`
        <div
          class="char-counter ${isNearLimit ? 'limit-reached' : ''}"
        >
          ${this.value.length}/${this.maxlength}
        </div>
      `;
    }

    return '';
  }

  private _onInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.value = input.value;

    this.dispatchEvent(
      new CustomEvent('lb-input', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onChange() {
    this.dispatchEvent(
      new CustomEvent('lb-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onFocus() {
    this._isFocused = true;
    this.dispatchEvent(
      new CustomEvent('lb-focus', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onBlur() {
    this._isFocused = false;
    this.dispatchEvent(
      new CustomEvent('lb-blur', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _togglePassword() {
    this._showPassword = !this._showPassword;
  }

  private _onClear() {
    this.value = '';
    this._input?.focus();
    this.dispatchEvent(
      new CustomEvent('lb-input', {
        detail: { value: '' },
        bubbles: true,
        composed: true,
      })
    );
  }

  // Public methods
  focus() {
    this._input?.focus();
  }

  blur() {
    this._input?.blur();
  }

  select() {
    this._input?.select();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lb-input': LbInput;
  }
}

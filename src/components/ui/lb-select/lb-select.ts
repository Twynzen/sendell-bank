import { LitElement, html, css } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

/**
 * SendellBank Select Component
 * @element lb-select
 *
 * @fires lb-change - Emitted when selection changes
 */
@customElement('lb-select')
export class LbSelect extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .select-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--lb-space-1);
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

    .select-container {
      position: relative;
    }

    .select-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: var(--lb-space-3) var(--lb-space-4);
      background: var(--lb-input-background);
      border: 1px solid var(--lb-input-border);
      border-radius: var(--lb-radius-md);
      font-size: var(--lb-font-size-md);
      color: var(--lb-color-text-primary);
      cursor: pointer;
      transition: all var(--lb-transition-fast);
    }

    .select-trigger:hover:not(.disabled) {
      border-color: var(--lb-color-neutral-400);
    }

    .select-trigger.open {
      border-color: var(--lb-color-primary-500);
      box-shadow: 0 0 0 3px var(--lb-color-primary-50);
    }

    .select-trigger.disabled {
      background: var(--lb-color-neutral-100);
      cursor: not-allowed;
      color: var(--lb-color-text-disabled);
    }

    .select-trigger.has-error {
      border-color: var(--lb-color-error);
    }

    .selected-value {
      display: flex;
      align-items: center;
      gap: var(--lb-space-2);
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .placeholder {
      color: var(--lb-input-placeholder);
    }

    .chevron {
      transition: transform var(--lb-transition-fast);
    }

    .open .chevron {
      transform: rotate(180deg);
    }

    .options-list {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      z-index: var(--lb-z-dropdown);
      margin-top: var(--lb-space-1);
      background: var(--lb-color-surface);
      border: 1px solid var(--lb-color-border-light);
      border-radius: var(--lb-radius-md);
      box-shadow: var(--lb-shadow-dropdown);
      max-height: 240px;
      overflow-y: auto;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-8px);
      transition: all var(--lb-transition-fast);
    }

    .options-list.open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .option {
      display: flex;
      align-items: center;
      gap: var(--lb-space-2);
      padding: var(--lb-space-3) var(--lb-space-4);
      font-size: var(--lb-font-size-md);
      color: var(--lb-color-text-primary);
      cursor: pointer;
      transition: background var(--lb-transition-fast);
    }

    .option:hover:not(.disabled) {
      background: var(--lb-color-hover);
    }

    .option.selected {
      background: var(--lb-color-primary-50);
      color: var(--lb-color-primary-600);
    }

    .option.disabled {
      color: var(--lb-color-text-disabled);
      cursor: not-allowed;
    }

    .option-icon {
      flex-shrink: 0;
    }

    .check-icon {
      margin-left: auto;
      opacity: 0;
    }

    .option.selected .check-icon {
      opacity: 1;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: var(--lb-space-1);
      font-size: var(--lb-font-size-sm);
      color: var(--lb-color-error);
      margin-top: var(--lb-space-1);
    }

    /* Backdrop */
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: calc(var(--lb-z-dropdown) - 1);
    }
  `;

  @property({ type: Array }) options: SelectOption[] = [];
  @property({ type: String }) value = '';
  @property({ type: String }) label = '';
  @property({ type: String }) placeholder = 'Seleccionar...';
  @property({ type: String }) error = '';
  @property({ type: Boolean }) required = false;
  @property({ type: Boolean }) disabled = false;

  @state() private _open = false;

  @query('.select-trigger') private _trigger!: HTMLElement;

  private _handleOutsideClick = (e: Event) => {
    if (!this.contains(e.target as Node)) {
      this._open = false;
    }
  };

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._handleOutsideClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._handleOutsideClick);
  }

  render() {
    const selectedOption = this.options.find((o) => o.value === this.value);

    const triggerClasses = {
      'select-trigger': true,
      open: this._open,
      disabled: this.disabled,
      'has-error': !!this.error,
    };

    return html`
      <div class="select-wrapper">
        ${this.label
          ? html`
              <label>
                ${this.label}
                ${this.required
                  ? html`<span class="required-indicator">*</span>`
                  : ''}
              </label>
            `
          : ''}

        <div class="select-container">
          <button
            type="button"
            class=${classMap(triggerClasses)}
            ?disabled=${this.disabled}
            @click=${this._toggleOpen}
            @keydown=${this._handleKeydown}
          >
            <span class="selected-value">
              ${selectedOption
                ? html`
                    ${selectedOption.icon
                      ? html`<span class="option-icon"
                          >${selectedOption.icon}</span
                        >`
                      : ''}
                    ${selectedOption.label}
                  `
                : html`<span class="placeholder">${this.placeholder}</span>`}
            </span>
            <span class="chevron">▼</span>
          </button>

          ${this._open
            ? html`<div class="backdrop" @click=${() => (this._open = false)}></div>`
            : ''}

          <div class="options-list ${this._open ? 'open' : ''}">
            ${this.options.map(
              (option) => html`
                <div
                  class=${classMap({
                    option: true,
                    selected: option.value === this.value,
                    disabled: !!option.disabled,
                  })}
                  @click=${() => this._selectOption(option)}
                >
                  ${option.icon
                    ? html`<span class="option-icon">${option.icon}</span>`
                    : ''}
                  <span>${option.label}</span>
                  <span class="check-icon">✓</span>
                </div>
              `
            )}
          </div>
        </div>

        ${this.error
          ? html`
              <div class="error-message">
                <span>⚠️</span>
                <span>${this.error}</span>
              </div>
            `
          : ''}
      </div>
    `;
  }

  private _toggleOpen() {
    if (this.disabled) return;
    this._open = !this._open;
  }

  private _selectOption(option: SelectOption) {
    if (option.disabled) return;

    this.value = option.value;
    this._open = false;

    this.dispatchEvent(
      new CustomEvent('lb-change', {
        detail: { value: option.value, option },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._toggleOpen();
    } else if (e.key === 'Escape') {
      this._open = false;
    } else if (e.key === 'ArrowDown' && this._open) {
      e.preventDefault();
      this._navigateOptions(1);
    } else if (e.key === 'ArrowUp' && this._open) {
      e.preventDefault();
      this._navigateOptions(-1);
    }
  }

  private _navigateOptions(direction: number) {
    const enabledOptions = this.options.filter((o) => !o.disabled);
    const currentIndex = enabledOptions.findIndex((o) => o.value === this.value);
    const nextIndex =
      (currentIndex + direction + enabledOptions.length) % enabledOptions.length;
    this.value = enabledOptions[nextIndex].value;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lb-select': LbSelect;
  }
}

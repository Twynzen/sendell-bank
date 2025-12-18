import { LitElement, html, css } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  divider?: boolean;
  danger?: boolean;
}

/**
 * SendellBank Dropdown Component
 * @element lb-dropdown
 *
 * @slot trigger - Slot for the trigger element
 *
 * @fires lb-select - Emitted when an item is selected
 */
@customElement('lb-dropdown')
export class LbDropdown extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      position: relative;
    }

    .trigger {
      cursor: pointer;
    }

    .menu {
      position: absolute;
      z-index: var(--lb-z-dropdown);
      min-width: 180px;
      max-width: 320px;
      background: var(--lb-color-surface);
      border: 1px solid var(--lb-color-border-light);
      border-radius: var(--lb-radius-lg);
      box-shadow: var(--lb-shadow-dropdown);
      padding: var(--lb-space-2);
      opacity: 0;
      visibility: hidden;
      transform: translateY(-8px);
      transition: all var(--lb-transition-fast);
    }

    .menu.open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    /* Positions */
    .position-bottom-start {
      top: 100%;
      left: 0;
      margin-top: var(--lb-space-2);
    }

    .position-bottom-end {
      top: 100%;
      right: 0;
      margin-top: var(--lb-space-2);
    }

    .position-top-start {
      bottom: 100%;
      left: 0;
      margin-bottom: var(--lb-space-2);
    }

    .position-top-end {
      bottom: 100%;
      right: 0;
      margin-bottom: var(--lb-space-2);
    }

    .item {
      display: flex;
      align-items: center;
      gap: var(--lb-space-3);
      padding: var(--lb-space-2) var(--lb-space-3);
      font-size: var(--lb-font-size-sm);
      color: var(--lb-color-text-primary);
      background: transparent;
      border: none;
      border-radius: var(--lb-radius-md);
      cursor: pointer;
      width: 100%;
      text-align: left;
      transition: all var(--lb-transition-fast);
    }

    .item:hover:not(.disabled) {
      background: var(--lb-color-hover);
    }

    .item.disabled {
      color: var(--lb-color-text-disabled);
      cursor: not-allowed;
    }

    .item.danger {
      color: var(--lb-color-error);
    }

    .item.danger:hover:not(.disabled) {
      background: var(--lb-color-error-light);
    }

    .item:focus-visible {
      outline: var(--lb-ring-width) solid var(--lb-ring-color);
      outline-offset: -2px;
    }

    .item-icon {
      width: 18px;
      text-align: center;
    }

    .divider {
      height: 1px;
      background: var(--lb-color-border-light);
      margin: var(--lb-space-2) 0;
    }

    /* Backdrop for mobile */
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: calc(var(--lb-z-dropdown) - 1);
    }
  `;

  @property({ type: Array }) items: DropdownItem[] = [];
  @property({ type: String }) position:
    | 'bottom-start'
    | 'bottom-end'
    | 'top-start'
    | 'top-end' = 'bottom-start';
  @property({ type: Boolean }) closeOnSelect = true;

  @state() private _open = false;

  @query('.menu') private _menu!: HTMLElement;

  private _handleOutsideClick = (e: Event) => {
    if (!this.contains(e.target as Node)) {
      this.close();
    }
  };

  private _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      this.close();
    }
  };

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._handleOutsideClick);
    document.addEventListener('keydown', this._handleKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._handleOutsideClick);
    document.removeEventListener('keydown', this._handleKeydown);
  }

  render() {
    const menuClasses = {
      menu: true,
      open: this._open,
      [`position-${this.position}`]: true,
    };

    return html`
      <div class="trigger" @click=${this.toggle}>
        <slot name="trigger"></slot>
      </div>

      ${this._open ? html`<div class="backdrop" @click=${this.close}></div>` : ''}

      <div class=${classMap(menuClasses)} role="menu">
        ${this.items.map((item) =>
          item.divider
            ? html`<div class="divider"></div>`
            : html`
                <button
                  class=${classMap({
                    item: true,
                    disabled: !!item.disabled,
                    danger: !!item.danger,
                  })}
                  role="menuitem"
                  ?disabled=${item.disabled}
                  @click=${() => this._selectItem(item)}
                >
                  ${item.icon
                    ? html`<span class="item-icon">${item.icon}</span>`
                    : ''}
                  <span>${item.label}</span>
                </button>
              `
        )}
      </div>
    `;
  }

  private _selectItem(item: DropdownItem) {
    if (item.disabled) return;

    this.dispatchEvent(
      new CustomEvent('lb-select', {
        detail: { itemId: item.id, item },
        bubbles: true,
        composed: true,
      })
    );

    if (this.closeOnSelect) {
      this.close();
    }
  }

  open() {
    this._open = true;
  }

  close() {
    this._open = false;
  }

  toggle() {
    this._open = !this._open;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lb-dropdown': LbDropdown;
  }
}

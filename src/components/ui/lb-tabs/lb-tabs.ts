import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
}

/**
 * SendellBank Tabs Component
 * @element lb-tabs
 *
 * @fires lb-tab-change - Emitted when active tab changes
 */
@customElement('lb-tabs')
export class LbTabs extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .tabs-container {
      display: flex;
      flex-direction: column;
    }

    .tab-list {
      display: flex;
      border-bottom: 1px solid var(--lb-color-border);
      overflow-x: auto;
      scrollbar-width: none;
    }

    .tab-list::-webkit-scrollbar {
      display: none;
    }

    .tab {
      display: flex;
      align-items: center;
      gap: var(--lb-space-2);
      padding: var(--lb-space-3) var(--lb-space-4);
      font-size: var(--lb-font-size-md);
      font-weight: var(--lb-font-weight-medium);
      color: var(--lb-color-text-secondary);
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      transition: all var(--lb-transition-fast);
      white-space: nowrap;
      margin-bottom: -1px;
    }

    .tab:hover:not(.disabled) {
      color: var(--lb-color-text-primary);
      background: var(--lb-color-hover);
    }

    .tab.active {
      color: var(--lb-color-primary-500);
      border-bottom-color: var(--lb-color-primary-500);
    }

    .tab.disabled {
      color: var(--lb-color-text-disabled);
      cursor: not-allowed;
    }

    .tab:focus-visible {
      outline: var(--lb-ring-width) solid var(--lb-ring-color);
      outline-offset: -2px;
    }

    .tab-icon {
      font-size: 1.125em;
    }

    .tab-badge {
      font-size: var(--lb-font-size-xs);
      background: var(--lb-color-primary-500);
      color: white;
      padding: 1px 6px;
      border-radius: var(--lb-radius-full);
      min-width: 18px;
      text-align: center;
    }

    .tab.active .tab-badge {
      background: var(--lb-color-primary-600);
    }

    /* Pill variant */
    .variant-pills .tab-list {
      border-bottom: none;
      gap: var(--lb-space-2);
      background: var(--lb-color-neutral-100);
      padding: var(--lb-space-1);
      border-radius: var(--lb-radius-lg);
      width: fit-content;
    }

    .variant-pills .tab {
      border-bottom: none;
      border-radius: var(--lb-radius-md);
      margin-bottom: 0;
    }

    .variant-pills .tab.active {
      background: var(--lb-color-surface);
      box-shadow: var(--lb-shadow-sm);
      color: var(--lb-color-text-primary);
    }

    /* Panel */
    .tab-panel {
      padding: var(--lb-space-4) 0;
    }

    .tab-panel[hidden] {
      display: none;
    }

    /* Full width */
    .full-width .tab-list {
      width: 100%;
    }

    .full-width .tab {
      flex: 1;
      justify-content: center;
    }
  `;

  @property({ type: Array }) tabs: TabItem[] = [];
  @property({ type: String }) activeTab = '';
  @property({ type: String }) variant: 'default' | 'pills' = 'default';
  @property({ type: Boolean }) fullWidth = false;

  @state() private _activeTab = '';

  willUpdate(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('activeTab') || changedProperties.has('tabs')) {
      this._activeTab = this.activeTab || this.tabs[0]?.id || '';
    }
  }

  render() {
    const containerClasses = {
      'tabs-container': true,
      [`variant-${this.variant}`]: true,
      'full-width': this.fullWidth,
    };

    return html`
      <div class=${classMap(containerClasses)}>
        <div class="tab-list" role="tablist">
          ${this.tabs.map((tab) => this._renderTab(tab))}
        </div>

        ${this.tabs.map(
          (tab) => html`
            <div
              class="tab-panel"
              role="tabpanel"
              id="panel-${tab.id}"
              ?hidden=${tab.id !== this._activeTab}
              aria-labelledby="tab-${tab.id}"
            >
              <slot name=${tab.id}></slot>
            </div>
          `
        )}
      </div>
    `;
  }

  private _renderTab(tab: TabItem) {
    const classes = {
      tab: true,
      active: tab.id === this._activeTab,
      disabled: !!tab.disabled,
    };

    return html`
      <button
        class=${classMap(classes)}
        role="tab"
        id="tab-${tab.id}"
        aria-selected=${tab.id === this._activeTab}
        aria-controls="panel-${tab.id}"
        ?disabled=${tab.disabled}
        @click=${() => this._selectTab(tab)}
      >
        ${tab.icon ? html`<span class="tab-icon">${tab.icon}</span>` : ''}
        <span>${tab.label}</span>
        ${tab.badge
          ? html`<span class="tab-badge">${tab.badge}</span>`
          : ''}
      </button>
    `;
  }

  private _selectTab(tab: TabItem) {
    if (tab.disabled || tab.id === this._activeTab) return;

    this._activeTab = tab.id;

    this.dispatchEvent(
      new CustomEvent('lb-tab-change', {
        detail: { tabId: tab.id },
        bubbles: true,
        composed: true,
      })
    );
  }

  // Public method
  setActiveTab(tabId: string) {
    const tab = this.tabs.find((t) => t.id === tabId);
    if (tab && !tab.disabled) {
      this._selectTab(tab);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lb-tabs': LbTabs;
  }
}

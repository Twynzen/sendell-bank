import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: string | number;
}

/**
 * SendellBank App Sidebar Component
 * @element app-sidebar
 */
@customElement('app-sidebar')
export class AppSidebar extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    aside {
      width: var(--lb-sidebar-width);
      height: calc(100vh - var(--lb-header-height));
      background: var(--lb-sidebar-background);
      border-right: 1px solid var(--lb-color-border-light);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: var(--lb-header-height);
      left: 0;
      transition: transform var(--lb-transition-normal), width var(--lb-transition-normal);
      z-index: var(--lb-z-fixed);
      overflow-y: auto;
    }

    aside.collapsed {
      width: var(--lb-sidebar-collapsed-width);
    }

    aside.hidden {
      transform: translateX(-100%);
    }

    @media (max-width: 768px) {
      aside {
        transform: translateX(-100%);
      }

      aside.open {
        transform: translateX(0);
      }

      .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: calc(var(--lb-z-fixed) - 1);
        opacity: 0;
        visibility: hidden;
        transition: all var(--lb-transition-normal);
      }

      .backdrop.visible {
        opacity: 1;
        visibility: visible;
      }
    }

    /* Navigation */
    nav {
      flex: 1;
      padding: var(--lb-space-4);
    }

    .nav-section {
      margin-bottom: var(--lb-space-6);
    }

    .nav-section-title {
      font-size: var(--lb-font-size-xs);
      font-weight: var(--lb-font-weight-semibold);
      color: var(--lb-color-text-tertiary);
      text-transform: uppercase;
      letter-spacing: var(--lb-letter-spacing-wide);
      padding: 0 var(--lb-space-3);
      margin-bottom: var(--lb-space-2);
    }

    .collapsed .nav-section-title {
      display: none;
    }

    .nav-items {
      display: flex;
      flex-direction: column;
      gap: var(--lb-space-1);
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: var(--lb-space-3);
      padding: var(--lb-space-3);
      border-radius: var(--lb-radius-md);
      color: var(--lb-color-text-secondary);
      text-decoration: none;
      font-size: var(--lb-font-size-md);
      font-weight: var(--lb-font-weight-medium);
      transition: all var(--lb-transition-fast);
      cursor: pointer;
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
    }

    .nav-item:hover {
      background: var(--lb-sidebar-item-hover);
      color: var(--lb-color-text-primary);
    }

    .nav-item.active {
      background: var(--lb-sidebar-item-active);
      color: var(--lb-color-primary-600);
    }

    .nav-item-icon {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .nav-item-label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .collapsed .nav-item-label {
      display: none;
    }

    .nav-item-badge {
      background: var(--lb-color-primary-500);
      color: white;
      font-size: var(--lb-font-size-xs);
      font-weight: var(--lb-font-weight-semibold);
      padding: 2px 8px;
      border-radius: var(--lb-radius-full);
      min-width: 20px;
      text-align: center;
    }

    .collapsed .nav-item-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      padding: 2px 4px;
      min-width: 16px;
      font-size: 10px;
    }

    .collapsed .nav-item {
      justify-content: center;
      padding: var(--lb-space-3);
      position: relative;
    }

    /* Collapse toggle */
    .collapse-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--lb-space-2);
      padding: var(--lb-space-3);
      margin: var(--lb-space-4);
      border: 1px solid var(--lb-color-border-light);
      border-radius: var(--lb-radius-md);
      background: transparent;
      color: var(--lb-color-text-secondary);
      font-size: var(--lb-font-size-sm);
      cursor: pointer;
      transition: all var(--lb-transition-fast);
    }

    .collapse-toggle:hover {
      background: var(--lb-sidebar-item-hover);
      color: var(--lb-color-text-primary);
    }

    .collapsed .collapse-toggle {
      padding: var(--lb-space-3);
    }

    .collapsed .collapse-toggle span {
      display: none;
    }

    @media (max-width: 768px) {
      .collapse-toggle {
        display: none;
      }
    }

    /* Quick Actions */
    .quick-actions {
      padding: var(--lb-space-4);
      border-top: 1px solid var(--lb-color-border-light);
    }

    .quick-action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--lb-space-2);
      width: 100%;
      padding: var(--lb-space-3);
      background: var(--lb-gradient-primary);
      color: white;
      border: none;
      border-radius: var(--lb-radius-md);
      font-size: var(--lb-font-size-sm);
      font-weight: var(--lb-font-weight-medium);
      cursor: pointer;
      transition: all var(--lb-transition-fast);
    }

    .quick-action-btn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .collapsed .quick-action-btn span {
      display: none;
    }
  `;

  @property({ type: Boolean }) open = true;
  @property({ type: Boolean }) collapsed = false;
  @property({ type: String }) currentPath = '/dashboard';

  private _mainNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', path: '/dashboard' },
    { id: 'accounts', label: 'Mis Cuentas', icon: '💳', path: '/accounts' },
    { id: 'transfers', label: 'Transferencias', icon: '↗️', path: '/transfers', badge: '2' },
    { id: 'cards', label: 'Tarjetas', icon: '💳', path: '/cards' },
    { id: 'history', label: 'Historial', icon: '📋', path: '/history' },
  ];

  private _secondaryNavItems: NavItem[] = [
    { id: 'settings', label: 'Configuración', icon: '⚙️', path: '/settings' },
  ];

  render() {
    const asideClasses = {
      collapsed: this.collapsed,
      open: this.open,
      hidden: !this.open,
    };

    return html`
      <div
        class="backdrop ${this.open ? 'visible' : ''}"
        @click=${this._closeSidebar}
      ></div>

      <aside class=${classMap(asideClasses)}>
        <nav>
          <div class="nav-section">
            ${!this.collapsed
              ? html`<div class="nav-section-title">Principal</div>`
              : ''}
            <div class="nav-items">
              ${this._mainNavItems.map((item) => this._renderNavItem(item))}
            </div>
          </div>

          <div class="nav-section">
            ${!this.collapsed
              ? html`<div class="nav-section-title">Ajustes</div>`
              : ''}
            <div class="nav-items">
              ${this._secondaryNavItems.map((item) => this._renderNavItem(item))}
            </div>
          </div>
        </nav>

        <div class="quick-actions">
          <button class="quick-action-btn" @click=${this._handleQuickTransfer}>
            ↗️ ${!this.collapsed ? html`<span>Nueva Transferencia</span>` : ''}
          </button>
        </div>

        <button class="collapse-toggle" @click=${this._toggleCollapse}>
          ${this.collapsed ? '→' : '←'}
          ${!this.collapsed ? html`<span>Colapsar</span>` : ''}
        </button>
      </aside>
    `;
  }

  private _renderNavItem(item: NavItem) {
    const isActive = this.currentPath.startsWith(item.path);

    return html`
      <a
        href=${item.path}
        class="nav-item ${isActive ? 'active' : ''}"
        @click=${(e: Event) => this._handleNavClick(e, item)}
      >
        <span class="nav-item-icon">${item.icon}</span>
        <span class="nav-item-label">${item.label}</span>
        ${item.badge
          ? html`<span class="nav-item-badge">${item.badge}</span>`
          : ''}
      </a>
    `;
  }

  private _handleNavClick(e: Event, item: NavItem) {
    e.preventDefault();

    this.dispatchEvent(
      new CustomEvent('navigate', {
        detail: { path: item.path },
        bubbles: true,
        composed: true,
      })
    );

    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
      this._closeSidebar();
    }
  }

  private _closeSidebar() {
    this.dispatchEvent(
      new CustomEvent('close-sidebar', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _toggleCollapse() {
    this.dispatchEvent(
      new CustomEvent('toggle-collapse', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleQuickTransfer() {
    this.dispatchEvent(
      new CustomEvent('navigate', {
        detail: { path: '/transfers/new' },
        bubbles: true,
        composed: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-sidebar': AppSidebar;
  }
}

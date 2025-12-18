import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { authService } from '../../services/auth.service';
import type { User } from '../../types';

// Import components
import '../ui/lb-avatar/lb-avatar';
import '../ui/lb-dropdown/lb-dropdown';
import '../ui/lb-badge/lb-badge';

/**
 * SendellBank App Header Component
 * @element app-header
 */
@customElement('app-header')
export class AppHeader extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: var(--lb-header-height);
      padding: 0 var(--lb-space-6);
      background: var(--lb-color-surface);
      border-bottom: 1px solid var(--lb-color-border-light);
      position: sticky;
      top: 0;
      z-index: var(--lb-z-sticky);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: var(--lb-space-4);
    }

    .menu-toggle {
      display: none;
      width: 40px;
      height: 40px;
      border: none;
      background: transparent;
      border-radius: var(--lb-radius-md);
      cursor: pointer;
      font-size: 1.25rem;
    }

    .menu-toggle:hover {
      background: var(--lb-color-hover);
    }

    @media (max-width: 768px) {
      .menu-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .logo {
      display: flex;
      align-items: center;
      gap: var(--lb-space-2);
      text-decoration: none;
    }

    .logo-icon {
      width: 36px;
      height: 36px;
      background: var(--lb-gradient-primary);
      border-radius: var(--lb-radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .logo-text {
      font-size: var(--lb-font-size-xl);
      font-weight: var(--lb-font-weight-bold);
      color: var(--lb-color-text-primary);
    }

    @media (max-width: 480px) {
      .logo-text {
        display: none;
      }
    }

    /* Search */
    .search-container {
      flex: 1;
      max-width: 400px;
      margin: 0 var(--lb-space-8);
    }

    @media (max-width: 768px) {
      .search-container {
        display: none;
      }
    }

    .search-input {
      width: 100%;
      padding: var(--lb-space-2) var(--lb-space-4);
      padding-left: var(--lb-space-10);
      background: var(--lb-color-surface-variant);
      border: 1px solid transparent;
      border-radius: var(--lb-radius-full);
      font-size: var(--lb-font-size-sm);
      color: var(--lb-color-text-primary);
      transition: all var(--lb-transition-fast);
    }

    .search-input::placeholder {
      color: var(--lb-color-text-tertiary);
    }

    .search-input:focus {
      outline: none;
      border-color: var(--lb-color-primary-500);
      background: var(--lb-color-surface);
    }

    .search-wrapper {
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: var(--lb-space-3);
      top: 50%;
      transform: translateY(-50%);
      color: var(--lb-color-text-tertiary);
    }

    /* Header Right */
    .header-right {
      display: flex;
      align-items: center;
      gap: var(--lb-space-2);
    }

    .icon-button {
      width: 40px;
      height: 40px;
      border: none;
      background: transparent;
      border-radius: var(--lb-radius-md);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      color: var(--lb-color-text-secondary);
      position: relative;
      transition: all var(--lb-transition-fast);
    }

    .icon-button:hover {
      background: var(--lb-color-hover);
      color: var(--lb-color-text-primary);
    }

    .notification-badge {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 8px;
      height: 8px;
      background: var(--lb-color-error);
      border-radius: var(--lb-radius-full);
      border: 2px solid var(--lb-color-surface);
    }

    /* User menu */
    .user-menu {
      display: flex;
      align-items: center;
      gap: var(--lb-space-3);
      padding: var(--lb-space-2);
      padding-right: var(--lb-space-3);
      border-radius: var(--lb-radius-full);
      cursor: pointer;
      transition: background var(--lb-transition-fast);
    }

    .user-menu:hover {
      background: var(--lb-color-hover);
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    @media (max-width: 640px) {
      .user-info {
        display: none;
      }
    }

    .user-name {
      font-size: var(--lb-font-size-sm);
      font-weight: var(--lb-font-weight-medium);
      color: var(--lb-color-text-primary);
    }

    .user-role {
      font-size: var(--lb-font-size-xs);
      color: var(--lb-color-text-tertiary);
    }

    .dropdown-chevron {
      color: var(--lb-color-text-tertiary);
      font-size: 0.75rem;
    }
  `;

  @property({ type: Boolean }) sidebarOpen = true;

  @state() private _user: User | null = null;
  @state() private _notificationCount = 3;

  private _userMenuItems = [
    { id: 'profile', label: 'Mi Perfil', icon: '👤' },
    { id: 'settings', label: 'Configuración', icon: '⚙️' },
    { id: 'help', label: 'Ayuda', icon: '❓' },
    { id: 'divider', label: '', divider: true },
    { id: 'logout', label: 'Cerrar sesión', icon: '🚪', danger: true },
  ];

  connectedCallback() {
    super.connectedCallback();
    this._user = authService.getUser();
  }

  render() {
    return html`
      <header>
        <div class="header-left">
          <button class="menu-toggle" @click=${this._toggleSidebar}>
            ☰
          </button>

          <a href="/dashboard" class="logo">
            <span class="logo-icon">🏦</span>
            <span class="logo-text">SendellBank</span>
          </a>
        </div>

        <div class="search-container">
          <div class="search-wrapper">
            <span class="search-icon">🔍</span>
            <input
              type="search"
              class="search-input"
              placeholder="Buscar transacciones, cuentas..."
              @input=${this._handleSearch}
            />
          </div>
        </div>

        <div class="header-right">
          <button
            class="icon-button"
            title="Notificaciones"
            @click=${this._openNotifications}
          >
            🔔
            ${this._notificationCount > 0
              ? html`<span class="notification-badge"></span>`
              : ''}
          </button>

          <button
            class="icon-button"
            title="Cambiar tema"
            @click=${this._toggleTheme}
          >
            🌙
          </button>

          <lb-dropdown
            .items=${this._userMenuItems}
            position="bottom-end"
            @lb-select=${this._handleUserMenuSelect}
          >
            <div slot="trigger" class="user-menu">
              <div class="user-info">
                <span class="user-name">${this._user?.name || 'Usuario'}</span>
                <span class="user-role">Cliente Premium</span>
              </div>
              <lb-avatar
                .name=${this._user?.name || 'U'}
                size="sm"
                status="online"
              ></lb-avatar>
              <span class="dropdown-chevron">▼</span>
            </div>
          </lb-dropdown>
        </div>
      </header>
    `;
  }

  private _toggleSidebar() {
    this.dispatchEvent(
      new CustomEvent('toggle-sidebar', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleSearch(e: Event) {
    const query = (e.target as HTMLInputElement).value;
    this.dispatchEvent(
      new CustomEvent('search', {
        detail: { query },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _openNotifications() {
    this.dispatchEvent(
      new CustomEvent('open-notifications', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }

  private _handleUserMenuSelect(e: CustomEvent<{ itemId: string }>) {
    switch (e.detail.itemId) {
      case 'profile':
        window.location.href = '/settings/profile';
        break;
      case 'settings':
        window.location.href = '/settings';
        break;
      case 'help':
        // Open help modal
        break;
      case 'logout':
        authService.logout();
        break;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-header': AppHeader;
  }
}

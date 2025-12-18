import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { provide } from '@lit/context';
import { userContext, uiContext } from './state/app.context';
import type { User, UIState } from './types';
import { authService } from './services/auth.service';
import { eventBus } from './state/event-bus';
import { initRouter } from './router';

// Import global styles
import './styles/global.css';
import './styles/tokens.css';
import './styles/themes/light.css';
import './styles/themes/dark.css';
import './styles/animations.css';

// Import toast component for global notifications
import './components/ui/lb-toast/lb-toast';
import './components/ui/lb-spinner/lb-spinner';

/**
 * SendellBank Application Root
 * Main entry component that provides context and initializes the router
 * @element app-root
 */
@customElement('app-root')
export class AppRoot extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
    }

    .app-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: var(--lb-color-background);
    }

    .loading-logo {
      font-size: 3rem;
      margin-bottom: var(--lb-space-4);
      animation: pulse 2s infinite;
    }

    .loading-text {
      color: var(--lb-color-text-secondary);
      font-size: var(--lb-font-size-sm);
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    #router-outlet {
      display: block;
      min-height: 100vh;
    }
  `;

  @provide({ context: userContext })
  @state()
  private _user: User | null = null;

  @provide({ context: uiContext })
  @state()
  private _uiState: UIState = {
    theme: 'light',
    sidebarCollapsed: false,
    isLoading: false,
  };

  @state() private _isInitializing = true;

  connectedCallback() {
    super.connectedCallback();
    this._initialize();
    this._setupEventListeners();
    this._loadThemePreference();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
  }

  private async _initialize() {
    try {
      // Check for existing session
      const session = await authService.getCurrentSession();
      if (session) {
        this._user = session.user;
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      this._isInitializing = false;
      // Initialize router after first render
      this.updateComplete.then(() => {
        const outlet = this.shadowRoot?.querySelector('#router-outlet');
        if (outlet) {
          initRouter(outlet);
        }
      });
    }
  }

  private _setupEventListeners() {
    // Listen for auth events
    eventBus.on('auth:login', this._handleLogin.bind(this));
    eventBus.on('auth:logout', this._handleLogout.bind(this));
    eventBus.on('auth:session-expired', this._handleSessionExpired.bind(this));

    // Listen for UI events
    eventBus.on('ui:theme-change', this._handleThemeChange.bind(this));
    eventBus.on('ui:sidebar-toggle', this._handleSidebarToggle.bind(this));
    eventBus.on('ui:loading', this._handleLoading.bind(this));
  }

  private _removeEventListeners() {
    eventBus.off('auth:login', this._handleLogin.bind(this));
    eventBus.off('auth:logout', this._handleLogout.bind(this));
    eventBus.off('auth:session-expired', this._handleSessionExpired.bind(this));
    eventBus.off('ui:theme-change', this._handleThemeChange.bind(this));
    eventBus.off('ui:sidebar-toggle', this._handleSidebarToggle.bind(this));
    eventBus.off('ui:loading', this._handleLoading.bind(this));
  }

  private _loadThemePreference() {
    const savedTheme = localStorage.getItem('sendell-theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    this._applyTheme(theme);
  }

  private _applyTheme(theme: 'light' | 'dark') {
    document.documentElement.setAttribute('data-theme', theme);
    this._uiState = { ...this._uiState, theme };
    localStorage.setItem('sendell-theme', theme);
  }

  private _handleLogin(user: User) {
    this._user = user;
  }

  private _handleLogout() {
    this._user = null;
    authService.logout();
  }

  private _handleSessionExpired() {
    this._user = null;
    eventBus.emit('toast:show', {
      message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      type: 'warning',
    });
  }

  private _handleThemeChange(theme: 'light' | 'dark') {
    this._applyTheme(theme);
  }

  private _handleSidebarToggle(collapsed: boolean) {
    this._uiState = { ...this._uiState, sidebarCollapsed: collapsed };
  }

  private _handleLoading(isLoading: boolean) {
    this._uiState = { ...this._uiState, isLoading };
  }

  render() {
    if (this._isInitializing) {
      return html`
        <div class="app-loading">
          <div class="loading-logo">🏦</div>
          <lb-spinner size="lg"></lb-spinner>
          <p class="loading-text">Cargando SendellBank...</p>
        </div>
      `;
    }

    return html`
      <div id="router-outlet"></div>
      <lb-toast></lb-toast>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-root': AppRoot;
  }
}

import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { Router } from '@vaadin/router';
import { authService } from '../../services/auth.service';
import { eventBus, AppEvents } from '../../state/event-bus';

// Import layout components
import './app-header';
import './app-sidebar';
import '../ui/lb-toast/lb-toast';

/**
 * SendellBank App Shell Component
 * @element app-shell
 *
 * Main application layout with header, sidebar and content area
 */
@customElement('app-shell')
export class AppShell extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
    }

    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: var(--lb-color-background);
    }

    .app-body {
      display: flex;
      flex: 1;
      padding-top: var(--lb-header-height);
    }

    .main-content {
      flex: 1;
      margin-left: var(--lb-sidebar-width);
      padding: var(--lb-space-6);
      transition: margin-left var(--lb-transition-normal);
      min-height: calc(100vh - var(--lb-header-height));
    }

    .main-content.sidebar-collapsed {
      margin-left: var(--lb-sidebar-collapsed-width);
    }

    @media (max-width: 768px) {
      .main-content {
        margin-left: 0;
        padding: var(--lb-space-4);
      }
    }

    .content-wrapper {
      max-width: var(--lb-content-max-width);
      margin: 0 auto;
    }

    /* Page transition */
    .page-enter {
      animation: pageEnter 0.3s ease forwards;
    }

    @keyframes pageEnter {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Login page - no shell */
    :host([page="login"]) .app-body,
    :host([page="login"]) app-header {
      display: none;
    }

    :host([page="login"]) .app-container {
      padding: 0;
    }
  `;

  @state() private _sidebarOpen = true;
  @state() private _sidebarCollapsed = false;
  @state() private _currentPath = '/dashboard';
  @state() private _isMobile = false;

  connectedCallback() {
    super.connectedCallback();
    this._checkMobile();
    this._setupEventListeners();
    this._initTheme();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this._checkMobile);
  }

  private _setupEventListeners() {
    // Window resize
    window.addEventListener('resize', this._checkMobile.bind(this));

    // Route changes
    eventBus.on(AppEvents.ROUTE_CHANGED, (data: { path: string }) => {
      this._currentPath = data.path;
    });

    // Session expired
    eventBus.on(AppEvents.AUTH_SESSION_EXPIRED, () => {
      // Toast is handled by auth service
    });
  }

  private _checkMobile() {
    this._isMobile = window.innerWidth <= 768;
    if (this._isMobile) {
      this._sidebarOpen = false;
    }
  }

  private _initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }

  render() {
    const mainContentClasses = {
      'main-content': true,
      'sidebar-collapsed': this._sidebarCollapsed,
    };

    return html`
      <div class="app-container">
        <app-header
          ?sidebarOpen=${this._sidebarOpen}
          @toggle-sidebar=${this._toggleSidebar}
          @search=${this._handleSearch}
          @open-notifications=${this._openNotifications}
        ></app-header>

        <div class="app-body">
          <app-sidebar
            ?open=${this._sidebarOpen}
            ?collapsed=${this._sidebarCollapsed}
            .currentPath=${this._currentPath}
            @navigate=${this._handleNavigate}
            @close-sidebar=${this._closeSidebar}
            @toggle-collapse=${this._toggleSidebarCollapse}
          ></app-sidebar>

          <main class=${classMap(mainContentClasses)}>
            <div class="content-wrapper page-enter">
              <slot></slot>
            </div>
          </main>
        </div>

        <lb-toast-container position="top-right"></lb-toast-container>
      </div>
    `;
  }

  private _toggleSidebar() {
    this._sidebarOpen = !this._sidebarOpen;
  }

  private _closeSidebar() {
    this._sidebarOpen = false;
  }

  private _toggleSidebarCollapse() {
    this._sidebarCollapsed = !this._sidebarCollapsed;
  }

  private _handleNavigate(e: CustomEvent<{ path: string }>) {
    Router.go(e.detail.path);
  }

  private _handleSearch(e: CustomEvent<{ query: string }>) {
    console.log('Search:', e.detail.query);
    // Implement global search
  }

  private _openNotifications() {
    console.log('Open notifications');
    // Open notifications panel
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-shell': AppShell;
  }
}

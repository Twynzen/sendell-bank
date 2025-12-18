import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { authService } from '../services/auth.service';
import { toast } from '../components/ui/lb-toast/lb-toast';
import type { User } from '../types';

// Import components
import '../components/ui/lb-card/lb-card';
import '../components/ui/lb-button/lb-button';
import '../components/ui/lb-input/lb-input';
import '../components/ui/lb-tabs/lb-tabs';
import '../components/ui/lb-avatar/lb-avatar';

/**
 * SendellBank Settings Page
 * @element page-settings
 */
@customElement('page-settings')
export class PageSettings extends LitElement {
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

    /* Settings Container */
    .settings-container {
      display: grid;
      grid-template-columns: 240px 1fr;
      gap: var(--lb-space-6);
    }

    @media (max-width: 768px) {
      .settings-container {
        grid-template-columns: 1fr;
      }
    }

    /* Sidebar Navigation */
    .settings-nav {
      background: var(--lb-color-surface);
      border: 1px solid var(--lb-color-border);
      border-radius: var(--lb-radius-xl);
      padding: var(--lb-space-3);
      height: fit-content;
      position: sticky;
      top: calc(var(--lb-header-height) + var(--lb-space-6));
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: var(--lb-space-3);
      padding: var(--lb-space-3);
      border-radius: var(--lb-radius-md);
      color: var(--lb-color-text-secondary);
      cursor: pointer;
      transition: all var(--lb-transition-fast);
    }

    .nav-item:hover {
      background: var(--lb-color-hover);
      color: var(--lb-color-text-primary);
    }

    .nav-item.active {
      background: var(--lb-color-primary-50);
      color: var(--lb-color-primary-600);
    }

    .nav-icon {
      font-size: 1.25rem;
    }

    /* Settings Content */
    .settings-content {
      background: var(--lb-color-surface);
      border: 1px solid var(--lb-color-border);
      border-radius: var(--lb-radius-xl);
      overflow: hidden;
    }

    .content-header {
      padding: var(--lb-space-5);
      border-bottom: 1px solid var(--lb-color-border-light);
    }

    .content-title {
      font-size: var(--lb-font-size-xl);
      font-weight: var(--lb-font-weight-semibold);
    }

    .content-body {
      padding: var(--lb-space-5);
    }

    /* Profile Section */
    .profile-header {
      display: flex;
      align-items: center;
      gap: var(--lb-space-5);
      margin-bottom: var(--lb-space-6);
    }

    .avatar-section {
      position: relative;
    }

    .avatar-edit {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 32px;
      height: 32px;
      background: var(--lb-color-primary-500);
      color: white;
      border: none;
      border-radius: var(--lb-radius-full);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .profile-info h3 {
      font-size: var(--lb-font-size-xl);
      font-weight: var(--lb-font-weight-semibold);
      margin-bottom: var(--lb-space-1);
    }

    .profile-info p {
      color: var(--lb-color-text-secondary);
      font-size: var(--lb-font-size-sm);
    }

    /* Form Grid */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--lb-space-4);
    }

    @media (max-width: 640px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }

    .form-full {
      grid-column: 1 / -1;
    }

    /* Section Divider */
    .section-divider {
      border-top: 1px solid var(--lb-color-border-light);
      margin: var(--lb-space-6) 0;
      padding-top: var(--lb-space-6);
    }

    .section-title {
      font-size: var(--lb-font-size-lg);
      font-weight: var(--lb-font-weight-semibold);
      margin-bottom: var(--lb-space-4);
    }

    /* Toggle Item */
    .toggle-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--lb-space-4) 0;
      border-bottom: 1px solid var(--lb-color-border-light);
    }

    .toggle-item:last-child {
      border-bottom: none;
    }

    .toggle-info h4 {
      font-weight: var(--lb-font-weight-medium);
      margin-bottom: var(--lb-space-1);
    }

    .toggle-info p {
      font-size: var(--lb-font-size-sm);
      color: var(--lb-color-text-secondary);
    }

    .toggle-switch {
      position: relative;
      width: 48px;
      height: 24px;
      background: var(--lb-color-neutral-300);
      border-radius: var(--lb-radius-full);
      cursor: pointer;
      transition: background var(--lb-transition-fast);
    }

    .toggle-switch.active {
      background: var(--lb-color-success);
    }

    .toggle-switch::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: var(--lb-radius-full);
      transition: transform var(--lb-transition-fast);
      box-shadow: var(--lb-shadow-sm);
    }

    .toggle-switch.active::after {
      transform: translateX(24px);
    }

    /* Theme Selection */
    .theme-options {
      display: flex;
      gap: var(--lb-space-3);
    }

    .theme-option {
      flex: 1;
      padding: var(--lb-space-4);
      border: 2px solid var(--lb-color-border);
      border-radius: var(--lb-radius-lg);
      text-align: center;
      cursor: pointer;
      transition: all var(--lb-transition-fast);
    }

    .theme-option:hover {
      border-color: var(--lb-color-primary-300);
    }

    .theme-option.selected {
      border-color: var(--lb-color-primary-500);
      background: var(--lb-color-primary-50);
    }

    .theme-icon {
      font-size: 2rem;
      margin-bottom: var(--lb-space-2);
    }

    .theme-label {
      font-weight: var(--lb-font-weight-medium);
    }

    /* Action Buttons */
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--lb-space-3);
      margin-top: var(--lb-space-6);
      padding-top: var(--lb-space-4);
      border-top: 1px solid var(--lb-color-border-light);
    }

    /* Danger Zone */
    .danger-zone {
      background: var(--lb-color-error-light);
      border: 1px solid var(--lb-color-error);
      border-radius: var(--lb-radius-lg);
      padding: var(--lb-space-4);
      margin-top: var(--lb-space-6);
    }

    .danger-zone h4 {
      color: var(--lb-color-error);
      margin-bottom: var(--lb-space-2);
    }

    .danger-zone p {
      font-size: var(--lb-font-size-sm);
      color: var(--lb-color-text-secondary);
      margin-bottom: var(--lb-space-4);
    }
  `;

  @state() private _activeSection = 'profile';
  @state() private _user: User | null = null;
  @state() private _theme = 'light';
  @state() private _notifications = {
    email: true,
    push: true,
    sms: false,
    transactions: true,
    marketing: false,
  };

  private _navItems = [
    { id: 'profile', icon: '👤', label: 'Perfil' },
    { id: 'security', icon: '🔒', label: 'Seguridad' },
    { id: 'notifications', icon: '🔔', label: 'Notificaciones' },
    { id: 'appearance', icon: '🎨', label: 'Apariencia' },
  ];

  connectedCallback() {
    super.connectedCallback();
    this._user = authService.getUser();
    this._theme =
      document.documentElement.getAttribute('data-theme') || 'light';
  }

  render() {
    return html`
      <div class="page-header">
        <h1 class="page-title">Configuración</h1>
        <p class="page-subtitle">Personaliza tu experiencia bancaria</p>
      </div>

      <div class="settings-container">
        ${this._renderNav()}
        ${this._renderContent()}
      </div>
    `;
  }

  private _renderNav() {
    return html`
      <nav class="settings-nav">
        ${this._navItems.map(
          (item) => html`
            <div
              class="nav-item ${this._activeSection === item.id
                ? 'active'
                : ''}"
              @click=${() => (this._activeSection = item.id)}
            >
              <span class="nav-icon">${item.icon}</span>
              <span>${item.label}</span>
            </div>
          `
        )}
      </nav>
    `;
  }

  private _renderContent() {
    return html`
      <div class="settings-content">
        ${this._activeSection === 'profile'
          ? this._renderProfile()
          : this._activeSection === 'security'
          ? this._renderSecurity()
          : this._activeSection === 'notifications'
          ? this._renderNotifications()
          : this._renderAppearance()}
      </div>
    `;
  }

  private _renderProfile() {
    return html`
      <div class="content-header">
        <h2 class="content-title">Información Personal</h2>
      </div>
      <div class="content-body">
        <div class="profile-header">
          <div class="avatar-section">
            <lb-avatar
              name=${this._user?.name || 'Usuario'}
              size="xl"
            ></lb-avatar>
            <button class="avatar-edit">📷</button>
          </div>
          <div class="profile-info">
            <h3>${this._user?.name || 'Daniel Martínez'}</h3>
            <p>Cliente desde enero 2020</p>
          </div>
        </div>

        <div class="form-grid">
          <lb-input
            label="Nombre completo"
            .value=${this._user?.name || 'Daniel Martínez'}
          ></lb-input>
          <lb-input
            label="Correo electrónico"
            type="email"
            .value=${this._user?.email || 'daniel@example.com'}
          ></lb-input>
          <lb-input
            label="Teléfono"
            type="tel"
            value="+57 300 123 4567"
          ></lb-input>
          <lb-input
            label="Documento de identidad"
            value="CC 1234567890"
            disabled
          ></lb-input>
        </div>

        <div class="form-actions">
          <lb-button variant="outline">Cancelar</lb-button>
          <lb-button @click=${this._saveProfile}>Guardar cambios</lb-button>
        </div>
      </div>
    `;
  }

  private _renderSecurity() {
    return html`
      <div class="content-header">
        <h2 class="content-title">Seguridad</h2>
      </div>
      <div class="content-body">
        <div class="section-title">Cambiar contraseña</div>
        <div class="form-grid">
          <lb-input
            label="Contraseña actual"
            type="password"
            class="form-full"
          ></lb-input>
          <lb-input label="Nueva contraseña" type="password"></lb-input>
          <lb-input label="Confirmar contraseña" type="password"></lb-input>
        </div>

        <lb-button style="margin-top: var(--lb-space-4);">
          Actualizar contraseña
        </lb-button>

        <div class="section-divider">
          <div class="section-title">Autenticación de dos factores</div>

          <div class="toggle-item">
            <div class="toggle-info">
              <h4>Código SMS</h4>
              <p>Recibe un código de verificación por SMS</p>
            </div>
            <div class="toggle-switch active"></div>
          </div>

          <div class="toggle-item">
            <div class="toggle-info">
              <h4>App de autenticación</h4>
              <p>Usa Google Authenticator o similar</p>
            </div>
            <div class="toggle-switch"></div>
          </div>
        </div>

        <div class="danger-zone">
          <h4>⚠️ Zona de peligro</h4>
          <p>
            Cerrar sesión en todos los dispositivos. Esta acción no se puede
            deshacer.
          </p>
          <lb-button variant="danger" size="sm">
            Cerrar todas las sesiones
          </lb-button>
        </div>
      </div>
    `;
  }

  private _renderNotifications() {
    return html`
      <div class="content-header">
        <h2 class="content-title">Notificaciones</h2>
      </div>
      <div class="content-body">
        <div class="section-title">Canales de notificación</div>

        <div class="toggle-item">
          <div class="toggle-info">
            <h4>Notificaciones por email</h4>
            <p>Recibe alertas importantes en tu correo</p>
          </div>
          <div
            class="toggle-switch ${this._notifications.email ? 'active' : ''}"
            @click=${() => this._toggleNotification('email')}
          ></div>
        </div>

        <div class="toggle-item">
          <div class="toggle-info">
            <h4>Notificaciones push</h4>
            <p>Alertas instantáneas en tu dispositivo</p>
          </div>
          <div
            class="toggle-switch ${this._notifications.push ? 'active' : ''}"
            @click=${() => this._toggleNotification('push')}
          ></div>
        </div>

        <div class="toggle-item">
          <div class="toggle-info">
            <h4>Mensajes SMS</h4>
            <p>Recibe alertas por mensaje de texto</p>
          </div>
          <div
            class="toggle-switch ${this._notifications.sms ? 'active' : ''}"
            @click=${() => this._toggleNotification('sms')}
          ></div>
        </div>

        <div class="section-divider">
          <div class="section-title">Tipos de notificación</div>

          <div class="toggle-item">
            <div class="toggle-info">
              <h4>Alertas de transacciones</h4>
              <p>Notificaciones de movimientos en tus cuentas</p>
            </div>
            <div
              class="toggle-switch ${this._notifications.transactions
                ? 'active'
                : ''}"
              @click=${() => this._toggleNotification('transactions')}
            ></div>
          </div>

          <div class="toggle-item">
            <div class="toggle-info">
              <h4>Ofertas y promociones</h4>
              <p>Recibe información sobre productos y servicios</p>
            </div>
            <div
              class="toggle-switch ${this._notifications.marketing
                ? 'active'
                : ''}"
              @click=${() => this._toggleNotification('marketing')}
            ></div>
          </div>
        </div>

        <div class="form-actions">
          <lb-button @click=${() => toast.success('Preferencias guardadas')}>
            Guardar preferencias
          </lb-button>
        </div>
      </div>
    `;
  }

  private _renderAppearance() {
    return html`
      <div class="content-header">
        <h2 class="content-title">Apariencia</h2>
      </div>
      <div class="content-body">
        <div class="section-title">Tema de la aplicación</div>

        <div class="theme-options">
          <div
            class="theme-option ${this._theme === 'light' ? 'selected' : ''}"
            @click=${() => this._setTheme('light')}
          >
            <div class="theme-icon">☀️</div>
            <div class="theme-label">Claro</div>
          </div>
          <div
            class="theme-option ${this._theme === 'dark' ? 'selected' : ''}"
            @click=${() => this._setTheme('dark')}
          >
            <div class="theme-icon">🌙</div>
            <div class="theme-label">Oscuro</div>
          </div>
          <div
            class="theme-option ${this._theme === 'system' ? 'selected' : ''}"
            @click=${() => this._setTheme('system')}
          >
            <div class="theme-icon">💻</div>
            <div class="theme-label">Sistema</div>
          </div>
        </div>
      </div>
    `;
  }

  private _toggleNotification(key: keyof typeof this._notifications) {
    this._notifications = {
      ...this._notifications,
      [key]: !this._notifications[key],
    };
  }

  private _setTheme(theme: string) {
    this._theme = theme;
    const actualTheme =
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme;

    document.documentElement.setAttribute('data-theme', actualTheme);
    localStorage.setItem('theme', theme);
    toast.success(`Tema ${theme === 'dark' ? 'oscuro' : theme === 'light' ? 'claro' : 'del sistema'} aplicado`);
  }

  private _saveProfile() {
    toast.success('Perfil actualizado correctamente');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'page-settings': PageSettings;
  }
}

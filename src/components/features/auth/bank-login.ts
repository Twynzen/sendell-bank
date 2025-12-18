import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { authService } from '../../../services/auth.service';
import { toast } from '../../ui/lb-toast/lb-toast';

// Import UI components
import '../../ui/lb-button/lb-button';
import '../../ui/lb-input/lb-input';
import '../../ui/lb-card/lb-card';
import '../../ui/lb-spinner/lb-spinner';
import './otp-input';

type LoginStep = 'credentials' | 'otp' | 'success' | 'error';

/**
 * SendellBank Login Component
 * @element bank-login
 *
 * Complete authentication flow with credentials and OTP verification
 */
@customElement('bank-login')
export class BankLogin extends LitElement {
  static styles = css`
    :host {
      display: flex;
      min-height: 100vh;
      align-items: center;
      justify-content: center;
      background: var(--lb-gradient-header);
      padding: var(--lb-space-4);
    }

    .login-container {
      width: 100%;
      max-width: 440px;
    }

    /* Logo Section */
    .logo-section {
      text-align: center;
      margin-bottom: var(--lb-space-8);
    }

    .logo-icon {
      width: 88px;
      height: 88px;
      background: var(--lb-color-surface);
      border-radius: var(--lb-radius-2xl);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--lb-space-4);
      font-size: 3rem;
      box-shadow: var(--lb-shadow-xl);
      animation: float 3s ease-in-out infinite;
    }

    .logo-text {
      color: var(--lb-color-text-inverse);
      font-size: var(--lb-font-size-3xl);
      font-weight: var(--lb-font-weight-bold);
      letter-spacing: var(--lb-letter-spacing-tight);
    }

    .logo-tagline {
      color: rgba(255, 255, 255, 0.8);
      font-size: var(--lb-font-size-sm);
      margin-top: var(--lb-space-2);
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    /* Login Card */
    .login-card {
      background: var(--lb-color-surface);
      border-radius: var(--lb-radius-2xl);
      padding: var(--lb-space-8);
      box-shadow: var(--lb-shadow-2xl);
    }

    .form-title {
      text-align: center;
      font-size: var(--lb-font-size-2xl);
      font-weight: var(--lb-font-weight-semibold);
      color: var(--lb-color-text-primary);
      margin-bottom: var(--lb-space-2);
    }

    .form-subtitle {
      text-align: center;
      font-size: var(--lb-font-size-sm);
      color: var(--lb-color-text-secondary);
      margin-bottom: var(--lb-space-6);
    }

    /* Form */
    .login-form {
      display: flex;
      flex-direction: column;
      gap: var(--lb-space-4);
    }

    /* Error Alert */
    .error-alert {
      display: flex;
      align-items: center;
      gap: var(--lb-space-3);
      background: var(--lb-color-error-light);
      color: var(--lb-color-error);
      padding: var(--lb-space-3) var(--lb-space-4);
      border-radius: var(--lb-radius-md);
      font-size: var(--lb-font-size-sm);
      animation: slideInDown 0.3s ease;
    }

    @keyframes slideInDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Success State */
    .success-container {
      text-align: center;
      padding: var(--lb-space-8);
    }

    .success-icon {
      width: 100px;
      height: 100px;
      background: var(--lb-color-success-light);
      color: var(--lb-color-success);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      margin: 0 auto var(--lb-space-6);
      animation: scaleIn 0.4s var(--lb-ease-bounce);
    }

    @keyframes scaleIn {
      from {
        transform: scale(0);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    .success-title {
      font-size: var(--lb-font-size-2xl);
      font-weight: var(--lb-font-weight-semibold);
      color: var(--lb-color-text-primary);
      margin-bottom: var(--lb-space-2);
    }

    .success-subtitle {
      color: var(--lb-color-text-secondary);
    }

    /* OTP Step */
    .otp-icon {
      width: 72px;
      height: 72px;
      background: var(--lb-color-primary-50);
      color: var(--lb-color-primary-500);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      margin: 0 auto var(--lb-space-4);
    }

    .otp-sent-to {
      background: var(--lb-color-neutral-100);
      padding: var(--lb-space-2) var(--lb-space-4);
      border-radius: var(--lb-radius-full);
      font-family: var(--lb-font-family-mono);
      font-size: var(--lb-font-size-sm);
      display: inline-block;
      margin-bottom: var(--lb-space-4);
    }

    /* Forgot Password Link */
    .forgot-password {
      text-align: right;
    }

    .forgot-password a {
      color: var(--lb-color-primary-500);
      font-size: var(--lb-font-size-sm);
      text-decoration: none;
    }

    .forgot-password a:hover {
      text-decoration: underline;
    }

    /* Back Button */
    .back-button {
      display: flex;
      align-items: center;
      gap: var(--lb-space-2);
      color: var(--lb-color-text-secondary);
      font-size: var(--lb-font-size-sm);
      cursor: pointer;
      border: none;
      background: none;
      padding: var(--lb-space-2);
      margin: var(--lb-space-4) auto 0;
      transition: color var(--lb-transition-fast);
    }

    .back-button:hover {
      color: var(--lb-color-text-primary);
    }

    /* Footer */
    .login-footer {
      text-align: center;
      margin-top: var(--lb-space-6);
      color: rgba(255, 255, 255, 0.7);
      font-size: var(--lb-font-size-xs);
    }

    .login-footer a {
      color: rgba(255, 255, 255, 0.9);
    }

    /* Demo credentials hint */
    .demo-hint {
      background: var(--lb-color-info-light);
      color: var(--lb-color-info-dark);
      padding: var(--lb-space-3) var(--lb-space-4);
      border-radius: var(--lb-radius-md);
      font-size: var(--lb-font-size-sm);
      margin-top: var(--lb-space-4);
    }

    .demo-hint strong {
      display: block;
      margin-bottom: var(--lb-space-1);
    }

    .demo-hint code {
      background: rgba(0, 0, 0, 0.1);
      padding: 2px 6px;
      border-radius: var(--lb-radius-sm);
      font-family: var(--lb-font-family-mono);
      font-size: var(--lb-font-size-xs);
    }
  `;

  @state() private _step: LoginStep = 'credentials';
  @state() private _formData = { username: '', password: '' };
  @state() private _error = '';
  @state() private _isLoading = false;
  @state() private _userName = '';
  @state() private _otpSentTo = '';

  render() {
    return html`
      <div class="login-container">
        ${this._renderLogo()}

        <div class="login-card">
          ${this._renderCurrentStep()}
        </div>

        ${this._renderFooter()}
      </div>
    `;
  }

  private _renderLogo() {
    return html`
      <div class="logo-section">
        <div class="logo-icon">🏦</div>
        <div class="logo-text">SendellBank</div>
        <div class="logo-tagline">Tu banca digital segura</div>
      </div>
    `;
  }

  private _renderCurrentStep() {
    switch (this._step) {
      case 'credentials':
        return this._renderCredentialsStep();
      case 'otp':
        return this._renderOtpStep();
      case 'success':
        return this._renderSuccessStep();
      default:
        return this._renderCredentialsStep();
    }
  }

  private _renderCredentialsStep() {
    return html`
      <h1 class="form-title">Bienvenido</h1>
      <p class="form-subtitle">Ingresa tus credenciales para continuar</p>

      ${this._error
        ? html`
            <div class="error-alert">
              <span>⚠️</span>
              <span>${this._error}</span>
            </div>
          `
        : ''}

      <form class="login-form" @submit=${this._handleCredentialsSubmit}>
        <lb-input
          label="Usuario"
          placeholder="Ingresa tu usuario"
          .value=${this._formData.username}
          @lb-input=${(e: CustomEvent) =>
            (this._formData.username = e.detail.value)}
          autocomplete="username"
          required
        >
          <span slot="prefix">👤</span>
        </lb-input>

        <lb-input
          type="password"
          label="Contraseña"
          placeholder="Ingresa tu contraseña"
          .value=${this._formData.password}
          @lb-input=${(e: CustomEvent) =>
            (this._formData.password = e.detail.value)}
          autocomplete="current-password"
          required
        >
          <span slot="prefix">🔒</span>
        </lb-input>

        <div class="forgot-password">
          <a href="/forgot-password">¿Olvidaste tu contraseña?</a>
        </div>

        <lb-button
          type="submit"
          fullWidth
          size="lg"
          .loading=${this._isLoading}
        >
          Iniciar sesión
        </lb-button>
      </form>

      <div class="demo-hint">
        <strong>ℹ️ Credenciales de demostración:</strong>
        Usuario: <code>daniel.martinez</code> | Contraseña: <code>Demo1234!</code>
        <br />OTP: <code>123456</code>
      </div>
    `;
  }

  private _renderOtpStep() {
    return html`
      <div style="text-align: center;">
        <div class="otp-icon">📱</div>
        <h2 class="form-title">Verificación</h2>
        <p class="form-subtitle">
          Ingresa el código de 6 dígitos enviado a
        </p>
        <span class="otp-sent-to">${this._otpSentTo}</span>
      </div>

      ${this._error
        ? html`
            <div class="error-alert">
              <span>⚠️</span>
              <span>${this._error}</span>
            </div>
          `
        : ''}

      <otp-input
        length="6"
        ?disabled=${this._isLoading}
        ?error=${!!this._error}
        @otp-complete=${this._handleOtpComplete}
        @otp-resend=${this._handleResendOtp}
      ></otp-input>

      ${this._isLoading
        ? html`
            <div style="text-align: center; margin-top: var(--lb-space-4);">
              <lb-spinner size="sm" text="Verificando..."></lb-spinner>
            </div>
          `
        : ''}

      <button class="back-button" @click=${this._handleBackToCredentials}>
        ← Volver al inicio de sesión
      </button>
    `;
  }

  private _renderSuccessStep() {
    return html`
      <div class="success-container">
        <div class="success-icon">✓</div>
        <h2 class="success-title">¡Hola, ${this._userName}!</h2>
        <p class="success-subtitle">
          Autenticación exitosa. Redirigiendo al dashboard...
        </p>
        <lb-spinner size="sm" text="Cargando..."></lb-spinner>
      </div>
    `;
  }

  private _renderFooter() {
    return html`
      <div class="login-footer">
        <p>© ${new Date().getFullYear()} SendellBank. Todos los derechos reservados.</p>
        <p>
          <a href="/privacy">Privacidad</a> · <a href="/terms">Términos</a>
        </p>
      </div>
    `;
  }

  private async _handleCredentialsSubmit(e: Event) {
    e.preventDefault();
    this._error = '';
    this._isLoading = true;

    try {
      const result = await authService.validateCredentials(
        this._formData.username,
        this._formData.password
      );

      if (result.success) {
        this._userName = this._formData.username.split('.')[0];
        this._userName =
          this._userName.charAt(0).toUpperCase() + this._userName.slice(1);
        this._otpSentTo = result.otpSentTo || '***-***-7890';
        this._step = 'otp';

        toast.info('Código de verificación enviado');
      } else {
        this._error = result.message || 'Credenciales inválidas';
        toast.error(this._error);
      }
    } catch (error) {
      this._error = 'Error de conexión. Intenta de nuevo.';
      toast.error(this._error);
    } finally {
      this._isLoading = false;
    }
  }

  private async _handleOtpComplete(e: CustomEvent<{ code: string }>) {
    this._error = '';
    this._isLoading = true;

    try {
      const result = await authService.verifyOtp(e.detail.code);

      if (result.success) {
        this._step = 'success';
        toast.success('¡Bienvenido a SendellBank!');

        // Redirect after animation
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        this._error = result.message || 'Código inválido';
        toast.error(this._error);

        // Clear OTP input
        const otpInput = this.shadowRoot?.querySelector('otp-input');
        (otpInput as any)?.clear();
      }
    } catch (error) {
      this._error = 'Error al verificar el código';
      toast.error(this._error);
    } finally {
      this._isLoading = false;
    }
  }

  private _handleResendOtp() {
    toast.info('Nuevo código enviado');
    // In a real app, call API to resend OTP
  }

  private _handleBackToCredentials() {
    this._step = 'credentials';
    this._error = '';
    this._formData.password = '';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'bank-login': BankLogin;
  }
}

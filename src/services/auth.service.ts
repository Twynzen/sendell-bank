/* ═══════════════════════════════════════════════════════════════════════════
   SENDELLBANK AUTH SERVICE
   Authentication and session management
   ═══════════════════════════════════════════════════════════════════════════ */

import { api } from './api.service';
import { eventBus, AppEvents } from '../state/event-bus';
import type {
  User,
  LoginCredentials,
  AuthResponse,
  OtpVerification,
  Session,
} from '../types';

const TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';
const SESSION_EXPIRY_KEY = 'sessionExpiry';

class AuthService {
  private _sessionCheckInterval: number | null = null;
  private _pendingUserId: string | null = null;

  constructor() {
    this._initSessionCheck();
  }

  private _initSessionCheck() {
    // Check session every minute
    this._sessionCheckInterval = window.setInterval(() => {
      this._checkSessionExpiry();
    }, 60000);

    // Check on visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this._checkSessionExpiry();
      }
    });
  }

  private _checkSessionExpiry() {
    const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
    if (expiry && Date.now() > parseInt(expiry, 10)) {
      this.logout('session_expired');
    }
  }

  // ═══════════════════════════════════════════════════════════
  // AUTHENTICATION METHODS
  // ═══════════════════════════════════════════════════════════

  async validateCredentials(
    username: string,
    password: string
  ): Promise<AuthResponse> {
    // Simulate API call for demo
    const response = await api.post<{
      userId: string;
      requiresOtp: boolean;
      otpSentTo: string;
      userName: string;
    }>('/auth/login', { username, password }, { withAuth: false });

    if (response.success && response.data) {
      this._pendingUserId = response.data.userId;
      return {
        success: true,
        requiresOtp: response.data.requiresOtp,
        otpSentTo: response.data.otpSentTo,
        message: 'Credenciales válidas',
      };
    }

    return {
      success: false,
      message: response.error?.message || 'Credenciales inválidas',
    };
  }

  async verifyOtp(code: string): Promise<AuthResponse> {
    const response = await api.post<{
      token: string;
      refreshToken: string;
      user: User;
      expiresIn: number;
    }>(
      '/auth/verify-otp',
      {
        userId: this._pendingUserId,
        code,
      },
      { withAuth: false }
    );

    if (response.success && response.data) {
      const { token, refreshToken, user, expiresIn } = response.data;
      this._setSession(token, refreshToken, user, expiresIn);

      eventBus.emit(AppEvents.AUTH_LOGIN_SUCCESS, { user });

      return {
        success: true,
        token,
        user,
        message: 'Autenticación exitosa',
      };
    }

    return {
      success: false,
      message: response.error?.message || 'Código OTP inválido',
    };
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<{
      token: string;
      refreshToken: string;
      user: User;
      expiresIn: number;
      requiresOtp?: boolean;
    }>('/auth/login', credentials, { withAuth: false });

    if (response.success && response.data) {
      if (response.data.requiresOtp) {
        return {
          success: true,
          requiresOtp: true,
          message: 'Se requiere verificación OTP',
        };
      }

      const { token, refreshToken, user, expiresIn } = response.data;
      this._setSession(token, refreshToken, user, expiresIn);

      eventBus.emit(AppEvents.AUTH_LOGIN_SUCCESS, { user });

      return {
        success: true,
        token,
        user,
      };
    }

    eventBus.emit(AppEvents.AUTH_LOGIN_FAILED, {
      message: response.error?.message,
    });

    return {
      success: false,
      message: response.error?.message || 'Error de autenticación',
    };
  }

  async logout(reason?: string): Promise<void> {
    const token = this.getToken();

    if (token) {
      // Notify server (fire and forget)
      api.post('/auth/logout', {}, { withAuth: true }).catch(() => {
        // Ignore errors during logout
      });
    }

    this._clearSession();

    eventBus.emit(AppEvents.AUTH_LOGOUT, { reason });

    // Redirect to login
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      return false;
    }

    const response = await api.post<{
      token: string;
      refreshToken: string;
      expiresIn: number;
    }>(
      '/auth/refresh',
      { refreshToken },
      { withAuth: false }
    );

    if (response.success && response.data) {
      const user = this.getUser();
      if (user) {
        this._setSession(
          response.data.token,
          response.data.refreshToken,
          user,
          response.data.expiresIn
        );
      }
      return true;
    }

    this.logout('refresh_failed');
    return false;
  }

  // ═══════════════════════════════════════════════════════════
  // SESSION MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  private _setSession(
    token: string,
    refreshToken: string,
    user: User,
    expiresIn: number
  ) {
    const expiryTime = Date.now() + expiresIn * 1000;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());
  }

  private _clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
    this._pendingUserId = null;
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);

    if (!token || !expiry) {
      return false;
    }

    return Date.now() < parseInt(expiry, 10);
  }

  getSession(): Session | null {
    const token = this.getToken();
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const user = this.getUser();
    const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);

    if (!token || !refreshToken || !user || !expiry) {
      return null;
    }

    return {
      token,
      refreshToken,
      user,
      expiresAt: parseInt(expiry, 10),
    };
  }

  // ═══════════════════════════════════════════════════════════
  // PASSWORD MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ message: string }>(
      '/auth/change-password',
      { currentPassword, newPassword }
    );

    return {
      success: response.success,
      message: response.success
        ? 'Contraseña actualizada exitosamente'
        : response.error?.message || 'Error al cambiar la contraseña',
    };
  }

  async requestPasswordReset(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ message: string }>(
      '/auth/forgot-password',
      { email },
      { withAuth: false }
    );

    return {
      success: response.success,
      message: response.success
        ? 'Se ha enviado un correo con instrucciones'
        : response.error?.message || 'Error al solicitar recuperación',
    };
  }

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ message: string }>(
      '/auth/reset-password',
      { token, newPassword },
      { withAuth: false }
    );

    return {
      success: response.success,
      message: response.success
        ? 'Contraseña restablecida exitosamente'
        : response.error?.message || 'Error al restablecer la contraseña',
    };
  }

  // Cleanup
  destroy() {
    if (this._sessionCheckInterval) {
      clearInterval(this._sessionCheckInterval);
    }
  }
}

// Singleton instance
export const authService = new AuthService();
export default authService;

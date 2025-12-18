/* ═══════════════════════════════════════════════════════════════════════════
   USER TYPES
   Type definitions for user-related entities
   ═══════════════════════════════════════════════════════════════════════════ */

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  preferences: UserPreferences;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'customer' | 'premium' | 'business' | 'admin';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'es' | 'en';
  notifications: NotificationPreferences;
  security: SecurityPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  transactionAlerts: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
}

export interface SecurityPreferences {
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  sessionTimeout: number; // minutes
  trustedDevices: TrustedDevice[];
}

export interface TrustedDevice {
  id: string;
  name: string;
  type: 'mobile' | 'desktop' | 'tablet';
  lastUsed: string;
  browser?: string;
  os?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  refreshToken?: string;
  user?: User;
  requiresOtp?: boolean;
  otpSentTo?: string;
}

export interface OtpVerification {
  code: string;
  sessionId?: string;
}

export interface Session {
  token: string;
  refreshToken: string;
  expiresAt: number;
  user: User;
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordReset {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SENDELLBANK API SERVICE
   HTTP client for backend communication
   ═══════════════════════════════════════════════════════════════════════════ */

import { eventBus, AppEvents } from '../state/event-bus';
import type { ApiResponse, ApiError } from '../types';

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  withAuth?: boolean;
}

class ApiService {
  private _baseUrl: string;
  private _defaultTimeout = 30000;
  private _maxRetries = 3;

  constructor(baseUrl = '/api') {
    this._baseUrl = baseUrl;
  }

  private _getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private _getHeaders(config?: RequestConfig): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...config?.headers,
    });

    if (config?.withAuth !== false) {
      const token = this._getAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  private async _handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (response.status === 401) {
      eventBus.emit(AppEvents.AUTH_SESSION_EXPIRED, {
        message: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
      });
      throw new Error('Unauthorized');
    }

    if (response.status === 204) {
      return { success: true };
    }

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        code: data.code || `HTTP_${response.status}`,
        message: data.message || `Error ${response.status}`,
        details: data.details,
      };
      return { success: false, error };
    }

    return { success: true, data };
  }

  private async _fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async _fetchWithRetry(
    url: string,
    options: RequestInit,
    config?: RequestConfig
  ): Promise<Response> {
    const timeout = config?.timeout ?? this._defaultTimeout;
    const maxRetries = config?.retries ?? this._maxRetries;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this._fetchWithTimeout(url, options, timeout);
      } catch (error) {
        lastError = error as Error;
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }

    throw lastError || new Error('Request failed');
  }

  async request<T>(
    method: string,
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = `${this._baseUrl}${endpoint}`;
    const headers = this._getHeaders(config);

    const options: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    };

    try {
      const response = await this._fetchWithRetry(url, options, config);
      return this._handleResponse<T>(response);
    } catch (error) {
      const apiError: ApiError = {
        code: 'NETWORK_ERROR',
        message:
          error instanceof Error ? error.message : 'Error de conexión',
      };
      return { success: false, error: apiError };
    }
  }

  // HTTP Methods
  get<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>('GET', endpoint, undefined, config);
  }

  post<T>(endpoint: string, data?: unknown, config?: RequestConfig) {
    return this.request<T>('POST', endpoint, data, config);
  }

  put<T>(endpoint: string, data?: unknown, config?: RequestConfig) {
    return this.request<T>('PUT', endpoint, data, config);
  }

  patch<T>(endpoint: string, data?: unknown, config?: RequestConfig) {
    return this.request<T>('PATCH', endpoint, data, config);
  }

  delete<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>('DELETE', endpoint, undefined, config);
  }

  // File upload
  async upload<T>(
    endpoint: string,
    file: File,
    fieldName = 'file',
    additionalData?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const url = `${this._baseUrl}${endpoint}`;
    const formData = new FormData();
    formData.append(fieldName, file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const headers = new Headers();
    const token = this._getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });
      return this._handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: 'Error al subir el archivo',
        },
      };
    }
  }

  // Set base URL (useful for testing)
  setBaseUrl(url: string) {
    this._baseUrl = url;
  }
}

// Singleton instance
export const api = new ApiService();
export default api;

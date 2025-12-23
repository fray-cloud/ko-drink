import axios, { AxiosInstance, AxiosError } from 'axios';
import type { PaginationOptions, PaginationMeta } from '@ko-drink/shared';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class ApiClient {
  private client: AxiosInstance;

  constructor(config: ApiClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    // Request interceptor for adding auth token
    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken();
        }
        return Promise.reject(error);
      },
    );
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  private clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  // Health check
  async healthCheck(): Promise<string> {
    const response = await this.client.get('/');
    return response.data;
  }

  // Auth APIs
  async register(data: { email: string; name: string; password: string }): Promise<any> {
    const response = await this.client.post('/api/auth/register', data);
    if (response.data.access_token) {
      this.setToken(response.data.access_token);
    }
    return response.data;
  }

  async login(data: { email: string; password: string }): Promise<any> {
    const response = await this.client.post('/api/auth/login', data);
    if (response.data.access_token) {
      this.setToken(response.data.access_token);
    }
    return response.data;
  }

  logout(): void {
    this.clearToken();
  }

  // User APIs
  async getCurrentUser(): Promise<any> {
    const response = await this.client.get('/api/users/me');
    return response.data;
  }

  async updateUser(data: { name?: string; email?: string }): Promise<any> {
    const response = await this.client.patch('/api/users/me', data);
    return response.data;
  }

  async updatePassword(data: { currentPassword: string; newPassword: string }): Promise<any> {
    const response = await this.client.patch('/api/users/me/password', data);
    return response.data;
  }

  // Koreansool APIs
  async search(searchText: string, options?: PaginationOptions): Promise<any> {
    const response = await this.client.get('/api/koreansool/search', {
      params: {
        q: searchText,
        ...options,
      },
    });
    return response.data;
  }

  async getBooks(options?: PaginationOptions): Promise<any> {
    const response = await this.client.get('/api/koreansool/books', {
      params: options,
    });
    return response.data;
  }

  async getRecipes(options?: { book?: string; liq?: string; page?: number; limit?: number }): Promise<any> {
    const response = await this.client.get('/api/koreansool/recipes', {
      params: options,
    });
    return response.data;
  }

  async getReferences(options?: PaginationOptions): Promise<any> {
    const response = await this.client.get('/api/koreansool/references', {
      params: options,
    });
    return response.data;
  }

  async getImage(book: string, liq: string, dup?: number): Promise<Blob> {
    const response = await this.client.get('/api/koreansool/images', {
      params: { book, liq, dup },
      responseType: 'blob',
    });
    return response.data;
  }

  async getAnalysis(book: string, liq: string, dup: number): Promise<any> {
    const response = await this.client.get('/api/koreansool/analysis', {
      params: { book, liq, dup },
    });
    return response.data;
  }
}

// Factory function to create API client instance
export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}

import axios from 'axios';

interface AxiosError {
  response?: {
    status: number;
    data: any;
  };
  config?: {
    method?: string;
    url?: string;
    baseURL?: string;
  };
  message: string;
}

class ApiService {
  private instance;
  private token: string | null = null;

  constructor() {
    const baseURL = import.meta.env.VITE_API_URL;
    console.log('Initializing API service with base URL:', baseURL);
    
    this.instance = axios.create({
      baseURL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to add token and log requests
    this.instance.interceptors.request.use(
      (config) => {
        console.log('Making request:', {
          method: config.method,
          url: config.url,
          baseURL: config.baseURL
        });
        if (this.token) {
          if (!config.headers) {
            config.headers = new axios.AxiosHeaders();
          }
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error: unknown) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle errors
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: unknown) => {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 401) {
          // Clear token and redirect to login
          this.clearToken();
          window.location.href = '/login';
        }
        console.error('Response error:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          config: {
            method: axiosError.config?.method,
            url: axiosError.config?.url,
            baseURL: axiosError.config?.baseURL
          }
        });
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  async get<T = any>(url: string) {
    return this.instance.get<T>(url);
  }

  async post<T = any>(url: string, data?: any) {
    return this.instance.post<T>(url, data);
  }

  async put<T = any>(url: string, data?: any) {
    return this.instance.put<T>(url, data);
  }

  async delete<T = any>(url: string) {
    return this.instance.delete<T>(url);
  }

  async checkHealth(): Promise<boolean> {
    const maxRetries = 3;
    let retryCount = 0;

    const tryHealth = async (): Promise<boolean> => {
      try {
        console.log(`[Health Check] Attempt ${retryCount + 1}/${maxRetries}`);
        console.log(`[Health Check] URL: ${this.instance.defaults.baseURL}/health`);
        
        const response = await this.instance.get('/health', {
          timeout: 5000,
          validateStatus: (status: number) => status === 200
        });
        
        console.log('[Health Check] Success:', response.data);
        return true;
      } catch (error: unknown) {
        const axiosError = error as AxiosError;
        console.error(`[Health Check] Attempt ${retryCount + 1} failed:`, {
          message: axiosError.message,
          response: axiosError.response?.data,
          status: axiosError.response?.status,
          config: {
            url: axiosError.config?.url,
            baseURL: axiosError.config?.baseURL,
            method: axiosError.config?.method
          }
        });
        return false;
      }
    };

    while (retryCount < maxRetries) {
      const success = await tryHealth();
      if (success) return true;
      retryCount++;
      if (retryCount < maxRetries) {
        // Wait for 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return false;
  }
}

export const api = new ApiService();
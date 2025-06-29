import axios from 'axios';

// Determine the appropriate protocol and base URL
const getApiBaseUrl = () => {
  // For local development, always use HTTP to avoid mixed content issues
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001/api';
  }
  
  // For production, use the same protocol as the frontend
  return `${window.location.protocol}//${window.location.hostname}:3001/api`;
};

// Use environment variable if available, otherwise use the dynamic URL
// Note: For local development, ensure you access the frontend via HTTP (http://localhost:5173)
// to avoid mixed content issues when connecting to the HTTP backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || getApiBaseUrl();

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle network errors specifically
    if ((error as { code?: string }).code === 'ERR_NETWORK' || (error as Error).message === 'Network Error') {
      console.error('Network connection failed. Please ensure the backend server is running.');
      console.error(`Attempting to connect to: ${API_BASE_URL}`);
      console.error('For local development: Access frontend via HTTP (http://localhost:5173) to avoid mixed content issues');
    }
    
    if ((error as { response?: { status?: number } }).response?.status === 401) {
      localStorage.removeItem('auth_token');
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export class ApiService {
  // Auth endpoints
  static async login(email: string, password: string) {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error: unknown) {
      if ((error as { code?: string }).code === 'ERR_NETWORK' || (error as Error).message === 'Network Error') {
        throw new Error('Unable to connect to server. Please ensure the backend is running and access the frontend via HTTP: http://localhost:5173');
      }
      throw error;
    }
  }

  static async register(email: string, password: string, name: string) {
    try {
      const response = await api.post('/auth/register', { email, password, name });
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Unable to connect to server. Please ensure the backend is running and access the frontend via HTTP: http://localhost:5173');
      }
      throw error;
    }
  }

  static async validateToken() {
    const response = await api.get('/auth/validate');
    return response.data;
  }

  static async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  }

  // Upload endpoints
  static async uploadFiles(files: File[]): Promise<Record<string, unknown>> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async getUploadedFiles(params?: Record<string, unknown>) {
    const response = await api.get('/upload', { params });
    return response.data;
  }

  static async getFileDetails(fileId: string) {
    const response = await api.get(`/upload/${fileId}`);
    return response.data;
  }

  // Analysis endpoints
  static async startAnalysis(data: Record<string, unknown>) {
    const response = await api.post('/analysis/analyze', data);
    return response.data;
  }

  static async getAnalysis(analysisId: string) {
    const response = await api.get(`/analysis/${analysisId}`);
    return response.data;
  }

  static async getAnalyses(params?: Record<string, unknown>) {
    const response = await api.get('/analysis', { params });
    return response.data;
  }

  // Reports endpoints
  static async generateReport(data: Record<string, unknown>) {
    const response = await api.post('/reports/generate', data);
    return response.data;
  }

  static async getReport(reportId: string) {
    const response = await api.get(`/reports/${reportId}`);
    return response.data;
  }

  static async updateReport(reportId: string, data: Record<string, unknown>) {
    const response = await api.put(`/reports/${reportId}`, data);
    return response.data;
  }

  static async getReports(params?: Record<string, unknown>) {
    const response = await api.get('/reports', { params });
    return response.data;
  }

  // Chat endpoints
  static async sendMessage(data: Record<string, unknown>) {
    const response = await api.post('/chat/message', data);
    return response.data;
  }

  static async getChatHistory(params?: Record<string, unknown>) {
    const response = await api.get('/chat/history', { params });
    return response.data;
  }

  static async clearChatHistory() {
    const response = await api.delete('/chat/history');
    return response.data;
  }
}

export default api;
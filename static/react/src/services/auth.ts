import { apiService } from './api';
import { AuthResponse } from '../types/index';

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: {
    id: number;
    username: string;
  };
}

export const authService = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await apiService.post('/login', { username, password });

      return {
        success: !!response.success,
        user: response.success ? { id: response.user_id || 0, username: response.username || username } : undefined
      };
    } catch (error: any) {
      // Extract server error message if available
      const serverError = error.response?.data?.error;
      const errorMsg = serverError || error.message || 'Login failed';

      return {
        success: false,
        error: errorMsg
      };
    }
  },

  register: async (username: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await apiService.post('/register', { username, password, confirm_password: password });

      return {
        success: !!response.success,
        user: { id: 0, username }
      };
    } catch (error: any) {
      // Extract server error message if available
      const serverError = error.response?.data?.error;
      const errorMsg = serverError || error.message || 'Registration failed';

      return {
        success: false,
        error: errorMsg
      };
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiService.post('/logout', {});
    } catch (error) {
      console.error('Logout failed:', error);
    }
  },

  checkAuth: async (): Promise<AuthResponse> => {
    try {
      const response = await apiService.get('/check-auth');
      return response || { authenticated: false };
    } catch (error) {
      return { authenticated: false };
    }
  }
};

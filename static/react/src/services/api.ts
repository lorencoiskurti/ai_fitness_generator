import axios from 'axios';
import { AuthResponse, Plan, PlanFormData, ApiResponse, BmiCalculation, LoginCredentials, RegisterCredentials, User } from '../types/index';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if needed
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;

    // Handle 401 Unauthorized - redirect to login
    if (status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth-expired'));
      // Redirect to login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login?next=' + encodeURIComponent(window.location.pathname);
      }
    }

    // Handle 403 Forbidden
    if (status === 403) {
      const data = error.response?.data;
      // Only override message if the server didn't send a structured error
      if (!data?.error) {
        error.message = 'You do not have permission to perform this action';
      }
      // Attach response data to error for consumers to inspect
      error.data = data;
    }

    // Handle 404 Not Found
    if (status === 404) {
      error.message = 'The requested resource was not found';
    }

    // Handle 500 Server Error
    if (status === 500) {
      error.message = 'A server error occurred. Please try again later.';
    }

    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your connection.';
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  checkAuth: () => api.get<AuthResponse>('/check-auth'),
  login: (credentials: LoginCredentials) =>
    api.post<{ success: true; user: User }>('/login', credentials),
  register: (credentials: RegisterCredentials) =>
    api.post<{ success: true; user: User }>('/register', credentials),
  logout: () => api.post<{ success: true }>('/logout'),
};

export const plansApi = {
  getAll: () => api.get<Plan[]>('/plans'),
  getById: (id: number) => api.get<Plan>(`/plans/${id}`),
  create: (planData: PlanFormData) =>
    api.post<{ success: true; plan_id: number }>('/generate_plan', planData),
  update: (id: number, planData: PlanFormData) =>
    api.put<{ success: true }>(`/plans/${id}`, planData),
  remove: (id: number) => api.delete<{ success: true }>(`/plans/${id}`),
  calculateBmi: (weightKg: number, heightCm: number, activityLevel: string, gender: string, age: number) => {
    // This would typically be done on backend, but we can calculate client-side for preview
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM ** 2);

    let bmiCategory = "";
    if (bmi < 18.5) {
      bmiCategory = "Underweight";
    } else if (bmi >= 18.5 && bmi < 24.9) {
      bmiCategory = "Normal weight";
    } else if (bmi >= 25 && bmi < 29.9) {
      bmiCategory = "Overweight";
    } else {
      bmiCategory = "Obese";
    }

    // Simplified TDEE calculation (should match backend)
    let bmr = 0;
    if (gender === 'male') {
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
    } else if (gender === 'female') {
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
    } else {
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
    }

    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extra_active: 1.9
    };

    const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);

    return { bmi, bmiCategory, tdee: Math.round(tdee) };
  }
};

export { api as apiService };
export default api;
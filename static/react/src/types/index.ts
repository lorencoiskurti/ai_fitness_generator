export interface User {
  id: number;
  username: string;
}

export interface Plan {
  id: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  height_cm: number;
  weight_kg: number;
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  dietary_preference: string;
  fitness_goal: 'lose_weight' | 'maintain_weight' | 'gain_muscle';
  bmi: number;
  bmi_category: string;
  tdee: number;
  meal_plan_html: string;
  workout_plan_html: string;
  date_generated: string;
}

export interface AuthResponse {
  authenticated: boolean;
  username?: string;
  user_id?: number;
  subscription_active?: boolean;
  subscription_end_date?: string | null;
  subscription_plan?: 'monthly' | 'yearly' | null;
}

export interface SubscriptionStatus {
  active: boolean;
  end_date: string | null;
  plan: 'monthly' | 'yearly' | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  confirm_password: string;
}

export interface PlanFormData {
  age: number;
  gender: 'male' | 'female' | 'other';
  height_cm: number;
  weight_kg: number;
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  dietary_preference: string;
  fitness_goal: 'lose_weight' | 'maintain_weight' | 'gain_muscle';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface BmiCalculation {
  bmi: number;
  bmi_category: string;
  tdee: number;
}
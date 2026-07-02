export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUsername = (username: string): string | null => {
  if (!username) {
    return 'Username is required';
  }
  if (username.length < 3) {
    return 'Username must be at least 3 characters';
  }
  if (username.length > 20) {
    return 'Username must be less than 20 characters';
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  if (password.length > 128) {
    return 'Password must be less than 128 characters';
  }
  return null;
};

export const validateAge = (age: number | string): string | null => {
  const ageNum = typeof age === 'string' ? parseInt(age) : age;
  if (!age) {
    return 'Age is required';
  }
  if (ageNum < 1 || ageNum > 120) {
    return 'Age must be between 1 and 120';
  }
  return null;
};

export const validateHeight = (height: number | string): string | null => {
  const heightNum = typeof height === 'string' ? parseFloat(height) : height;
  if (!height) {
    return 'Height is required';
  }
  if (heightNum < 50 || heightNum > 250) {
    return 'Height must be between 50cm and 250cm';
  }
  return null;
};

export const validateWeight = (weight: number | string): string | null => {
  const weightNum = typeof weight === 'string' ? parseFloat(weight) : weight;
  if (!weight) {
    return 'Weight is required';
  }
  if (weightNum < 10 || weightNum > 500) {
    return 'Weight must be between 10kg and 500kg';
  }
  return null;
};

export const validateGender = (gender: string): string | null => {
  if (!gender) {
    return 'Gender is required';
  }
  if (!['male', 'female', 'other'].includes(gender)) {
    return 'Invalid gender selected';
  }
  return null;
};

export const validateActivityLevel = (level: string): string | null => {
  if (!level) {
    return 'Activity level is required';
  }
  const validLevels = ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'];
  if (!validLevels.includes(level)) {
    return 'Invalid activity level selected';
  }
  return null;
};

export const validateFitnessGoal = (goal: string): string | null => {
  if (!goal) {
    return 'Fitness goal is required';
  }
  if (!['lose_weight', 'maintain_weight', 'gain_muscle'].includes(goal)) {
    return 'Invalid fitness goal selected';
  }
  return null;
};

export interface FormErrors {
  [key: string]: string;
}

export const hasErrors = (errors: FormErrors): boolean => {
  return Object.values(errors).some(error => error !== '');
};

export const clearErrors = (): FormErrors => {
  return {};
};

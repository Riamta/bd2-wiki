// Authentication types
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// MongoDB User interface is defined in src/models/User.ts

// Code management types
export interface CodeData {
  code: string;
  reward: string;
  add_date: string;
  end_date: string;
  status: 'active' | 'expired';
}

export interface CodeFormData {
  code: string;
  reward: string;
  add_date: string;
  end_date: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string, type: 'ADMIN' | 'USER') => Promise<void>;
  logout: () => void;
}
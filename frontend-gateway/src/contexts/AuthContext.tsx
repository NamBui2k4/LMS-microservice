import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';
import type { AuthContextType, User } from '../types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string, type: 'ADMIN' | 'USER') => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

      // 🎯 Tự động chọn Endpoint dựa trên loại người dùng
      const endpoint = type === 'ADMIN'
        ? `${API_URL}/api/v1/admin/login`
        : `${API_URL}/api/v1/users/login`;

      const response = await axios.post(endpoint,
        {
          email,
          password,
          role: type
        });

      // Giả sử backend trả về data nằm trong response.data.data
      const { access_token, user: loggedUser } = response.data.data;

      // 🛡️ Kiểm tra chéo lần cuối cho chắc chắn
      if (type === 'ADMIN' && loggedUser.role !== 'ADMIN') {
        throw new Error('Tài khoản này không có quyền quản trị.');
      }

      // Lưu dữ liệu dùng chung
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(loggedUser));

      setUser(loggedUser);
      setIsAuthenticated(true);

      return loggedUser; // Trả về để Page có thể redirect
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Lỗi đăng nhập');
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng trong AuthProvider');
  }
  return context;
}
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminLoginForm from '../components/AdminLoginForm';

export default function AdminLoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAllowed, setIsAllowed] = useState(true); // State kiểm tra localhost
  const { login } = useAuth();
  const navigate = useNavigate();

 

  const handleLogin = async (email: string, password: string) => {
    setError('');
    setLoading(true);

    try {
      // 🛡️ BƯỚC 2: Gọi hàm login (gọi API sang Account Service)
      // Hàm này cần truyền đúng mật khẩu chưa mã hóa (admin123!)
      await login(email, password, 'ADMIN');

      // Nếu không có lỗi văng ra (HTTP 200), chuyển hướng!
      navigate('/admin/dashboard');
    } catch (err: any) {
      // Bắt lỗi từ Backend (401 Unauthorized, 404 Not Found, v.v.)
      setError(err.response?.data?.message || err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  // Nếu không phải localhost, render ra màn hình lỗi (không cho thấy form)
  if (!isAllowed) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <h1 className="text-2xl font-bold text-red-500">
          403 Forbidden: Truy cập quản trị chỉ được phép từ Localhost.
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Container chính - ép căn giữa và giới hạn chiều rộng */}
      <div className="w-full max-w-lg mx-auto space-y-10">
        {/* Tiêu đề - căn giữa */}
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-white tracking-tight">
            LMS Admin
          </h1>
          <p className="mt-4 text-xl text-gray-400">
            Đăng nhập để quản lý hệ thống
          </p>
        </div>

        {/* Form box - căn giữa, padding đều */}
        <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl border border-gray-800 shadow-2xl p-10 mx-auto">
          {error && (
            <div className="mb-8 rounded-lg bg-red-950/60 border border-red-800 p-4 text-red-200 text-center text-base">
              {error}
            </div>
          )}

          <AdminLoginForm onSubmit={handleLogin} error={error} loading={loading} />

          {/* Footer */}
          <div className="mt-10 text-center text-sm text-gray-500">
            Hệ thống quản lý học tập • {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
}
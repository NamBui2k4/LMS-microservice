interface AdminLoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  error?: string;
  loading?: boolean;
}
import { useState } from "react";
export default function AdminLoginForm({ onSubmit, error, loading }: AdminLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email, password);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
          Email
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            className="block w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm"
            placeholder="admin@lms.com"
            disabled={loading}
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
          Mật khẩu
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm"
            placeholder="••••••••"
            disabled={loading}
          />
        </div>
      </div>

      {/* Button - full width, căn giữa */}
      <div>
        <button
          type="submit"
          disabled={loading}
          className={`group relative flex w-full justify-center rounded-md border border-transparent bg-gray-800 px-4 py-3 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all ${
            loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'
          }`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Đang đăng nhập...
            </>
          ) : (
            'Đăng nhập'
          )}
        </button>
      </div>
    </form>
  );
}
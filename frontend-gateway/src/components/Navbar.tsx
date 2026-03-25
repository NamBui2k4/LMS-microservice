import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm fixed top-0 left-64 right-0 z-40 h-16 flex items-center px-8">
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-gray-800">
          Chào mừng, {user?.email.split('@')[0]}!
        </h2>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">Role: {user?.role}</span>
        {/* Có thể thêm avatar, notification sau */}
      </div>
    </header>
  );
}
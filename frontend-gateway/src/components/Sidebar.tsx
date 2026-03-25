import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Users, GraduationCap, ClipboardList, LogOut } from 'lucide-react'; // Cài lucide-react nếu chưa: npm i lucide-react

export default function Sidebar() {
  const { logout, user } = useAuth();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: BookOpen, path: '/dashboard' },
    { name: 'Users & Assignment', icon: Users, path: '/users' },
    { name: 'Curriculum & Instruction', icon: GraduationCap, path: '/curriculum' },
    { name: 'Learning & Assessment', icon: ClipboardList, path: '/assessment' },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-indigo-800 text-white flex flex-col">
      <div className="p-6 border-b border-indigo-700">
        <h1 className="text-2xl font-bold">LMS Admin</h1>
        <p className="text-indigo-200 text-sm mt-1">Microservices System</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'bg-indigo-700 text-white'
                : 'text-indigo-100 hover:bg-indigo-700'
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-indigo-700">
        <div className="mb-4">
          <p className="font-medium">{user?.email}</p>
          <p className="text-sm text-indigo-300">Role: {user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-indigo-100 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
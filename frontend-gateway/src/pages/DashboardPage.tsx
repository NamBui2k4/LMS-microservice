import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 ml-64">
        {/* Navbar */}
        <Navbar />

        {/* Content area */}
        <main className="pt-20 px-8 pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome section */}
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Quản trị</h1>
              <p className="text-gray-600 mt-2">
                Chào mừng bạn đến với hệ thống quản lý học tập LMS. Bạn đang truy cập với quyền ADMIN.
              </p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700">Tổng người dùng</h3>
                <p className="text-3xl font-bold text-indigo-600 mt-2">1,248</p>
                <p className="text-sm text-green-600 mt-1">+12% so với tuần trước</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700">Khóa học hoạt động</h3>
                <p className="text-3xl font-bold text-indigo-600 mt-2">87</p>
                <p className="text-sm text-green-600 mt-1">+5 khóa mới</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700">Bài kiểm tra</h3>
                <p className="text-3xl font-bold text-indigo-600 mt-2">342</p>
                <p className="text-sm text-amber-600 mt-1">Đang chờ chấm</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700">Hoạt động hôm nay</h3>
                <p className="text-3xl font-bold text-indigo-600 mt-2">1.8k</p>
                <p className="text-sm text-green-600 mt-1">+18% lượt truy cập</p>
              </div>
            </div>

            {/* Placeholder cho các section khác */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold mb-4">Hoạt động gần đây</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between text-gray-600">
                    <span>Admin tạo khóa học mới: "React Advanced"</span>
                    <span className="text-sm">2 giờ trước</span>
                  </li>
                  <li className="flex justify-between text-gray-600">
                    <span>Người dùng đăng ký: student@example.com</span>
                    <span className="text-sm">3 giờ trước</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold mb-4">Cảnh báo hệ thống</h3>
                <p className="text-gray-600">Chưa có cảnh báo nào.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
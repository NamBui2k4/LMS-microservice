import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLoginPage from './pages/AdminLoginPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import ProtectedRoute from './routes/ProtectedRoute.tsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<div className="min-h-screen flex items-center justify-center text-2xl text-gray-600">404 - Không tìm thấy trang</div>} />
      </Routes>
    </Router>
  );
}

export default App;
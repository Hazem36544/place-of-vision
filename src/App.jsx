import { useState } from 'react';
import './App.css';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import VisionLogin from './pages/VisionLogin';
import VisionDashboard from './pages/VisionDashboard';
import Profile from './pages/Profile';
import Sidebar from './components/Sidebar';

// استدعاء AuthProvider و useAuth من ملف الـ Context
import { AuthProvider, useAuth } from './context/AuthContext';

// ✅ مكون حماية المسارات (يمنع الدخول المباشر للروابط بدون تسجيل دخول)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // يمكن استبدالها بـ Spinner احترافي لو أردت
    return <div className="h-screen flex items-center justify-center font-bold text-blue-900">جاري التحقق من الصلاحيات...</div>;
  }

  if (!isAuthenticated) {
    // إذا لم يكن هناك توكن، إرجاعه لصفحة تسجيل الدخول
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent = () => {
  const location = useLocation();
  
  const isLoginPage = location.pathname === '/' || location.pathname === '/vision-login';

  return (
    <div className="h-screen w-full bg-[#F3F4F6] font-[Cairo] overflow-hidden flex" dir="rtl">
      
      {!isLoginPage && <Sidebar />}

      <main className={`h-screen overflow-y-auto transition-all duration-300 ${!isLoginPage ? 'mr-28 flex-1' : 'w-full'}`}>
        <div className={!isLoginPage ? "p-8 pb-20" : ""}> 
          
          <Routes>
            {/* مسارات تسجيل الدخول (Public) */}
            <Route path="/" element={<VisionLogin />} />
            <Route path="/vision-login" element={<VisionLogin />} />

            {/* ✅ مسارات لوحة التحكم والحساب (Protected) */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <VisionDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
          </Routes>
          
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
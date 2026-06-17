import React, { Suspense, lazy } from 'react';
import './App.css';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ✅ 1. استدعاء Toaster لعرض الإشعارات و Loader2 للتحميل
import { Toaster } from 'react-hot-toast'; 
import { Loader2 } from 'lucide-react'; 

import { AuthProvider, useAuth } from './context/AuthContext';

// ✅ 2. تطبيق التحميل الديناميكي (Lazy Loading) لتسريع أداء التطبيق
const VisionLogin = lazy(() => import('./pages/visionLogin/VisionLogin'));
const VisionDashboard = lazy(() => import('./pages/visionDashboard/VisionDashboard'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const MainLayout = lazy(() => import('./layouts/MainLayout'));

// مكون حماية المسارات
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center font-sans bg-[#F3F4F6]" dir="rtl">
        <Loader2 className="w-12 h-12 animate-spin text-[#1e3a8a] mb-4" />
        <span className="font-bold text-[#1e3a8a] text-lg">جاري التحقق من الصلاحيات...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// ✅ 3. تنظيم المسارات بشكل احترافي (Nested Routing) مع إضافة Suspense
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Suspense fallback={
        <div className="h-screen flex flex-col items-center justify-center font-sans bg-[#F3F4F6]" dir="rtl">
          <Loader2 className="w-12 h-12 animate-spin text-[#1e3a8a] mb-4" />
          <span className="font-bold text-[#1e3a8a] text-lg">جاري تحميل الشاشة...</span>
        </div>
      }>
        <Routes>
          {/* مسار تسجيل الدخول (Public) */}
          <Route 
            path="/" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <VisionLogin />} 
          />
          
          <Route path="/vision-login" element={<Navigate to="/" replace />} /> {/* توجيه لتوحيد المسار */}

          {/* ✅ مسارات النظام المغلفة بـ MainLayout (Protected) */}
          <Route 
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* أي صفحة هنا هتترندر مكان الـ <Outlet /> جوه الـ MainLayout */}
            <Route path="/dashboard" element={<VisionDashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* مسار افتراضي لأي رابط غير صحيح */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      {/* ✅ 4. إضافة Toaster وتخصيصه ليطابق تصميم الكبسولة الفخم في نظام الإدارة */}
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: '"Times New Roman", "Traditional Arabic", serif',
            fontWeight: 'bold',
            borderRadius: '9999px', // شكل الكبسولة الناعم
            padding: '12px 24px',
            direction: 'rtl',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          },
          success: {
            style: {
              background: '#ECFDF5', // الخلفية الخضراء الفاتحة المريحة
              color: '#065F46',      // لون النص الأخضر الغامق
              border: '1px solid #A7F3D0',
            },
            iconTheme: {
              primary: '#10B981',    // لون الأيقونة
              secondary: '#FFFFFF',
            },
          },
          error: {
            style: {
              background: '#FEF2F2', // خلفية حمراء فاتحة للخطأ
              color: '#991B1B',
              border: '1px solid #FECACA',
            },
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }} 
      />
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
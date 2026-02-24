import { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import VisionLogin from './pages/VisionLogin';
import VisionDashboard from './pages/VisionDashboard';
import Profile from './pages/Profile'; // استدعاء صفحة الحساب الشخصي
import Sidebar from './components/Sidebar';

// 1. إضافة استيراد AuthProvider من ملف الـ Context
import { AuthProvider } from './context/AuthContext';

const AppContent = () => {
  const location = useLocation();
  
  // تحديد صفحات تسجيل الدخول لإخفاء السايد بار فيها
  const isLoginPage = location.pathname === '/' || location.pathname === '/vision-login';

  return (
    // الحاوية الرئيسية: h-screen تمنع الصفحة من الخروج عن حدود الشاشة
    <div className="h-screen w-full bg-[#F3F4F6] font-[Cairo] overflow-hidden flex" dir="rtl">
      
      {/* إظهار السايد بار فقط في الصفحات الداخلية */}
      {!isLoginPage && <Sidebar />}

      {/* منطقة المحتوى الأساسية */}
      <main className={`h-screen overflow-y-auto transition-all duration-300 ${!isLoginPage ? 'mr-28 flex-1' : 'w-full'}`}>
        <div className={!isLoginPage ? "p-8 pb-20" : ""}> 
          
          <Routes>
            {/* مسارات تسجيل الدخول */}
            <Route path="/" element={<VisionLogin />} />
            <Route path="/vision-login" element={<VisionLogin />} />

            {/* مسارات لوحة التحكم والحساب */}
            <Route path="/dashboard" element={<VisionDashboard />} />
            <Route path="/profile" element={<Profile />} /> 
            
            {/* يمكنك إضافة مسار صفحة القضايا هنا لاحقاً */}
            {/* <Route path="/cases" element={<Cases />} /> */}
          </Routes>
          
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    // 2. التعديل الأهم: تغليف التطبيق بالكامل بـ AuthProvider 
    // ليمنح صلاحيات useAuth لجميع الصفحات داخله
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
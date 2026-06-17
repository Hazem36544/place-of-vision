import React, { createContext, useState, useContext, useEffect } from 'react';

// إنشاء الـ Context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // 1. التهيئة المتزامنة: نقرأ التوكن مباشرة من الـ sessionStorage عند أول تحميل
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = sessionStorage.getItem('wesal_visitation_token');
    return !!token; 
  });

  // 2. حالة التحميل للتأكد من فحص التوكن قبل عرض أي صفحة محمية
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // تأكيد إضافي لتحديث الحالة وإغلاق شاشة التحميل بعد الـ Render الأول
    const token = sessionStorage.getItem('wesal_visitation_token');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  // ✅ التعديل هنا: استقبال الداتا والتوكن بنفس الترتيب اللي باعتينه من اللوجين
  const login = (userData, token) => {
    if (token) {
      sessionStorage.setItem('wesal_visitation_token', token);
    }
    if (userData) {
      sessionStorage.setItem('wesal_visitation_user_data', JSON.stringify(userData));
      // استخراج الـ role من الداتا وحفظه لوحده عشان لو احتجناه في الـ Sidebar
      if (userData.role) {
        sessionStorage.setItem('wesal_visitation_user_role', userData.role);
      }
    }
    
    setIsAuthenticated(true);
  };
  
  // دالة تسجيل الخروج (تمسح بيانات مركز الرؤية فقط دون المساس بالأنظمة الأخرى)
  const logout = () => {
    sessionStorage.removeItem('wesal_visitation_token');
    sessionStorage.removeItem('wesal_visitation_user_role');
    sessionStorage.removeItem('wesal_visitation_user_data');
    sessionStorage.removeItem('force_change_password'); // ✅ تنظيف إضافي
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook مخصص لتسهيل استخدام الصلاحيات في أي مكون (Component)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
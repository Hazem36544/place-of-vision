import React, { createContext, useState, useContext, useEffect } from 'react';

// إنشاء الـ Context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // 1. التهيئة المتزامنة: نقرأ التوكن مباشرة من الـ localStorage عند أول تحميل
  // هذا يمنع طرد المستخدم لصفحة تسجيل الدخول عند عمل Reload للصفحة
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('wesal_token');
    return !!token; 
  });

  // 2. حالة التحميل للتأكد من فحص التوكن قبل عرض أي صفحة محمية
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // تأكيد إضافي لتحديث الحالة وإغلاق شاشة التحميل بعد الـ Render الأول
    const token = localStorage.getItem('wesal_token');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  // دالة تسجيل الدخول (تحفظ التوكن والبيانات)
  const login = (token, role, userData) => {
    if (token) localStorage.setItem('wesal_token', token);
    if (role) localStorage.setItem('wesal_user_role', role);
    if (userData) localStorage.setItem('wesal_user_data', JSON.stringify(userData));
    
    setIsAuthenticated(true);
  };
  
  // دالة تسجيل الخروج (تمسح كل شيء)
  const logout = () => {
    localStorage.removeItem('wesal_token');
    localStorage.removeItem('wesal_user_role');
    localStorage.removeItem('wesal_user_data');
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
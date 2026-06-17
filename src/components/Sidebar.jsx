import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, User, LogOut } from 'lucide-react';
import { toast } from 'react-hot-toast'; // ✅ لاستخدامه في رسالة النجاح عند الخروج

// ✅ 1. استدعاء useAuth من الكونتكست
import { useAuth } from '../context/AuthContext';

// ✅ 2. استقبال حالة الفتح والإغلاق (Props) لضمان التجاوب مع الموبايل
const Sidebar = ({ isOpen, setIsOpen }) => { 
  const location = useLocation();
  const navigate = useNavigate();
  
  // ✅ 3. سحب دالة الخروج
  const { logout } = useAuth();

  // دالة تحديد ستايل الرابط النشط وغير النشط
  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `w-full py-3 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-300 group ${
      isActive
        ? 'bg-white text-[#1e3a8a] shadow-lg scale-105'
        : 'text-blue-200 hover:bg-white/10 hover:text-white'
    }`;
  };

  return (
    <div 
      // ✅ 4. إضافة كلاسات التجاوب: يظهر دائماً في الديسكتوب (md:translate-x-0) وينزلق في الموبايل بناءً على حالة isOpen
      className={`fixed top-0 right-0 h-screen w-28 bg-[#1e3a8a] flex flex-col items-center py-8 z-50 rounded-l-[2.5rem] shadow-2xl transition-transform duration-300 ease-in-out border-l border-white/5 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      dir="rtl"
    >
      
      {/* --- 1. الشعار --- */}
      <div className="mb-10 flex-shrink-0 w-full flex justify-center px-2">
        <img 
          src={`${import.meta.env.BASE_URL}logo.svg`} 
          alt="شعار وصال" 
          className="w-20 h-20 object-contain hover:scale-110 transition-transform duration-300 drop-shadow-2xl"
          onError={(e) => { e.target.src = 'https://placehold.co/80x80/1e3a8a/ffffff/png?text=Wisal'; }} 
        />
      </div>

      {/* --- 2. روابط التنقل --- */}
      <nav className="flex flex-col items-center gap-4 w-full px-3 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
        
        {/* ✅ إضافة onClick لإغلاق القائمة عند اختيار صفحة في الموبايل */}
        <Link 
          to="/dashboard" 
          className={getLinkClass('/dashboard')}
          onClick={() => setIsOpen && setIsOpen(false)}
        >
          <Home className="w-7 h-7 mb-0.5 transition-colors duration-300" strokeWidth={2.5} />
          <span className="text-[11px] font-bold tracking-wide text-center leading-tight">الرئيسية</span>
        </Link>
        
        <Link 
          to="/profile" 
          className={getLinkClass('/profile')}
          onClick={() => setIsOpen && setIsOpen(false)}
        >
          <User className="w-7 h-7 mb-0.5 transition-colors duration-300" strokeWidth={2.5} />
          <span className="text-[11px] font-bold tracking-wide text-center leading-tight">حساب الموظف</span>
        </Link>

      </nav>

      {/* --- 3. زر تسجيل الخروج --- */}
      <div className="mt-auto w-full px-3 pb-4">
         <button 
            onClick={() => {
                if (setIsOpen) setIsOpen(false); // إغلاق القائمة أولاً في الموبايل
                logout(); 
                navigate('/');
            }}
            className="w-full py-3 flex flex-col items-center justify-center gap-1 rounded-2xl text-red-300 hover:bg-red-500/20 hover:text-red-100 transition-all duration-300 border border-transparent hover:border-red-500/20 outline-none bg-transparent cursor-pointer"
         >
          <LogOut className="w-6 h-6" />
          <span className="text-[10px] font-bold">خروج</span>
        </button>
      </div>

    </div>
  );
};

export default Sidebar;
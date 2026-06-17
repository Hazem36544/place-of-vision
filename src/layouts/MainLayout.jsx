import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
// ✅ 1. استدعاء أيقونة القائمة للموبايل
import { Menu } from 'lucide-react'; 

const MainLayout = () => {
    // ✅ 2. إضافة حالة التحكم في القائمة الجانبية للموبايل
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        // توحيد الخلفية والخط مع باقي أنظمة وصال
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans" dir="rtl">
            
            {/* 📱 Navbar الموبايل (يظهر فقط في الشاشات الصغيرة) */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#1e3a8a] text-white z-40 flex items-center px-4 shadow-md justify-between">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)} 
                        className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors border-none"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-bold text-lg tracking-wide">مركز الرؤية</span>
                </div>
                
                {/* لوجو النظام */}
                <img 
                    src={`${import.meta.env.BASE_URL}logo.svg`} 
                    alt="شعار وصال" 
                    className="w-10 h-10 object-contain drop-shadow-md"
                    onError={(e) => { e.target.src = 'https://placehold.co/40x40/png?text=Logo'; }}
                />
            </div>

            {/* 📋 القائمة الجانبية (نمرر لها حالة الفتح والإغلاق لتتجاوب مع الموبايل) */}
            <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />

            {/* 🌑 الـ Overlay (الخلفية الشفافة الداكنة للموبايل عند فتح القائمة) */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            {/* 📄 منطقة المحتوى الرئيسي */}
            {/* ✅ التعديل الجذري هنا: 
                - pt-16 للموبايل عشان ينزل تحت الـ Navbar 
                - md:pt-0 للديسكتوب
                - md:pr-28 عشان يسيب مساحة للـ Sidebar في الديسكتوب 
            */}
            <main className="flex-1 overflow-y-auto pt-16 md:pt-0 md:pr-28 w-full transition-all duration-300">
                <Outlet /> {/* الصفحات الداخلية هتترندر هنا */}
            </main>
        </div>
    );
};

export default MainLayout;
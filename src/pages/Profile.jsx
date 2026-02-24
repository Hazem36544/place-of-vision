import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Mail, Phone, Hash, Edit3, X, LogOut, ShieldCheck, ChevronRight, Loader2 } from 'lucide-react';
import { authAPI } from '../services/api'; // تأكد من مسار الاستيراد
import { useAuth } from '../context/AuthContext'; // تأكد من مسار الاستيراد

const Profile = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // حالات جلب البيانات
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const { logout } = useAuth(); // استخدام دالة الخروج من الـ Context

    // جلب بيانات المستخدم عند تحميل الصفحة
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const response = await authAPI.getCurrentUser();
                // استخراج البيانات (سواء جاءت من الـ API أو الـ LocalStorage)
                setUserData(response.data);
            } catch (error) {
                console.error("خطأ في جلب بيانات المستخدم:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const handleLogout = () => {
        logout(); // يمسح التوكن وبيانات المستخدم بشكل نظيف
        navigate('/login');
    };

    // شاشة تحميل مؤقتة
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-[#1e3a8a] animate-spin" />
            </div>
        );
    }

    // تجهيز البيانات للعرض مع وضع قيم افتراضية في حال نقص بعض الحقول
    const displayName = userData?.fullName || userData?.name || 'مستخدم النظام';
    const displayRole = userData?.role || 'موظف مركز الرؤية';
    const displayLocation = userData?.location || 'مركز الرؤية';
    const displayEmpId = userData?.userName || userData?.id || 'غير متوفر';
    const displayPhone = userData?.phoneNumber || userData?.phone || 'غير متوفر';
    const displayEmail = userData?.email || 'غير متوفر';

    return (
        <div className="animate-in fade-in duration-300" dir="rtl">
            {/* Header Section */}
            <header className="bg-[#1e3a8a] rounded-[2rem] p-8 mb-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center">
                {/* Decorative Background */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                     <div className="absolute right-[-10%] top-[-50%] w-[400px] h-[400px] bg-white rounded-full blur-3xl"></div>
                     <div className="absolute left-[-10%] bottom-[-50%] w-[300px] h-[300px] bg-blue-400 rounded-full blur-3xl"></div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-6 z-10">
                    <button onClick={() => navigate(-1)} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition-all shadow-inner border border-white/10">
                        <ChevronRight size={28} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold mb-2">الحساب الشخصي</h1>
                        <p className="text-blue-200 text-sm font-medium flex items-center gap-2">
                            <ShieldCheck size={16} />
                            إدارة بياناتك الشخصية وإعدادات الأمان
                        </p>
                    </div>
                </div>

                {/* Left Side */}
                <div className="bg-white/10 p-5 rounded-2xl border border-white/20 backdrop-blur-sm z-10 hidden md:block">
                    <User size={40} strokeWidth={1.5} />
                </div>
            </header>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Right Column: Profile Card */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-[#1e3a8a]/5 to-transparent skew-y-3 transform -translate-y-12"></div>
                    
                    <div className="relative mb-6">
                        <div className="w-32 h-32 rounded-full bg-[#F3F4F6] border-4 border-white shadow-xl flex items-center justify-center text-[#1e3a8a] relative z-10">
                            <User size={64} strokeWidth={1} />
                        </div>
                         <div className="absolute bottom-2 right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white z-20"></div>
                    </div>

                    <h2 className="text-2xl font-extrabold text-[#1e3a8a] mb-2">{displayName}</h2>
                    <p className="text-[#1e3a8a] font-medium mb-4 bg-blue-50 px-4 py-1 rounded-full text-sm">{displayRole}</p>

                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-8 bg-gray-50 px-4 py-2 rounded-xl">
                        <MapPin size={16} />
                        <span>{displayLocation}</span>
                    </div>

                    <div className="mt-auto w-full pt-6 border-t border-gray-100">
                        <button 
                            onClick={handleLogout}
                            className="w-full py-4 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all font-bold flex items-center justify-center gap-2 group outline-none"
                        >
                            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                            <span>تسجيل الخروج</span>
                        </button>
                        <p className="text-xs text-gray-300 font-medium mt-4">الإصدار 1.0.0</p>
                    </div>
                </div>

                {/* Left Column: Basic Information */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 relative">
                    <div className="flex justify-between items-start mb-8">
                        <h3 className="text-xl font-bold text-gray-800 border-r-4 border-[#1e3a8a] pr-3">المعلومات الأساسية</h3>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 text-[#1e3a8a] hover:bg-blue-50 px-4 py-2 rounded-xl transition-all font-bold text-sm"
                        >
                            <Edit3 size={16} />
                            طلب تعديل
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-[#F8F9FA] p-4 rounded-2xl flex items-center justify-between group hover:border-blue-100 border border-transparent transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 text-[#1e3a8a] rounded-xl flex items-center justify-center">
                                    <Hash size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold mb-1">اسم المستخدم / الرقم الوظيفي</p>
                                    <p className="text-lg font-bold text-gray-800 font-mono tracking-wider">{displayEmpId}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#F8F9FA] p-4 rounded-2xl flex items-center justify-between group hover:border-blue-100 border border-transparent transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 text-[#1e3a8a] rounded-xl flex items-center justify-center">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold mb-1">رقم الجوال</p>
                                    <p className="text-lg font-bold text-gray-800 font-mono tracking-wider" dir="ltr">{displayPhone}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#F8F9FA] p-4 rounded-2xl flex items-center justify-between group hover:border-blue-100 border border-transparent transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 text-[#1e3a8a] rounded-xl flex items-center justify-center">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold mb-1">البريد الإلكتروني</p>
                                    <p className="text-lg font-bold text-gray-800 font-mono">{displayEmail}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

             {/* Security Banner */}
             <div className="mt-8 bg-blue-50 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-blue-100/50">
                <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#1e3a8a] shadow-sm">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-[#1e3a8a]">بياناتك محمية</h4>
                        <p className="text-xs text-blue-500 font-medium">جميع البيانات مشفرة ومحفوظة وفقاً لأعلى معايير الأمان بالنظام.</p>
                    </div>
                </div>
             </div>

            {/* Edit Request Modal (يظل كما هو واجهة للطلب) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl relative overflow-hidden">
                        <div className="bg-[#1e3a8a] p-6 text-white flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Edit3 size={20} />
                                طلب تعديل بيانات
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8">
                            <label className="block text-gray-700 font-bold mb-3 text-sm">سبب التعديل</label>
                            <textarea 
                                className="w-full h-32 bg-gray-50 border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-[#1e3a8a] outline-none resize-none transition-all text-sm"
                                placeholder="يرجى توضيح البيانات المراد تعديلها (مثل: تغيير رقم الجوال)..."
                            ></textarea>
                            
                            <div className="mt-6 p-4 bg-blue-50 rounded-xl text-blue-800 text-xs font-bold text-center">
                                سيتم رفع الطلب لإدارة محكمة الأسرة للمراجعة.
                            </div>

                            <div className="mt-8 flex gap-4">
                                <button 
                                    onClick={() => setIsModalOpen(false)} 
                                    className="flex-1 bg-[#1e3a8a] hover:bg-blue-900 text-white py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
                                >
                                    إرسال الطلب
                                </button>
                                <button 
                                    onClick={() => setIsModalOpen(false)} 
                                    className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-bold transition-all active:scale-95"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
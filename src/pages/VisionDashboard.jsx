import React, { useState } from 'react';
import { Search, FileText, Scale, Calendar, MapPin, User, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { visitationAPI } from '../services/api'; 

const VisionDashboard = () => {
    // States
    const [searchTerm, setSearchTerm] = useState('');
    const [visitationData, setVisitationData] = useState(null);
    
    // Attendance States
    const [fatherAttendance, setFatherAttendance] = useState(false);
    const [companionAttendance, setCompanionAttendance] = useState(false);
    const [companionIdInput, setCompanionIdInput] = useState('');
    
    // Loading States
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmittingFather, setIsSubmittingFather] = useState(false);
    const [isSubmittingCompanion, setIsSubmittingCompanion] = useState(false);

    // 1. دالة البحث (تعمل الآن بدون أخطاء 403)
    const handleSearch = async () => {
        if (!searchTerm) {
            toast.error('يرجى إدخال الرقم القومي للبحث');
            return;
        }

        setIsSearching(true);
        try {
            const response = await visitationAPI.searchVisitations({ NationalId: searchTerm });
            const items = response.data?.items;
            
            if (items && items.length > 0) {
                const visit = items[0];
                setVisitationData(visit);
                
                // تحديث الحالات بناءً على البيانات الحقيقية من السيرفر
                setFatherAttendance(!!visit.nonCustodialCheckedInAt);
                setCompanionAttendance(!!visit.companionCheckedInAt);
                setCompanionIdInput(visit.companionNationalId || '');
            } else {
                toast.error('لم يتم العثور على زيارة مسجلة بهذا الرقم القومي');
                setVisitationData(null);
            }
        } catch (error) {
            console.error(error);
            toast.error('حدث خطأ أثناء الاتصال بالسيرفر');
            setVisitationData(null);
        } finally {
            setIsSearching(false);
        }
    };

    // 2. تسجيل حضور الطرف غير الحاضن
    const handleFatherSubmit = async (e) => {
        e.preventDefault();
        if (!fatherAttendance) {
            toast.error('يرجى تفعيل زر الحضور أولاً');
            return;
        }

        setIsSubmittingFather(true);
        try {
            await visitationAPI.checkInVisitation(visitationData.id, {
                nationalId: visitationData.nonCustodialNationalId || searchTerm
            });
            toast.success('تم تسجيل حضور الطرف غير الحاضن بنجاح');
            
            // تحديث محلي للبيانات
            setVisitationData(prev => ({...prev, nonCustodialCheckedInAt: new Date().toISOString()}));
        } catch (error) {
            console.error(error);
            // ✅ التعديل هنا: اصطياد خطأ التوقيت وعرض رسالة مخصصة
            if (error.response?.data?.title === "Visitation.NotScheduledForToday") {
                toast.error('لا يمكن تسجيل الحضور، هذه الزيارة غير مجدولة لتاريخ اليوم.');
            } else {
                toast.error(error.response?.data?.detail || 'فشل تسجيل الحضور');
            }
        } finally {
            setIsSubmittingFather(false);
        }
    };

    // 3. تسجيل بيانات وحضور المرافق (الطرف الحاضن)
    const handleCompanionSubmit = async (e) => {
        e.preventDefault();
        
        if (!companionIdInput) {
            toast.error('يرجى إدخال الرقم القومي للمرافق');
            return;
        }

        setIsSubmittingCompanion(true);
        try {
            // أ. إذا تم تغيير أو إدخال رقم قومي جديد للمرافق، نقوم بتحديثه في السيرفر
            if (companionIdInput !== visitationData.companionNationalId) {
                await visitationAPI.setCompanion(visitationData.id, {
                    companionNationalId: companionIdInput
                });
            }

            // ب. إذا تم تفعيل الحضور ولم يكن مسجلاً مسبقاً
            if (companionAttendance && !visitationData.companionCheckedInAt) {
                await visitationAPI.checkInVisitation(visitationData.id, {
                    nationalId: companionIdInput
                });
            }

            toast.success('تم حفظ بيانات وحضور المرافق بنجاح');
            
            // تحديث محلي
            setVisitationData(prev => ({
                ...prev, 
                companionNationalId: companionIdInput,
                companionCheckedInAt: companionAttendance ? new Date().toISOString() : prev.companionCheckedInAt
            }));
            
        } catch (error) {
            console.error(error);
            // ✅ التعديل هنا: اصطياد خطأ التوقيت وعرض رسالة مخصصة
            if (error.response?.data?.title === "Visitation.NotScheduledForToday") {
                toast.error('لا يمكن تسجيل الحضور، هذه الزيارة غير مجدولة لتاريخ اليوم.');
            } else {
                toast.error(error.response?.data?.detail || 'فشل حفظ بيانات المرافق');
            }
        } finally {
            setIsSubmittingCompanion(false);
        }
    };

    const currentDate = new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="animate-in fade-in duration-300" dir="rtl">
            {/* الهيدر */}
            <header className="bg-[#1e3a8a] rounded-[2rem] p-6 mb-10 text-white shadow-xl flex flex-col md:flex-row justify-between items-center relative overflow-hidden text-center md:text-right">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute right-[-50px] top-[-50px] w-64 h-64 bg-white rounded-full blur-[80px]"></div>
                    <div className="absolute left-[-20px] bottom-[-20px] w-40 h-40 bg-blue-400 rounded-full blur-[60px]"></div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6 z-10">
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-sm">
                        <Scale size={32} />
                    </div>
                    <div>
                        <p className="text-blue-200 text-sm mb-1 font-medium">مرحباً بك،</p>
                        <h2 className="text-3xl font-bold mb-2">موظف مركز الرؤية</h2>
                        <div className="flex flex-col md:flex-row items-center gap-3 text-blue-200 text-xs font-medium bg-blue-900/30 px-3 py-1.5 rounded-lg border border-white/5">
                            <span className="flex items-center gap-1"><MapPin size={12} /> لوحة المتابعة</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 md:mt-0 bg-[#2d4b9e]/80 backdrop-blur-md px-6 py-4 rounded-xl border border-blue-400/30 text-center shadow-inner z-10 w-full md:w-auto">
                    <p className="text-xs text-blue-200 mb-1 font-medium flex items-center justify-center gap-1"><Calendar size={12}/> تاريخ اليوم</p>
                    <p className="text-lg font-bold tracking-wide">{currentDate}</p>
                </div>
            </header>

            {/* قسم البحث */}
            <section className="bg-white rounded-[2rem] shadow-sm p-8 mb-8 border border-gray-100">
                <div className="max-w-4xl mx-auto">
                    <label className="block text-base font-bold text-gray-700 mb-3 mr-1">بحث برقم الهوية للطرف غير الحاضن</label>
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="أدخل الرقم القومي للبحث في الزيارات..." 
                                className="block w-full pr-11 pl-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:bg-white focus:border-[#1e3a8a] outline-none transition-all font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <button 
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="bg-[#1e3a8a] hover:bg-blue-900 text-white px-10 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-95 disabled:opacity-70"
                        >
                            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'بحث'}
                        </button>
                    </div>
                </div>
            </section>

            {/* عرض النتائج */}
            {visitationData && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-fade-in-up">
                    
                    {/* بطاقة الطرف غير الحاضن */}
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-[#1e3a8a] to-blue-400"></div>
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                            <div className="bg-blue-50 p-4 rounded-2xl text-[#1e3a8a]">
                                <User size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">الطرف غير الحاضن</h3>
                                <p className="text-sm text-gray-500 font-medium">الرقم المرجعي: {visitationData.id.split('-')[0]}</p>
                            </div>
                        </div>

                        <form onSubmit={handleFatherSubmit} className="flex-1 flex flex-col">
                            <div className="space-y-4 mb-10">
                                <div className="bg-[#F8F9FA] p-5 rounded-2xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 mb-2">الرقم القومي (المسجل بالنظام)</p>
                                    <p className="text-xl font-bold text-gray-800 tracking-wider font-mono">{visitationData.nonCustodialNationalId || searchTerm}</p>
                                </div>
                                <div className="bg-[#F8F9FA] p-5 rounded-2xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 mb-2">حالة الزيارة الحالية</p>
                                    <p className={`text-xl font-bold ${visitationData.status === 'Completed' ? 'text-green-600' : 'text-[#1e3a8a]'}`}>
                                        {visitationData.status || 'معلقة'}
                                    </p>
                                </div>
                                
                                <label className="flex items-center gap-4 p-5 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-[#1e3a8a] hover:bg-blue-50/10 transition-all group mt-4">
                                    <div className="relative flex items-center">
                                        <input 
                                            type="checkbox" 
                                            className="peer w-6 h-6 text-[#1e3a8a] rounded-lg focus:ring-[#1e3a8a] border-gray-300 transition-all checked:bg-[#1e3a8a]"
                                            checked={fatherAttendance}
                                            onChange={(e) => setFatherAttendance(e.target.checked)}
                                            disabled={!!visitationData.nonCustodialCheckedInAt} // تعطيل إذا كان مسجلاً بالفعل
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-lg font-bold text-gray-700 peer-checked:text-[#1e3a8a] transition-colors">
                                            {visitationData.nonCustodialCheckedInAt ? 'تم تسجيل الحضور' : 'تسجيل الحضور'}
                                        </span>
                                        <span className="text-xs text-gray-400 font-medium">
                                            {visitationData.nonCustodialCheckedInAt ? `وقت الحضور: ${new Date(visitationData.nonCustodialCheckedInAt).toLocaleTimeString('ar-EG')}` : 'قم بالتفعيل لتأكيد تواجده بالمركز'}
                                        </span>
                                    </div>
                                </label>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmittingFather || !!visitationData.nonCustodialCheckedInAt}
                                className="w-full bg-[#1e3a8a] hover:bg-blue-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-900/15 transition-all mt-auto active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:bg-gray-400"
                            >
                                {isSubmittingFather ? <Loader2 className="w-5 h-5 animate-spin" /> : (visitationData.nonCustodialCheckedInAt ? 'حضور مسجل' : 'حفظ حالة الطرف غير الحاضن')}
                            </button>
                        </form>
                    </div>

                    {/* بطاقة المرافق */}
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-green-600 to-emerald-400"></div>
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                            <div className="bg-green-50 p-4 rounded-2xl text-green-700">
                                <FileText size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">المرافق (الطرف الحاضن)</h3>
                                <p className="text-sm text-gray-500 font-medium">بيانات وتسجيل حضور المرافق</p>
                            </div>
                        </div>

                        <form onSubmit={handleCompanionSubmit} className="flex-1 flex flex-col">
                            <div className="space-y-4 mb-10">
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 focus-within:ring-2 focus-within:ring-green-600 transition-all">
                                    <label className="block text-xs font-bold text-gray-500 mb-2">الرقم القومي للمرافق</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-transparent border-none text-xl font-bold text-gray-800 tracking-wider font-mono p-0 focus:ring-0 outline-none"
                                        placeholder="أدخل الرقم القومي للمرافق"
                                        value={companionIdInput}
                                        onChange={(e) => setCompanionIdInput(e.target.value)}
                                        dir="ltr"
                                        disabled={!!visitationData.companionCheckedInAt}
                                    />
                                </div>
                                
                                <label className="flex items-center gap-4 p-5 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-green-600 hover:bg-green-50/10 transition-all group mt-4">
                                    <div className="relative flex items-center">
                                        <input 
                                            type="checkbox" 
                                            className="peer w-6 h-6 text-green-600 rounded-lg focus:ring-green-600 border-gray-300 transition-all checked:bg-green-600"
                                            checked={companionAttendance}
                                            onChange={(e) => setCompanionAttendance(e.target.checked)}
                                            disabled={!!visitationData.companionCheckedInAt}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-lg font-bold text-gray-700 peer-checked:text-green-700 transition-colors">
                                            {visitationData.companionCheckedInAt ? 'تم تسجيل الحضور' : 'تسجيل الحضور'}
                                        </span>
                                        <span className="text-xs text-gray-400 font-medium">
                                            {visitationData.companionCheckedInAt ? `وقت الحضور: ${new Date(visitationData.companionCheckedInAt).toLocaleTimeString('ar-EG')}` : 'قم بالتفعيل لتأكيد تسليم الأطفال للمركز'}
                                        </span>
                                    </div>
                                </label>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmittingCompanion || !!visitationData.companionCheckedInAt}
                                className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-900/15 transition-all mt-auto active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isSubmittingCompanion && <Loader2 className="w-5 h-5 animate-spin" />}
                                {visitationData.companionCheckedInAt ? 'حضور مسجل' : 'حفظ بيانات وحضور المرافق'}
                            </button>
                        </form>
                    </div>

                </div>
            )}
        </div>
    );
};

export default VisionDashboard;
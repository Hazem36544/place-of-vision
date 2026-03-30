import React, { useState, useEffect } from 'react';
import { Search, FileText, Scale, Calendar, MapPin, User, Loader2, AlertCircle, Clock, AlertTriangle, CheckCircle, LogOut } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { visitationAPI, authAPI, lookupAPI } from '../services/api'; 

const VisionDashboard = () => {
    // States
    const [searchTerm, setSearchTerm] = useState('');
    const [visitationData, setVisitationData] = useState(null);
    
    // رسائل التنبيه الخاصة بالوقت وحالة الزيارة
    const [timingStatus, setTimingStatus] = useState(null);

    // User States 
    const [employeeName, setEmployeeName] = useState('موظف مركز الرؤية');
    const [centerName, setCenterName] = useState('لوحة المتابعة');

    // Attendance States
    const [companionIdInput, setCompanionIdInput] = useState('');
    
    // Loading States
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmittingFather, setIsSubmittingFather] = useState(false);
    const [isSubmittingCompanion, setIsSubmittingCompanion] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);

    // جلب بيانات الموظف واسم المركز
    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const userResponse = await authAPI.getCurrentUser();
                const userData = userResponse.data;

                if (userData && userData.fullName) {
                    setEmployeeName(userData.fullName);
                }
            } catch (error) {
                console.error("خطأ في جلب بيانات الموظف أو المركز:", error);
            }
        };

        fetchUserDetails();
    }, []);

    // 🚀 خوارزمية حساب حالة ووقت الزيارة (محدثة لتشمل حالة الانصراف)
    const evaluateTiming = (visit) => {
        if (!visit || !visit.startAt || !visit.endAt) return null;

        const now = new Date();
        const start = new Date(visit.startAt);
        const end = new Date(visit.endAt);

        // إذا كانت الزيارة ملغية أو فائتة
        if (visit.status === 'Missed' || visit.status === 'Cancelled') {
             return { type: 'error', text: `عفواً، لا يمكن التسجيل. حالة الزيارة الحالية: ${visit.status === 'Missed' ? 'فائتة (تجاوز وقت السماح)' : 'ملغية'}.` };
        }
        
        // إذا كانت الزيارة مكتملة
        if (visit.status === 'Completed' || visit.completedAt) {
             return { type: 'success', text: 'تم تسجيل حضور وانصراف هذه الزيارة بنجاح.' };
        }

        // إذا جاء مبكراً قبل موعد البداية
        if (now < start) {
            const diffMs = start - now;
            const diffMins = Math.floor(diffMs / 60000);
            
            if (diffMins < 60) {
                 return { type: 'warning', text: `لا يمكن تسجيل الحضور الآن، موعد الزيارة يبدأ بعد ${diffMins} دقيقة.` };
            } else {
                 const diffHours = Math.floor(diffMins / 60);
                 const remainingMins = diffMins % 60;
                 return { type: 'warning', text: `لا يمكن تسجيل الحضور الآن، موعد الزيارة يبدأ بعد ${diffHours} ساعة و ${remainingMins} دقيقة.` };
            }
        } 
        
        // إذا جاء متأخراً بعد موعد النهاية (ولم يقم السيرفر بتحويلها لـ Missed بعد)
        else if (now > end && !visit.nonCustodialCheckedInAt) {
             return { type: 'error', text: 'عفواً، لقد انتهى الوقت المخصص لهذه الزيارة ولا يمكن تسجيل الحضور الآن.' };
        }

        // الوقت الحالي مناسب للتسجيل
        return null; 
    };

    // 1. دالة البحث
    const handleSearch = async () => {
        if (!searchTerm) {
            toast.error('يرجى إدخال الرقم القومي للبحث');
            return;
        }

        setIsSearching(true);
        setTimingStatus(null); 

        try {
            const response = await visitationAPI.searchVisitations({ NationalId: searchTerm });
            const items = response.data?.items;
            
            if (items && items.length > 0) {
                const visit = items[0];
                setVisitationData(visit);
                
                // تحديث الحالات بناءً على البيانات الحقيقية
                setCompanionIdInput(visit.companionNationalId || '');

                // تشغيل خوارزمية الوقت وعرض التنبيه إن وجد
                const timingAlert = evaluateTiming(visit);
                setTimingStatus(timingAlert);

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
        setTimingStatus(null); 

        setIsSubmittingFather(true);
        try {
            await visitationAPI.checkInVisitation(visitationData.id, {
                nationalId: visitationData.nonCustodialNationalId || searchTerm
            });
            toast.success('تم تسجيل حضور الطرف غير الحاضن بنجاح');
            
            // تحديث محلي
            setVisitationData(prev => ({...prev, nonCustodialCheckedInAt: new Date().toISOString()}));
        } catch (error) {
            const errorTitle = error.response?.data?.title;
            const errorDetail = error.response?.data?.detail;
            
            let displayError = errorDetail || 'فشل تسجيل الحضور لسبب غير معروف.';
            if (errorTitle === "Visitation.NotScheduledForToday") displayError = 'لا يمكن تسجيل الحضور، هذه الزيارة غير مجدولة لتاريخ اليوم.';
            if (errorTitle === "Visitation.NotInProgress") displayError = 'حالة الزيارة الحالية لا تسمح بتسجيل الحضور (قد تكون فائتة أو لم تبدأ بعد).';

            setTimingStatus({ type: 'error', text: displayError });
        } finally {
            setIsSubmittingFather(false);
        }
    };

    // 3. تسجيل بيانات وحضور المرافق (الطرف الحاضن)
    const handleCompanionSubmit = async (e) => {
        e.preventDefault();
        setTimingStatus(null);
        
        if (!companionIdInput) {
            toast.error('يرجى إدخال الرقم القومي للمرافق');
            return;
        }

        setIsSubmittingCompanion(true);
        try {
            if (companionIdInput !== visitationData.companionNationalId) {
                await visitationAPI.setCompanion(visitationData.id, {
                    companionNationalId: companionIdInput
                });
            }

            if (!visitationData.companionCheckedInAt) {
                await visitationAPI.checkInVisitation(visitationData.id, {
                    nationalId: companionIdInput
                });
            }

            toast.success('تم حفظ بيانات وحضور المرافق بنجاح');
            
            setVisitationData(prev => ({
                ...prev, 
                companionNationalId: companionIdInput,
                companionCheckedInAt: new Date().toISOString()
            }));
            
        } catch (error) {
             const errorTitle = error.response?.data?.title;
             const errorDetail = error.response?.data?.detail;
             
             let displayError = errorDetail || 'فشل حفظ بيانات أو حضور المرافق.';
             if (errorTitle === "Visitation.NotScheduledForToday") displayError = 'لا يمكن تسجيل الحضور، هذه الزيارة غير مجدولة لتاريخ اليوم.';
             if (errorTitle === "Visitation.NotInProgress") displayError = 'حالة الزيارة الحالية لا تسمح بتسجيل الحضور (قد تكون فائتة أو لم تبدأ بعد).';
 
             setTimingStatus({ type: 'error', text: displayError });
        } finally {
            setIsSubmittingCompanion(false);
        }
    };

    // 4. 🚀 تسجيل الانصراف وإنهاء الزيارة (مع التقاط الخطأ 400 الدقيق)
    const handleCompleteVisit = async () => {
        setIsCompleting(true);
        try {
            await visitationAPI.completeVisitation(visitationData.id);
            const completionTime = new Date().toISOString();
            
            toast.success('تم إنهاء الزيارة وتسجيل وقت الانصراف بنجاح');
            
            setVisitationData(prev => ({
                ...prev, 
                status: 'Completed',
                completedAt: completionTime
            }));
            setTimingStatus({ type: 'success', text: 'الزيارة مكتملة، تم تسجيل وقت الانصراف بنجاح.' });
        } catch (error) {
            console.error("Complete Visit Error:", error);
            const errorDetail = error.response?.data?.detail;
            const errorTitle = error.response?.data?.title;

            let finalMessage = "حدث خطأ أثناء محاولة إنهاء الزيارة";
            
            // تخصيص الرسالة حسب القيد الزمني للسيرفر
            if (errorTitle === "Visitation.CannotCompleteBeforeEndTime") {
                finalMessage = "عفواً، لا يمكن إنهاء الزيارة وتسجيل الانصراف قبل موعد النهاية المحدد لها.";
            } else if (errorDetail) {
                finalMessage = errorDetail;
            }

            toast.error(finalMessage);
            setTimingStatus({ type: 'error', text: finalMessage });
        } finally {
            setIsCompleting(false);
        }
    };

    const currentDate = new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    const isActionDisabled = timingStatus?.type === 'error' || visitationData?.status === 'Completed';

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
                        <h2 className="text-3xl font-bold mb-2">{employeeName}</h2>
                        <div className="flex flex-col md:flex-row items-center gap-3 text-blue-200 text-xs font-medium bg-blue-900/30 px-3 py-1.5 rounded-lg border border-white/5">
                            <span className="flex items-center gap-1"><MapPin size={12} /> {centerName}</span>
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

            {/* التنبيهات الديناميكية */}
            {timingStatus && visitationData && (
                <div className="max-w-4xl mx-auto mb-8 animate-in slide-in-from-top-4">
                    <div className={`p-5 rounded-2xl flex items-start gap-4 border ${
                        timingStatus.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
                        timingStatus.type === 'warning' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                        'bg-green-50 border-green-200 text-green-700'
                    }`}>
                        <div className={`p-2 rounded-xl shrink-0 ${
                            timingStatus.type === 'error' ? 'bg-red-100' :
                            timingStatus.type === 'warning' ? 'bg-orange-100' : 'bg-green-100'
                        }`}>
                            {timingStatus.type === 'error' ? <AlertTriangle className="w-6 h-6" /> : 
                             timingStatus.type === 'warning' ? <Clock className="w-6 h-6 animate-pulse" /> : 
                             <CheckCircle className="w-6 h-6" />}
                        </div>
                        <div className="pt-1">
                            <h4 className="font-bold text-base mb-1">
                                {timingStatus.type === 'error' ? 'تنبيه خطأ' : 
                                 timingStatus.type === 'warning' ? 'تنبيه بخصوص موعد الزيارة' : 
                                 'عملية ناجحة'}
                            </h4>
                            <p className="text-sm font-medium leading-relaxed opacity-90">{timingStatus.text}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* عرض النتائج */}
            {visitationData && (
                <div className={`grid grid-cols-1 xl:grid-cols-2 gap-8 transition-opacity duration-300 ${isActionDisabled ? 'opacity-70 grayscale-[20%]' : ''}`}>
                    
                    {/* بطاقة الطرف غير الحاضن */}
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 flex flex-col h-full relative overflow-hidden">
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
                                <div className="bg-[#F8F9FA] p-5 rounded-2xl border border-gray-100 flex justify-between items-center">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 mb-1">موعد الزيارة المحدد</p>
                                        <p className="text-sm font-bold text-gray-700" dir="ltr">
                                            {new Date(visitationData.startAt).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})} - {new Date(visitationData.endAt).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}
                                        </p>
                                    </div>
                                    <Clock className="text-[#1e3a8a] w-6 h-6 opacity-50" />
                                </div>

                                <div className="bg-[#F8F9FA] p-5 rounded-2xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 mb-2">الرقم القومي (المسجل بالنظام)</p>
                                    <p className="text-xl font-bold text-gray-800 tracking-wider font-mono">{visitationData.nonCustodialNationalId || searchTerm}</p>
                                </div>
                                <div className="bg-[#F8F9FA] p-5 rounded-2xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 mb-2">حالة الزيارة الحالية</p>
                                    <p className={`text-xl font-bold ${visitationData.status === 'Completed' ? 'text-green-600' : visitationData.status === 'Missed' ? 'text-red-600' : 'text-[#1e3a8a]'}`}>
                                        {visitationData.status || 'معلقة'}
                                    </p>
                                </div>

                                {visitationData.nonCustodialCheckedInAt && (
                                    <div className="p-5 border-2 border-dashed border-green-200 bg-green-50/50 rounded-2xl mt-4">
                                        <div className="text-green-700 font-bold mb-1 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            تم تسجيل الحضور
                                        </div>
                                        <p className="text-xs text-green-600 font-medium">
                                            وقت الحضور: {new Date(visitationData.nonCustodialCheckedInAt).toLocaleTimeString('ar-EG')}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmittingFather || !!visitationData.nonCustodialCheckedInAt || isActionDisabled}
                                className="w-full bg-[#1e3a8a] hover:bg-blue-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-900/15 transition-all mt-auto active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:bg-gray-400 disabled:shadow-none"
                            >
                                {isSubmittingFather ? <Loader2 className="w-5 h-5 animate-spin" /> : (visitationData.nonCustodialCheckedInAt ? 'حضور مسجل' : 'تسجيل حضور الطرف غير الحاضن')}
                            </button>
                        </form>
                    </div>

                    {/* بطاقة المرافق */}
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 flex flex-col h-full relative overflow-hidden">
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
                                <div className={`p-5 rounded-2xl border transition-all ${
                                    isActionDisabled ? 'bg-gray-100 border-gray-200 opacity-60' : 'bg-gray-50 border-gray-100 focus-within:ring-2 focus-within:ring-green-600'
                                }`}>
                                    <label className="block text-xs font-bold text-gray-500 mb-2">الرقم القومي للمرافق</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-transparent border-none text-xl font-bold text-gray-800 tracking-wider font-mono p-0 focus:ring-0 outline-none disabled:cursor-not-allowed"
                                        placeholder="أدخل الرقم القومي للمرافق"
                                        value={companionIdInput}
                                        onChange={(e) => setCompanionIdInput(e.target.value.replace(/\D/g, ''))}
                                        dir="ltr"
                                        maxLength="14"
                                        disabled={!!visitationData.companionCheckedInAt || isActionDisabled}
                                    />
                                </div>

                                {visitationData.companionCheckedInAt && (
                                    <div className="p-5 border-2 border-dashed border-green-200 bg-green-50/50 rounded-2xl mt-4">
                                        <div className="text-green-700 font-bold mb-1 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            تم تسجيل الحضور
                                        </div>
                                        <p className="text-xs text-green-600 font-medium">
                                            وقت الحضور: {new Date(visitationData.companionCheckedInAt).toLocaleTimeString('ar-EG')}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmittingCompanion || !!visitationData.companionCheckedInAt || isActionDisabled}
                                className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-900/15 transition-all mt-auto active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:bg-gray-400 disabled:shadow-none"
                            >
                                {isSubmittingCompanion ? <Loader2 className="w-5 h-5 animate-spin" /> : (visitationData.companionCheckedInAt ? 'حضور مسجل' : 'حفظ بيانات وتسجيل حضور المرافق')}
                            </button>
                        </form>
                    </div>

                    {/* 🚀 بطاقة إنهاء الزيارة وتسجيل الانصراف */}
                    {visitationData.nonCustodialCheckedInAt && visitationData.companionCheckedInAt && (
                        <div className="xl:col-span-2 bg-blue-50 border-2 border-dashed border-blue-200 p-8 rounded-[2.5rem] flex flex-col items-center text-center animate-in zoom-in-95">
                            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                <LogOut className="text-blue-600 w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-blue-900 mb-2">إجراءات إنهاء الزيارة والانصراف</h3>
                            <p className="text-blue-700 mb-8 font-medium">الطرفان قاما بتسجيل الحضور بنجاح. يرجى الضغط على الزر أدناه لتسجيل وقت الانصراف الفعلي عند انتهاء الزيارة.</p>
                            
                            {visitationData.completedAt || visitationData.status === 'Completed' ? (
                                <div className="bg-green-100 text-green-800 px-10 py-5 rounded-2xl font-bold flex items-center gap-3 border border-green-200">
                                    <CheckCircle size={24} />
                                    <div className="text-right">
                                        <p className="text-lg">تم إنهاء الزيارة بنجاح</p>
                                        <p className="text-sm opacity-80">وقت الانصراف المسجل: {new Date(visitationData.completedAt || new Date()).toLocaleTimeString('ar-EG')}</p>
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    onClick={handleCompleteVisit}
                                    disabled={isCompleting}
                                    className="bg-red-600 hover:bg-red-700 text-white px-16 py-5 rounded-2xl font-bold shadow-xl shadow-red-200 transition-all flex items-center gap-3 active:scale-95 text-lg disabled:opacity-70 disabled:active:scale-100"
                                >
                                    {isCompleting ? <Loader2 className="animate-spin w-6 h-6" /> : <><LogOut size={24}/> تسجيل انصراف الطرفين وإنهاء الزيارة</>}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VisionDashboard;
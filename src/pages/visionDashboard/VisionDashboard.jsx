import React, { useState, useEffect } from 'react';
import { Search, FileText, Scale, Calendar, MapPin, User, Loader2, AlertCircle, Clock, AlertTriangle, CheckCircle, LogOut, Baby, Check, CheckSquare, Timer, X, FastForward, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api, { visitationAPI, authAPI } from '../../services/api'; 

import { getErrorMessage } from '../../utils/errorHandler';

const VisionDashboard = () => {
    // States
    const [searchTerm, setSearchTerm] = useState('');
    const [visitationData, setVisitationData] = useState(null);
    
    // 🚀 States الخاصة بأداة تسريع الوقت (Time Machine)
    const [timeShiftState, setTimeShiftState] = useState(() => sessionStorage.getItem('dev_time_shift_vision') || 'none');
    const [isShiftingTime, setIsShiftingTime] = useState(false);
    
    // حالة لعرض الوقت الحي المسرّع في الهيدر
    const [simulatedTime, setSimulatedTime] = useState(new Date());

    // رسائل التنبيه الخاصة بالوقت وحالة الزيارة
    const [timingStatus, setTimingStatus] = useState(null);
    const [isVisitActive, setIsVisitActive] = useState(false); 
    
    // States جديدة للتحكم في زر الانصراف والعداد التنازلي
    const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
    const [checkOutCountdown, setCheckOutCountdown] = useState('');

    // User States 
    const [employeeName, setEmployeeName] = useState('موظف مركز الرؤية');
    const [centerName, setCenterName] = useState('لوحة المتابعة');
    const [userLocationId, setUserLocationId] = useState(null);

    // Attendance States
    const [companionIdInput, setCompanionIdInput] = useState('');
    
    // Children States
    const [childrenList, setChildrenList] = useState([]);
    const [selectedChildren, setSelectedChildren] = useState([]);

    // Loading States
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmittingFather, setIsSubmittingFather] = useState(false);
    const [isSubmittingCompanion, setIsSubmittingCompanion] = useState(false);
    const [isCheckingOutFather, setIsCheckingOutFather] = useState(false);
    const [isCheckingOutCompanion, setIsCheckingOutCompanion] = useState(false);

    const [isPageLoaded, setIsPageLoaded] = useState(false);

    // دالة ذكية لحساب الوقت الحالي الفعلي مضافاً إليه مقدار تسريع الوقت
    const getSimulatedNow = () => {
        const offset = parseInt(sessionStorage.getItem('dev_time_offset_vision') || '0', 10);
        return new Date(Date.now() + offset);
    };

    // تشغيل الساعة الحية في الهيدر لتعكس الوقت المسرّع
    useEffect(() => {
        const interval = setInterval(() => {
            setSimulatedTime(getSimulatedNow());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsPageLoaded(true);
        }, 50);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const userResponse = await authAPI.getCurrentUser();
                const userData = userResponse.data;

                if (userData) {
                    if (userData.fullName) setEmployeeName(userData.fullName);
                    const uLocId = userData.visitCenterId || userData.locationId;
                    if (uLocId) setUserLocationId(uLocId);
                }
            } catch (error) {
                console.error("خطأ في جلب بيانات الموظف أو المركز:", error);
            }
        };

        fetchUserDetails();
    }, []);

    // جلب قائمة الأطفال عند تحديد الأسرة
    useEffect(() => {
        const fetchChildren = async () => {
            if (visitationData?.familyId) {
                try {
                    const res = await api.get(`/api/families/${visitationData.familyId}/children`);
                    setChildrenList(Array.isArray(res.data) ? res.data : []);
                    
                    const attendedKids = visitationData.attendance?.attendedChildrenIds || [];
                    if (attendedKids.length > 0) {
                        setSelectedChildren(attendedKids);
                    } else {
                        setSelectedChildren([]); 
                    }
                } catch (error) {
                    console.error("Failed to fetch children", error);
                }
            } else {
                setChildrenList([]);
                setSelectedChildren([]);
            }
        };

        fetchChildren();
    }, [visitationData?.id, visitationData?.familyId]);

    // خوارزمية العداد الحي المعدلة (تعتمد على الوقت المسرّع بدلاً من وقت الجهاز المحلي)
    useEffect(() => {
        if (!visitationData) {
            setTimingStatus(null);
            setIsVisitActive(false);
            setIsCheckOutOpen(false);
            return;
        }

        const start = new Date(visitationData.startAt).getTime();
        const end = new Date(visitationData.endAt).getTime();
        const att = visitationData.attendance || {};

        const updateCountdown = () => {
            // استخدام الوقت المسرّع بدلاً من Date.now()
            const now = getSimulatedNow().getTime();

            // حساب حالة زر الانصراف والعداد
            if (now < end) {
                setIsCheckOutOpen(false);
                const diffMs = end - now;
                const h = Math.floor(diffMs / 3600000);
                const m = Math.floor((diffMs % 3600000) / 60000);
                const s = Math.floor((diffMs % 60000) / 1000);
                setCheckOutCountdown(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
            } else {
                setIsCheckOutOpen(true);
                setCheckOutCountdown('');
            }

            if (visitationData.status === 'Missed' || visitationData.status === 'Cancelled') {
                setTimingStatus({ type: 'error', text: `عفواً، لا يمكن التسجيل. حالة الزيارة الحالية: ${visitationData.status === 'Missed' ? 'فائتة (تجاوز وقت السماح)' : 'ملغية'}.` });
                setIsVisitActive(false);
                return;
            }
            
            if (visitationData.status === 'Completed' || att.areBothCheckedOut || visitationData.completedAt) {
                setTimingStatus({ type: 'success', text: 'تم اكتمال هذه الزيارة وانصراف جميع الأطراف بنجاح.' });
                setIsVisitActive(false);
                return;
            }

            if (now < start) {
                setIsVisitActive(false);
                const diffMs = start - now;
                const diffSecs = Math.floor(diffMs / 1000);

                const days = Math.floor(diffSecs / 86400);
                const hours = Math.floor((diffSecs % 86400) / 3600);
                const minutes = Math.floor((diffSecs % 3600) / 60);
                const seconds = diffSecs % 60;

                let timeStr = '';
                if (days > 7) {
                    timeStr = 'بعد أكثر من أسبوع';
                } else if (days > 0) {
                    timeStr = `بعد ${days} يوم و ${hours} ساعة و ${minutes} دقيقة`;
                } else if (hours > 0) {
                    timeStr = `بعد ${hours} ساعة و ${minutes} دقيقة و ${seconds} ثانية`;
                } else {
                    timeStr = `بعد ${minutes} دقيقة و ${seconds} ثانية`;
                }

                setTimingStatus({ type: 'warning', text: `لا يمكن تسجيل الحضور الآن، موعد الزيارة يبدأ ${timeStr}.` });
            } 
            else if (now >= start && now <= end) {
                setIsVisitActive(true);
                setTimingStatus({ type: 'success', text: 'وقت الزيارة ساري، يمكنك تسجيل الحضور والانصراف الآن.' });
            } 
            else if (now > end) {
                if (!att.nonCustodialCheckedInAt && !att.companionCheckedInAt) {
                    setIsVisitActive(false); 
                    setTimingStatus({ type: 'error', text: 'عفواً، لقد انتهى الوقت المخصص لهذه الزيارة ولا يمكن تسجيل الحضور الآن.' });
                } else {
                    setIsVisitActive(true); 
                    setTimingStatus({ type: 'warning', text: 'لقد انتهى وقت الزيارة المحدد، يرجى تسجيل الانصراف للأطراف المتواجدة.' });
                }
            }
        };

        updateCountdown();
        const intervalId = setInterval(updateCountdown, 1000);

        return () => clearInterval(intervalId);
    }, [visitationData]);

    const handleBackendError = (error) => {
        const errorTitle = error.response?.data?.title;
        let displayError = "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.";

        if (errorTitle === "Visitation.NotScheduledForToday") displayError = 'لا يمكن تنفيذ العملية، هذه الزيارة غير مجدولة لتاريخ اليوم.';
        else if (errorTitle === "Visitation.NotInProgress") displayError = 'حالة الزيارة لا تسمح بهذه العملية (قد تكون فائتة أو لم تبدأ بعد).';
        else if (errorTitle === "Visitation.CannotCompleteBeforeEndTime") displayError = "عفواً، لا يمكن تسجيل الانصراف قبل موعد النهاية المحدد.";
        else if (errorTitle === "Visitation.CheckInTooLate") displayError = "عفواً، لقد انتهت فترة السماح المخصصة لتسجيل الحضور لهذه الزيارة.";
        else if (errorTitle) displayError = getErrorMessage(error) || displayError;
        else if (errorTitle === "Visitation.CannotCheckOutEarlyBeforeStartTimeFinish") displayError = "عفواً، يرفض السيرفر تسجيل الانصراف لوجود مشكلة في مزامنة التوقيت مع الخادم.";
        
        setTimingStatus({ type: 'error', text: displayError });
        toast.error(displayError);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setVisitationData(null);
        setTimingStatus(null);
        setCompanionIdInput('');
        setSelectedChildren([]);
    };

    const handleSearch = async () => {
        if (!searchTerm) {
            toast.error('يرجى إدخال الرقم القومي للبحث');
            return;
        }

        if (searchTerm.length !== 14) {
            toast.error('الرقم القومي يجب أن يتكون من 14 رقماً');
            return;
        }

        setIsSearching(true);
        setTimingStatus(null); 

        try {
            const response = await visitationAPI.searchVisitations({ NationalId: searchTerm });
            const items = response.data?.items;
            
            if (items && items.length > 0) {
                const visit = items[0];

                const targetCenterId = visit.visitCenterId || visit.locationId || visit.centerId;
                if (userLocationId && targetCenterId && targetCenterId !== userLocationId) {
                    toast.error('عفواً، هذه الأسرة والزيارة غير مسجلة في مركز الرؤية الحالي.');
                    setVisitationData(null);
                    return; 
                }

                if (!visit.attendance) visit.attendance = {};

                setVisitationData(visit);
                setCompanionIdInput(visit.companionNationalId || '');
                toast.success('تم جلب بيانات الزيارة بنجاح'); 

            } else {
                toast.error('لم يتم العثور على زيارة مسجلة بهذا الرقم القومي');
                setVisitationData(null);
            }
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error));
            setVisitationData(null);
        } finally {
            setIsSearching(false);
        }
    };

    // 🚀 ✅ دالة أداة تسريع الوقت المحسنة (إلغاء تلاعب المتصفح بالتاريخ)
    const handleTimeShift = async (type) => {
        setIsShiftingTime(true);
        try {
            if (type === 'reset') {
                await api.delete('/api/dev/time/reset');
                sessionStorage.removeItem('dev_time_offset_vision');
                sessionStorage.removeItem('dev_time_shift_vision');
                setTimeShiftState('none');
                setSimulatedTime(new Date());
                toast.success("تم إرجاع وقت السيرفر والواجهة للحالة الطبيعية", { icon: '🕰️' });
            } else {
                if (!visitationData) {
                    toast.error("يرجى البحث عن زيارة أولاً لتغيير الوقت إليها");
                    setIsShiftingTime(false);
                    return;
                }
                
                // ✅ الحل الجذري لأزمة CheckInTooLate:
                // إرسال الوقت للسيرفر كنص (String) كما استلمناه بالضبط بدون التعديل عليه بـ Date Object
                // لأن Date.toISOString() كانت تضيف فرق التوقيت (+3 ساعات) مما يجعل السيرفر يقفز لوقت متأخر جداً!
                let targetTime = type === 'start' ? visitationData.startAt : visitationData.endAt;
                
                // 1. تغيير وقت السيرفر
                await api.post('/api/dev/time/shift', { targetTime });
                
                // 2. تغيير وقت المتصفح محلياً لضبط العداد (Offset Calculation)
                const targetMs = new Date(targetTime).getTime();
                const realNowMs = Date.now();
                const offset = targetMs - realNowMs;
                sessionStorage.setItem('dev_time_offset_vision', offset.toString());
                
                setTimeShiftState(type);
                sessionStorage.setItem('dev_time_shift_vision', type);
                toast.success(`تم تقديم الوقت بنجاح لـ ${type === 'start' ? 'بداية' : 'نهاية'} الزيارة`, { icon: '⚡' });
            }
            
            // إعادة البحث أوتوماتيكياً لجلب التحديثات الجديدة من السيرفر وعرضها
            if (searchTerm && searchTerm.length === 14) {
                await handleSearch();
            }
        } catch (err) {
            toast.error("حدث خطأ أثناء تغيير الوقت بالسيرفر");
            console.error(err);
        } finally {
            setIsShiftingTime(false);
        }
    };

    // 2. حضور وانصراف الطرف غير الحاضن (الأب)
    const handleFatherCheckIn = async (e) => {
        e.preventDefault();
        
        setIsSubmittingFather(true);
        try {
            const nationalIdToUse = visitationData.nonCustodialNationalId || searchTerm;
            
            await api.patch(`/api/visit-sessions/${visitationData.id}/check-in?visitationId=${visitationData.id}`, {
                nationalId: nationalIdToUse,
                attendingChildrenIds: [] 
            });

            toast.success('تم تسجيل حضور الطرف غير الحاضن بنجاح');
            
            setVisitationData(prev => ({
                ...prev, 
                // نستخدم الوقت المسرّع لتحديث الواجهة فورياً بنفس التوقيت الجديد
                attendance: { ...prev.attendance, isNonCustodialCheckedIn: true, nonCustodialCheckedInAt: getSimulatedNow().toISOString() }
            }));
        } catch (error) {
            handleBackendError(error);
        } finally {
            setIsSubmittingFather(false);
        }
    };

    const handleFatherCheckOut = async (e) => {
        e.preventDefault();
        setIsCheckingOutFather(true);
        try {
            const nationalIdToUse = visitationData.nonCustodialNationalId || searchTerm;
            
            await api.patch(`/api/visit-sessions/${visitationData.id}/check-out?visitationId=${visitationData.id}`, { 
                nationalId: nationalIdToUse 
            });

            toast.success('تم تسجيل انصراف الطرف غير الحاضن بنجاح');
            
            setVisitationData(prev => ({
                ...prev, 
                attendance: { 
                    ...prev.attendance, 
                    isNonCustodialCheckedOut: true, 
                    nonCustodialCheckedOutAt: getSimulatedNow().toISOString(),
                    areBothCheckedOut: prev.attendance?.isCompanionCheckedOut || false
                }
            }));
        } catch (error) {
            handleBackendError(error);
        } finally {
            setIsCheckingOutFather(false);
        }
    };

    // 3. حضور وانصراف المرافق والأطفال
    const handleCompanionCheckIn = async (e) => {
        e.preventDefault();
        
        if (!companionIdInput || companionIdInput.length !== 14) {
            toast.error('يرجى إدخال الرقم القومي للمرافق المكون من 14 رقماً');
            return;
        }

        if (childrenList.length > 0 && selectedChildren.length === 0) {
            toast.error('يرجى تحديد طفل واحد على الأقل للحضور');
            return;
        }

        setIsSubmittingCompanion(true);
        try {
            if (companionIdInput !== visitationData.companionNationalId) {
                await api.patch(`/api/visit-sessions/${visitationData.id}?visitationId=${visitationData.id}`, { companionNationalId: companionIdInput });
            }

            await api.patch(`/api/visit-sessions/${visitationData.id}/check-in?visitationId=${visitationData.id}`, {
                nationalId: companionIdInput,
                attendingChildrenIds: selectedChildren
            });

            toast.success('تم حفظ بيانات وحضور المرافق والأبناء بنجاح');
            
            setVisitationData(prev => ({
                ...prev, 
                companionNationalId: companionIdInput,
                attendance: {
                    ...prev.attendance,
                    isCompanionCheckedIn: true,
                    companionCheckedInAt: getSimulatedNow().toISOString(),
                    attendedChildrenIds: selectedChildren
                }
            }));
            
        } catch (error) {
            handleBackendError(error);
        } finally {
            setIsSubmittingCompanion(false);
        }
    };

    const handleCompanionCheckOut = async (e) => {
        e.preventDefault();
        setIsCheckingOutCompanion(true);
        try {
            await api.patch(`/api/visit-sessions/${visitationData.id}/check-out?visitationId=${visitationData.id}`, { 
                nationalId: companionIdInput || visitationData.companionNationalId 
            });

            toast.success('تم تسجيل انصراف المرافق والأبناء بنجاح');
            
            setVisitationData(prev => ({
                ...prev, 
                attendance: {
                    ...prev.attendance,
                    isCompanionCheckedOut: true,
                    companionCheckedOutAt: getSimulatedNow().toISOString(),
                    areBothCheckedOut: prev.attendance?.isNonCustodialCheckedOut || false
                }
            }));
        } catch (error) {
            handleBackendError(error);
        } finally {
            setIsCheckingOutCompanion(false);
        }
    };

    const isActionDisabled = timingStatus?.type === 'error' || visitationData?.status === 'Completed';
    const att = visitationData?.attendance || {};

    return (
        <div className={`p-4 md:p-8 w-full font-sans transition-all duration-500 ease-out transform ${isPageLoaded ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`} dir="rtl">
            <div className="max-w-7xl mx-auto w-full">
                
                {/* الهيدر */}
                <header className="bg-[#1e3a8a] rounded-[2rem] p-6 md:p-8 mb-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-right">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute right-[-10%] top-[-50%] w-[400px] h-[400px] bg-white rounded-full blur-3xl"></div>
                        <div className="absolute left-[-10%] bottom-[-50%] w-[300px] h-[300px] bg-blue-400 rounded-full blur-3xl"></div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 z-10 w-full md:w-auto">
                        <div className="hidden md:flex bg-white/10 p-5 rounded-2xl border border-white/20 backdrop-blur-sm items-center justify-center">
                            <Scale size={32} />
                        </div>
                        <div>
                            <p className="text-blue-200 text-xs md:text-sm mb-1 font-medium">مرحباً بك،</p>
                            <h2 className="text-2xl md:text-3xl font-bold mb-2">{employeeName}</h2>
                            <div className="flex flex-col md:flex-row items-center gap-3 text-blue-200 text-xs font-medium bg-blue-900/30 px-3 py-1.5 rounded-lg border border-white/5 justify-center md:justify-start">
                                <span className="flex items-center gap-1"><MapPin size={12} /> {centerName}</span>
                            </div>
                        </div>
                    </div>

                    {/* ✅ تحديث الهيدر ليعرض الوقت الحي المسرّع */}
                    <div className="mt-6 md:mt-0 bg-[#2d4b9e]/80 backdrop-blur-md px-6 py-4 rounded-xl border border-blue-400/30 text-center shadow-inner z-10 w-full md:w-auto flex flex-col items-center justify-center">
                        <p className="text-xs text-blue-200 mb-1 font-bold flex items-center justify-center gap-1.5">
                            <Calendar size={13}/> التوقيت الفعلي للعمليات 
                            {sessionStorage.getItem('dev_time_offset_vision') && <span className="text-red-300 bg-red-900/30 px-1.5 rounded text-[9px] animate-pulse uppercase">(مُسرّع)</span>}
                        </p>
                        <p className="text-sm md:text-base font-bold tracking-wide mt-1" dir="rtl">
                            {simulatedTime.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xl md:text-2xl font-black tracking-widest text-blue-100 font-mono mt-0.5" dir="ltr">
                            {simulatedTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                    </div>
                </header>

                {/* قسم البحث */}
                <section className="bg-white rounded-[2rem] shadow-sm p-6 md:p-8 mb-8 border border-gray-100">
                    <div className="w-full">
                        <label className="block text-sm md:text-base font-bold text-gray-700 mb-3 mr-1 text-center md:text-right">بحث برقم الهوية للطرف غير الحاضن</label>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="أدخل الرقم القومي للبحث في الزيارات..." 
                                    className="block w-full pr-11 pl-12 py-4 h-14 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:bg-white focus:border-[#1e3a8a] outline-none transition-all font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value.replace(/\D/g, ''))}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    maxLength="14"
                                />
                                {searchTerm && (
                                    <button 
                                        onClick={clearSearch}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-gray-200/50 hover:bg-gray-200 text-gray-500 rounded-full transition-colors border-none outline-none cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <button 
                                onClick={handleSearch}
                                disabled={isSearching}
                                className="bg-[#1e3a8a] hover:bg-blue-900 text-white px-8 md:px-10 h-14 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-95 disabled:opacity-70 border-none shrink-0 cursor-pointer"
                            >
                                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'بحث'}
                            </button>
                        </div>
                    </div>
                </section>

                {/* 🚀 أداة المناقشة: Time Machine (Dev Tool) تظهر فقط بعد البحث الناجح */}
                {visitationData && (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-dashed border-indigo-200 rounded-[2rem] p-5 md:p-6 mb-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden animate-in slide-in-from-top-4">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/50 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                        
                        <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
                            <div className="bg-white p-3.5 rounded-2xl shadow-sm text-indigo-600 shrink-0">
                                <Clock className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="font-bold text-indigo-900 text-lg md:text-xl flex items-center gap-2 mb-1">
                                    أداة تسريع الوقت (Time Machine)
                                    <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Dev Tool</span>
                                </h3>
                                <p className="text-indigo-700/80 text-sm font-bold">لتسريع وقت السيرفر لاختبار حضور وانصراف الزيارة الحالية.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
                            {timeShiftState === 'none' && (
                                <button 
                                    onClick={() => handleTimeShift('start')}
                                    disabled={isShiftingTime}
                                    className="flex-1 md:flex-none px-5 py-3.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all active:scale-95 shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 outline-none border-none cursor-pointer"
                                >
                                    {isShiftingTime ? <Loader2 className="w-5 h-5 animate-spin" /> : <><FastForward className="w-5 h-5"/> التقديم لوقت الحضور</>}
                                </button>
                            )}
                            {timeShiftState === 'start' && (
                                <button 
                                    onClick={() => handleTimeShift('end')}
                                    disabled={isShiftingTime}
                                    className="flex-1 md:flex-none px-5 py-3.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition-all active:scale-95 shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 outline-none border-none cursor-pointer"
                                >
                                    {isShiftingTime ? <Loader2 className="w-5 h-5 animate-spin" /> : <><FastForward className="w-5 h-5"/> التقديم لوقت الانصراف</>}
                                </button>
                            )}
                            <button 
                                onClick={() => handleTimeShift('reset')}
                                disabled={isShiftingTime}
                                className="flex-1 md:flex-none px-5 py-3.5 bg-white border border-indigo-200 text-indigo-700 text-sm font-bold rounded-xl hover:bg-indigo-50 transition-all active:scale-95 shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 outline-none border-none cursor-pointer"
                            >
                                {isShiftingTime ? <Loader2 className="w-5 h-5 animate-spin" /> : <><RotateCcw className="w-5 h-5"/> إرجاع للوقت الأصلي</>}
                            </button>
                        </div>
                    </div>
                )}

                {/* التنبيهات والعداد الحي */}
                {timingStatus && visitationData && (
                    <div className="w-full mb-8 animate-in slide-in-from-top-4">
                        <div className={`p-4 md:p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-4 border ${
                            timingStatus.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
                            timingStatus.type === 'warning' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                            'bg-green-50 border-green-200 text-green-700'
                        }`}>
                            <div className={`p-2 rounded-xl shrink-0 mx-auto md:mx-0 ${
                                timingStatus.type === 'error' ? 'bg-red-100' :
                                timingStatus.type === 'warning' ? 'bg-orange-100' : 'bg-green-100'
                            }`}>
                                {timingStatus.type === 'error' ? <AlertTriangle className="w-6 h-6" /> : 
                                 timingStatus.type === 'warning' ? <Clock className="w-6 h-6 animate-pulse" /> : 
                                 <CheckCircle className="w-6 h-6" />}
                            </div>
                            <div className="pt-1 text-center md:text-right w-full">
                                <h4 className="font-bold text-base mb-1">
                                    {timingStatus.type === 'error' ? 'تنبيه خطأ' : 
                                     timingStatus.type === 'warning' ? 'حالة موعد الزيارة' : 
                                     'عملية ناجحة'}
                                </h4>
                                <p className="text-sm font-bold leading-relaxed opacity-90">{timingStatus.text}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* عرض النتائج */}
                {visitationData && (
                    <div className={`grid grid-cols-1 xl:grid-cols-2 gap-8 transition-opacity duration-300 ${isActionDisabled && !att.areBothCheckedOut ? 'opacity-70 grayscale-[20%]' : ''}`}>
                        
                        {/* 🟢 بطاقة الطرف غير الحاضن */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-[#1e3a8a] to-blue-400"></div>
                            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                                <div className="bg-blue-50 p-4 rounded-2xl text-[#1e3a8a]">
                                    <User size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-800">الطرف غير الحاضن</h3>
                                    <p className="text-xs md:text-sm text-gray-500 font-medium">الرقم المرجعي: {visitationData.id.split('-')[0]}</p>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col">
                                <div className="space-y-4 mb-8">
                                    <div className="bg-[#F8F9FA] p-5 rounded-2xl border border-gray-100 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 mb-1">موعد الزيارة المحدد</p>
                                            <p className="text-sm font-bold text-gray-700" dir="ltr">
                                                {new Date(visitationData.startAt).toLocaleTimeString('ar-EG', {hour: '2-digit', minute: '2-digit'})} - {new Date(visitationData.endAt).toLocaleTimeString('ar-EG', {hour: '2-digit', minute: '2-digit'})}
                                            </p>
                                        </div>
                                        <Clock className="text-[#1e3a8a] w-6 h-6 opacity-50 shrink-0" />
                                    </div>
                                    <div className="bg-[#F8F9FA] p-5 rounded-2xl border border-gray-100">
                                        <p className="text-xs font-bold text-gray-400 mb-2">الرقم القومي (المسجل بالنظام)</p>
                                        <p className="text-lg md:text-xl font-bold text-gray-800 tracking-wider font-mono truncate">{visitationData.nonCustodialNationalId || searchTerm}</p>
                                    </div>

                                    {/* شارة الحضور والانصراف */}
                                    {(att.nonCustodialCheckedInAt || att.isNonCustodialCheckedIn) && (
                                        <div className="flex flex-col gap-2 mt-4">
                                            <div className="p-4 md:p-5 border-2 border-dashed border-green-200 bg-green-50/50 rounded-2xl flex items-center justify-between">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-green-700 font-bold text-sm flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4" /> تم تسجيل الحضور
                                                    </span>
                                                    <span className="text-xs text-green-600 font-bold" dir="ltr">
                                                        {new Date(att.nonCustodialCheckedInAt).toLocaleTimeString('ar-EG')}
                                                    </span>
                                                </div>
                                            </div>

                                            {(att.nonCustodialCheckedOutAt || att.isNonCustodialCheckedOut) && (
                                                <div className="p-4 md:p-5 border-2 border-dashed border-gray-200 bg-gray-50 rounded-2xl flex items-center justify-between animate-in zoom-in-95">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-gray-700 font-bold text-sm flex items-center gap-2">
                                                            <LogOut className="w-4 h-4 text-gray-500" /> تم تسجيل الانصراف
                                                        </span>
                                                        <span className="text-xs text-gray-500 font-bold" dir="ltr">
                                                            {new Date(att.nonCustodialCheckedOutAt).toLocaleTimeString('ar-EG')}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* أزرار الإجراءات (حضور أو انصراف) */}
                                <div className="mt-auto">
                                    {!(att.nonCustodialCheckedInAt || att.isNonCustodialCheckedIn) ? (
                                        <div className="flex flex-col gap-2 w-full animate-in fade-in">
                                            {isCheckOutOpen && (
                                                <div className="flex items-center justify-center text-gray-600 font-bold text-xs bg-gray-100 py-2.5 rounded-xl border border-gray-200">
                                                    <Clock className="w-4 h-4 ml-1 opacity-70" /> انتهت الزيارة، لا يمكن تسجيل الحضور
                                                </div>
                                            )}
                                            <button 
                                                onClick={handleFatherCheckIn}
                                                disabled={isSubmittingFather || isActionDisabled || !isVisitActive || isCheckOutOpen}
                                                className="w-full bg-[#1e3a8a] hover:bg-blue-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-900/15 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:bg-gray-400 disabled:shadow-none border-none cursor-pointer"
                                            >
                                                {isSubmittingFather ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckSquare className="w-5 h-5"/> تسجيل حضور الطرف غير الحاضن</>}
                                            </button>
                                        </div>
                                    ) : !(att.nonCustodialCheckedOutAt || att.isNonCustodialCheckedOut) ? (
                                        <div className="flex flex-col gap-2 w-full animate-in fade-in">
                                            {!isCheckOutOpen && (
                                                <div className="flex items-center justify-center gap-2 text-orange-600 font-black text-xs bg-orange-50 py-2.5 rounded-xl border border-orange-100">
                                                    <Timer className="w-4 h-4 animate-pulse" /> متبقي على إمكانية الانصراف: <span className="font-mono text-sm" dir="ltr">{checkOutCountdown}</span>
                                                </div>
                                            )}
                                            <button 
                                                onClick={handleFatherCheckOut}
                                                disabled={isCheckingOutFather || !isCheckOutOpen}
                                                className={`w-full text-white py-4 rounded-xl font-bold shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 border-none cursor-pointer
                                                    ${isCheckOutOpen ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-900/15' : 'bg-gray-400 cursor-not-allowed shadow-none opacity-70'}
                                                `}
                                            >
                                                {isCheckingOutFather ? <Loader2 className="w-5 h-5 animate-spin" /> : <><LogOut className="w-5 h-5"/> تسجيل الانصراف للطرف غير الحاضن</>}
                                            </button>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        {/* 🟢 بطاقة المرافق والأبناء */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-green-600 to-emerald-400"></div>
                            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                                <div className="bg-green-50 p-4 rounded-2xl text-green-700">
                                    <FileText size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-800">المرافق والأبناء</h3>
                                    <p className="text-xs md:text-sm text-gray-500 font-medium">بيانات وتسجيل حضور الحاضن والأطفال</p>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col">
                                <div className="space-y-4 mb-8">
                                    <div className={`p-5 rounded-2xl border transition-all ${
                                        isActionDisabled ? 'bg-gray-100 border-gray-200 opacity-60' : 'bg-gray-50 border-gray-100 focus-within:ring-2 focus-within:ring-green-600'
                                    }`}>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">الرقم القومي للمرافق</label>
                                        <input 
                                            type="text" 
                                            className="w-full bg-transparent border-none text-lg md:text-xl font-bold text-gray-800 tracking-wider font-mono p-0 focus:ring-0 outline-none disabled:cursor-not-allowed"
                                            placeholder="أدخل الرقم القومي للمرافق"
                                            value={companionIdInput}
                                            onChange={(e) => setCompanionIdInput(e.target.value.replace(/\D/g, ''))}
                                            maxLength="14"
                                            disabled={!!att.companionCheckedInAt || isActionDisabled || !isVisitActive || isCheckOutOpen}
                                        />
                                    </div>

                                    {/* قائمة الأبناء التفاعلية */}
                                    {childrenList.length > 0 && (
                                        <div className="mt-4 border-t border-gray-100 pt-5">
                                            <label className="block text-xs font-bold text-gray-500 mb-3 flex items-center gap-2">
                                                <Baby className="w-4 h-4 text-green-600" /> الأطفال المرافقين (يرجى التحديد)
                                            </label>
                                            <div className="flex flex-col gap-2.5 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                                                {childrenList.map(child => {
                                                    const isSelected = selectedChildren.includes(child.id);
                                                    const isBoy = child.gender === 'Male';
                                                    const isDisabled = !!att.companionCheckedInAt || isActionDisabled || !isVisitActive || isCheckOutOpen;
                                                    
                                                    return (
                                                        <div 
                                                            key={child.id}
                                                            onClick={() => {
                                                                if (isDisabled) return;
                                                                setSelectedChildren(prev => 
                                                                    prev.includes(child.id) ? prev.filter(id => id !== child.id) : [...prev, child.id]
                                                                );
                                                            }}
                                                            className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                                                                isDisabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:shadow-sm hover:border-green-300'
                                                            } ${
                                                                isSelected ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${isBoy ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                                                                    <Baby className="w-6 h-6" />
                                                                </div>
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span className="font-bold text-gray-800 text-sm">{child.fullName.split(' ').slice(0, 3).join(' ')}</span>
                                                                    <span className="text-[10px] text-gray-500 font-bold">{child.age} سنوات - {isBoy ? 'ذكر' : 'أنثى'}</span>
                                                                </div>
                                                            </div>
                                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                                                isSelected ? 'bg-green-500 border-green-500 shadow-sm' : 'bg-white border-gray-300'
                                                            }`}>
                                                                {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* شارة الحضور والانصراف */}
                                    {(att.companionCheckedInAt || att.isCompanionCheckedIn) && (
                                        <div className="flex flex-col gap-2 mt-4">
                                            <div className="p-4 md:p-5 border-2 border-dashed border-green-200 bg-green-50/50 rounded-2xl flex items-center justify-between">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-green-700 font-bold text-sm flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4" /> تم تسجيل الحضور
                                                    </span>
                                                    <span className="text-xs text-green-600 font-bold" dir="ltr">
                                                        {new Date(att.companionCheckedInAt).toLocaleTimeString('ar-EG')}
                                                    </span>
                                                </div>
                                            </div>

                                            {(att.companionCheckedOutAt || att.isCompanionCheckedOut) && (
                                                <div className="p-4 md:p-5 border-2 border-dashed border-gray-200 bg-gray-50 rounded-2xl flex items-center justify-between animate-in zoom-in-95">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-gray-700 font-bold text-sm flex items-center gap-2">
                                                            <LogOut className="w-4 h-4 text-gray-500" /> تم تسجيل الانصراف
                                                        </span>
                                                        <span className="text-xs text-gray-500 font-bold" dir="ltr">
                                                            {new Date(att.companionCheckedOutAt).toLocaleTimeString('ar-EG')}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* أزرار الإجراءات (حضور أو انصراف) */}
                                <div className="mt-auto">
                                    {!(att.companionCheckedInAt || att.isCompanionCheckedIn) ? (
                                        <div className="flex flex-col gap-2 w-full animate-in fade-in">
                                            {isCheckOutOpen && (
                                                <div className="flex items-center justify-center text-gray-600 font-bold text-xs bg-gray-100 py-2.5 rounded-xl border border-gray-200">
                                                    <Clock className="w-4 h-4 ml-1 opacity-70" /> انتهت الزيارة، لا يمكن تسجيل الحضور
                                                </div>
                                            )}
                                            <button 
                                                onClick={handleCompanionCheckIn}
                                                disabled={isSubmittingCompanion || isActionDisabled || !isVisitActive || isCheckOutOpen}
                                                className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-900/15 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:bg-gray-400 disabled:shadow-none border-none cursor-pointer"
                                            >
                                                {isSubmittingCompanion ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckSquare className="w-5 h-5"/> حفظ وتسجيل حضور المرافق والأطفال</>}
                                            </button>
                                        </div>
                                    ) : !(att.companionCheckedOutAt || att.isCompanionCheckedOut) ? (
                                        <div className="flex flex-col gap-2 w-full animate-in fade-in">
                                            {!isCheckOutOpen && (
                                                <div className="flex items-center justify-center gap-2 text-orange-600 font-black text-xs bg-orange-50 py-2.5 rounded-xl border border-orange-100">
                                                    <Timer className="w-4 h-4 animate-pulse" /> متبقي على إمكانية الانصراف: <span className="font-mono text-sm" dir="ltr">{checkOutCountdown}</span>
                                                </div>
                                            )}
                                            <button 
                                                onClick={handleCompanionCheckOut}
                                                disabled={isCheckingOutCompanion || !isCheckOutOpen}
                                                className={`w-full text-white py-4 rounded-xl font-bold shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 border-none cursor-pointer
                                                    ${isCheckOutOpen ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-900/15' : 'bg-gray-400 cursor-not-allowed shadow-none opacity-70'}
                                                `}
                                            >
                                                {isCheckingOutCompanion ? <Loader2 className="w-5 h-5 animate-spin" /> : <><LogOut className="w-5 h-5"/> تسجيل الانصراف للمرافق والأطفال</>}
                                            </button>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        {/* 🟢 بطاقة إتمام الزيارة (تظهر فقط بعد انصراف الطرفين) */}
                        {(att.areBothCheckedOut || visitationData.completedAt || visitationData.status === 'Completed') && (
                            <div className="xl:col-span-2 bg-blue-50 border-2 border-blue-200 p-6 md:p-8 rounded-[2.5rem] flex flex-col items-center text-center animate-in slide-in-from-bottom-6 duration-500 shadow-sm">
                                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                    <CheckCircle className="text-green-500 w-10 h-10 md:w-12 md:h-12" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-blue-900 mb-2">تم اكتمال جلسة الزيارة بنجاح</h3>
                                <p className="text-blue-700 mb-6 font-bold text-sm md:text-base max-w-2xl">
                                    لقد قام كلا الطرفين بتسجيل الحضور والانصراف، وتم إغلاق وتوثيق هذه الجلسة رسمياً في سجلات المحكمة.
                                </p>
                                <div className="bg-white text-gray-700 px-6 md:px-10 py-4 md:py-5 rounded-2xl font-bold flex flex-col sm:flex-row items-center gap-4 border border-gray-200 w-full md:w-auto justify-center shadow-sm">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <User className="w-4 h-4"/> وقت انصراف الأب:
                                        <span className="font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded-md" dir="ltr">{new Date(att.nonCustodialCheckedOutAt).toLocaleTimeString('ar-EG')}</span>
                                    </div>
                                    <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <FileText className="w-4 h-4"/> وقت انصراف المرافق:
                                        <span className="font-mono text-green-600 bg-green-50 px-2 py-1 rounded-md" dir="ltr">{new Date(att.companionCheckedOutAt).toLocaleTimeString('ar-EG')}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisionDashboard;
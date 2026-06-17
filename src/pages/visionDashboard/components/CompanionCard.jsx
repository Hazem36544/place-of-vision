import React from 'react';
import { FileText, CheckCircle, LogOut, CheckSquare, Timer, Loader2, Baby, Check, Clock } from 'lucide-react';

export default function CompanionCard({
    visitationData, companionIdInput, setCompanionIdInput, childrenList, selectedChildren, setSelectedChildren,
    att, isCheckOutOpen, checkOutCountdown, isSubmittingCompanion, isCheckingOutCompanion,
    isActionDisabled, isVisitActive, handleCompanionCheckIn, handleCompanionCheckOut
}) {
    return (
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
    );
}
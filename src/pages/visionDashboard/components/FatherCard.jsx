import React from 'react';
import { User, Clock, CheckCircle, LogOut, CheckSquare, Timer, Loader2 } from 'lucide-react';

export default function FatherCard({ 
    visitationData, searchTerm, att, isCheckOutOpen, checkOutCountdown, 
    isSubmittingFather, isCheckingOutFather, isActionDisabled, isVisitActive, 
    handleFatherCheckIn, handleFatherCheckOut 
}) {
    return (
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
    );
}
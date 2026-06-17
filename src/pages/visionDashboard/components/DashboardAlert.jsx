import React from 'react';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';

export default function DashboardAlert({ timingStatus }) {
    if (!timingStatus) return null;

    return (
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
    );
}
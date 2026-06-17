import React from 'react';
import { Scale, MapPin, Calendar } from 'lucide-react';

export default function DashboardHeader({ employeeName, centerName, currentDate }) {
    return (
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

            <div className="mt-6 md:mt-0 bg-[#2d4b9e]/80 backdrop-blur-md px-6 py-4 rounded-xl border border-blue-400/30 text-center shadow-inner z-10 w-full md:w-auto">
                <p className="text-xs text-blue-200 mb-1 font-medium flex items-center justify-center gap-1"><Calendar size={12}/> تاريخ اليوم</p>
                <p className="text-base md:text-lg font-bold tracking-wide">{currentDate}</p>
            </div>
        </header>
    );
}
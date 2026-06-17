import React from 'react';
import { MapPin, LogOut, User } from 'lucide-react';

const ProfileCard = ({ displayName, displayRole, displayLocation, onLogout }) => {
    return (
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

            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm font-medium mb-8 bg-gray-50 px-4 py-2 rounded-xl w-full">
                <MapPin size={16} className="shrink-0" />
                <span className="truncate">{displayLocation}</span>
            </div>

            <div className="mt-auto w-full pt-6 border-t border-gray-100">
                <button 
                    onClick={onLogout}
                    className="w-full py-4 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all font-bold flex items-center justify-center gap-2 group outline-none border-none cursor-pointer bg-transparent"
                >
                    <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                    <span>تسجيل الخروج</span>
                </button>
            </div>
        </div>
    );
};

export default ProfileCard;
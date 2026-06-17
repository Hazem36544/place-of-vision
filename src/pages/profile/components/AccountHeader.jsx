import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ShieldCheck, User } from 'lucide-react';

const AccountHeader = () => {
    const navigate = useNavigate();

    return (
        <header className="bg-[#1e3a8a] rounded-[2rem] p-6 md:p-8 mb-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute right-[-10%] top-[-50%] w-[400px] h-[400px] bg-white rounded-full blur-3xl"></div>
                <div className="absolute left-[-10%] bottom-[-50%] w-[300px] h-[300px] bg-blue-400 rounded-full blur-3xl"></div>
            </div>

            <div className="flex items-center gap-4 md:gap-6 z-10 w-full md:w-auto">
                <button onClick={() => navigate(-1)} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition-all shadow-inner border border-white/10 shrink-0 cursor-pointer outline-none">
                    <ChevronRight size={24} className="md:w-7 md:h-7" />
                </button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">الحساب الشخصي</h1>
                    <p className="text-blue-200 text-xs md:text-sm font-medium flex items-center gap-1.5 md:gap-2">
                        <ShieldCheck size={16} className="shrink-0" />
                        إدارة بياناتك الشخصية وإعدادات الأمان
                    </p>
                </div>
            </div>

            <div className="bg-white/10 p-5 rounded-2xl border border-white/20 backdrop-blur-sm z-10 hidden md:block">
                <User size={40} strokeWidth={1.5} />
            </div>
        </header>
    );
};

export default AccountHeader;
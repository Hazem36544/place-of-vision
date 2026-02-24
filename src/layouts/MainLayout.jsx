import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
    return (
        <div className="flex h-screen bg-[#F3F4F6] font-[Cairo]" dir="rtl">
            <Sidebar />
            
            {/* Main Content Area (Offset by sidebar width) */}
            <main className="flex-1 mr-24 md:mr-64 p-8 overflow-y-auto">
                <Outlet /> {/* This is where child pages will render */}
            </main>
        </div>
    );
};

export default MainLayout;

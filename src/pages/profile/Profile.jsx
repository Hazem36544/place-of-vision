import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authAPI } from '../../services/api'; 
import { useAuth } from '../../context/AuthContext'; 
import { getErrorMessage } from '../../utils/errorHandler';

// استيراد المكونات الفرعية
import AccountHeader from './components/AccountHeader';
import ProfileCard from './components/ProfileCard';
import BasicInfo from './components/BasicInfo';
import SecurityBanner from './components/SecurityBanner';

const Profile = () => {
    const [isPageLoaded, setIsPageLoaded] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => setIsPageLoaded(true), 50);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const response = await authAPI.getCurrentUser();
                setUserData(response.data);
            } catch (error) {
                console.error("خطأ في جلب بيانات المستخدم:", error);
                toast.error(getErrorMessage(error));
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const handleLogout = () => {
        logout(); 
        navigate('/');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-[#1e3a8a] animate-spin" />
            </div>
        );
    }

    // تهيئة البيانات للعرض
    const displayName = userData?.fullName || userData?.name || 'مستخدم النظام';
    const displayRole = `موظف استقبال`; 
    const displayLocation = 'مركز رؤية معتمد'; 
    const displayPhone = userData?.phone || userData?.phoneNumber || 'غير متوفر';
    const displayEmail = userData?.email || 'غير متوفر';

    return (
        <div className="w-full font-sans" dir="rtl">
            <div className={`p-4 md:p-8 w-full transition-all duration-500 ease-out transform ${isPageLoaded ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
                <div className="max-w-7xl mx-auto w-full">
                
                    <AccountHeader />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <ProfileCard 
                            displayName={displayName} 
                            displayRole={displayRole}
                            displayLocation={displayLocation}
                            onLogout={handleLogout} 
                        />

                        <BasicInfo 
                            displayPhone={displayPhone} 
                            displayEmail={displayEmail} 
                        />
                    </div>

                    <SecurityBanner />

                </div>
            </div>
        </div>
    );
};

export default Profile;
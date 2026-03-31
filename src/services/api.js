console.log("Current API URL:", import.meta.env.VITE_API_URL);
import axios from 'axios';

/**
 * 1. الإعدادات الأساسية
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://wesal.runasp.net'; 

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

/**
 * 2. Request Interceptor: حقن التوكن (تم التعديل لمفتاح مركز الرؤية)
 */
api.interceptors.request.use(
    (config) => {
        // ✅ التعديل الدقيق: استخدام التوكن الخاص بمركز الرؤية فقط
        const token = localStorage.getItem('wesal_visitation_token');
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; 
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * 3. Response Interceptor: معالجة الأخطاء بشكل موحد (تم التعديل لتنظيف مفاتيح الرؤية)
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const skipRedirect = error.config?.skipAuthRedirect;

        // ✅ --- التقاط 403 للتوكن المقيد (الباسورد المؤقت) ---
        if (error.response && error.response.status === 403) {
            const serverError = error.response.data;
            const message = serverError?.detail || serverError?.title || "";
            
            if (message.toLowerCase().includes("temporary password")) {
                console.warn("Temporary password detected - redirecting to change password...");
                localStorage.setItem('force_change_password', 'true'); 
                
                if (!skipRedirect) {
                    window.location.href = '/'; 
                }
                return Promise.reject(error); 
            }
        }

        // ✅ --- التعامل العادي مع 401 (انتهاء صلاحية التوكن) ---
        if (error.response && error.response.status === 401) {
            console.warn("Unauthorized access - redirecting to login...");
            // ✅ تنظيف الداتا الخاصة بمركز الرؤية فقط
            localStorage.removeItem('wesal_visitation_token'); 
            localStorage.removeItem('wesal_visitation_user_data'); 
            
            if (!skipRedirect) {
                window.location.href = '/'; 
            }
        }
        
        const serverError = error.response?.data;
        if (serverError) {
            const message = serverError.detail || serverError.title || "حدث خطأ في الاتصال";
            error.message = message;
        }
        return Promise.reject(error);
    }
);

/**
 * --- [ A. خدمات الهوية - Auth ] ---
 */
export const authAPI = {
    loginVisitation: (creds) => api.post('/api/auth/visit-center-staff/sign-in', creds),
    changePassword: (data) => api.patch('/api/users/change-password', data),
    // جلب بيانات البروفايل الخاص بموظف الرؤية
    getCurrentUser: () => api.get('/api/visit-center-staffs/me')
};

/**
 * --- [ C. خدمات البيانات المساعدة - Lookups ] ---
 */
export const lookupAPI = {
    getVisitationLocations: (params) => api.get('/api/visitation-locations', { params }),
    createLocation: (data) => api.post('/api/visitation-locations', data),
    updateLocation: (id, data) => api.put(`/api/visitation-locations/${id}`, data),
    deleteLocation: (id) => api.delete(`/api/visitation-locations/${id}`),
};

/**
 * --- [ D. خدمات مركز الرؤية - Visitation Execution ] ---
 */
export const visitationAPI = {
    searchVisitations: (params) => api.get('/api/visitations', { params }),
    checkInVisitation: (id, data) => api.patch(`/api/visitations/${id}/check-in`, data),
    completeVisitation: (id) => api.patch(`/api/visitations/${id}/complete`),
    setCompanion: (id, data) => api.patch(`/api/visitations/${id}`, data),
};

/**
 * --- [ I. الإشعارات والملفات - Common ] ---
 */
export const commonAPI = {
    // الإشعارات
    getUnreadNotificationsCount: () => api.get('/api/notifications/unread-count'),
    listNotifications: (params) => api.get('/api/notifications/me', { params }),
    markAsRead: (id) => api.patch(`/api/notifications/${id}/read`),
    
    // الأجهزة
    registerDevice: (data) => api.post('/api/notifications/devices', data),
    unregisterDevice: (token) => api.delete(`/api/user-devices/${token}`),
};

export default api;
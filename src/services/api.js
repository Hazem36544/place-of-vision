import axios from 'axios';
console.log("Current API URL:", import.meta.env.VITE_API_URL);

const BASE_URL = import.meta.env.VITE_API_URL || 'http://wesal.runasp.net';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

/**
 * 2. Request Interceptor: حقن التوكن
 */
api.interceptors.request.use(
    (config) => {
        // ✅ التأكد من استخدام مفتاح الرؤية المعزول
        const token = sessionStorage.getItem('wesal_visitation_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; 
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * 3. Response Interceptor: معالجة الأخطاء والتنظيف
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const skipRedirect = error.config?.skipAuthRedirect;

        // ✅ --- التقاط 403 (الباسورد المؤقت) ---
        if (error.response && error.response.status === 403) {
            const serverError = error.response.data;
            const message = serverError?.detail || serverError?.title || "";
            
            if (message.toLowerCase().includes("temporary password") || message.includes("تغيير كلمة المرور")) {
                sessionStorage.setItem('force_change_password', 'true'); 
                
                if (!skipRedirect) {
                    // ✅ الحل: التوجيه لمسار المشروع الصحيح على GitHub Pages
                    window.location.href = import.meta.env.BASE_URL; 
                }
                return Promise.reject(error); 
            }
        }

        // ✅ --- التعامل مع 401 (انتهى التوكن) ---
        if (error.response && error.response.status === 401) {
            // تنظيف كل داتا الرؤية لضمان خروج نظيف
            sessionStorage.removeItem('wesal_visitation_token'); 
            sessionStorage.removeItem('wesal_visitation_user_data'); 
            sessionStorage.removeItem('wesal_visitation_user_role');
            
            if (!skipRedirect) {
                // ✅ الحل: التوجيه لمسار المشروع الصحيح
                window.location.href = import.meta.env.BASE_URL; 
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

export const authAPI = {
    loginVisitation: (creds) => api.post('/api/auth/visit-center-staff/sign-in', creds),
    changePassword: (data) => api.patch('/api/users/change-password', data),
    getCurrentUser: () => api.get('/api/visit-center-staff/me')
};

export const lookupAPI = {
    getVisitationLocations: (params) => api.get('/api/visit-centers', { params }),
    createLocation: (data) => api.post('/api/visit-centers', data),
    updateLocation: (id, data) => api.put(`/api/visit-centers/${id}`, data),
    deleteLocation: (id) => api.delete(`/api/visit-centers/${id}`),
};

export const visitationAPI = {
    searchVisitations: (params) => api.get('/api/visit-sessions', { params }),
    checkInVisitation: (id, data) => api.patch(`/api/visit-sessions/${id}/check-in`, data),
    completeVisitation: (id) => api.patch(`/api/visit-sessions/${id}/check-out`),
    setCompanion: (id, data) => api.patch(`/api/visit-sessions/${id}`, data),
};

export const commonAPI = {
    getUnreadNotificationsCount: () => api.get('/api/notifications/unread-count'),
    listNotifications: (params) => api.get('/api/notifications/me', { params }),
    markAsRead: (id) => api.patch(`/api/notifications/${id}/read`),
    registerDevice: (data) => api.post('/api/notifications/devices', data),
    unregisterDevice: (token) => api.delete(`/api/user-devices/${token}`),
};

export default api;
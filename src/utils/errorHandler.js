// src/utils/errorHandler.js

export const getErrorMessage = (error) => {
    // 1. التأكد من وجود اتصال بالسيرفر (سقوط السيرفر أو انقطاع الإنترنت)
    if (!error.response || error.code === 'ERR_NETWORK') {
        return "تعذر الاتصال بالخادم، يرجى التحقق من اتصالك بالإنترنت أو حالة الخادم.";
    }

    const { status, data } = error.response;

    // 2. تجميع نصوص الخطأ للبحث عن الرسائل الإنجليزية الثابتة (Identity & Domain Logic)
    const errorText = String(
        data?.detail || data?.title || data?.message || (typeof data === 'string' ? data : "")
    ).toLowerCase();

    // --- أخطاء تسجيل الدخول ---
    if (errorText.includes("credentials are invalid") || errorText.includes("invalid credentials")) {
        return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
    }
    if (errorText.includes("locked out") || errorText.includes("lockout")) {
        return "تم قفل الحساب مؤقتاً لكثرة المحاولات الخاطئة، يرجى المحاولة لاحقاً.";
    }
    if (errorText.includes("temporary password") || errorText.includes("change password")) {
        return "يجب تأمين حسابك بكلمة مرور جديدة قبل الدخول.";
    }

    // --- أخطاء مركز الرؤية (توقعات Business Logic) ---
    if (errorText.includes("already checked in") || errorText.includes("already checked-in")) {
        return "تم تسجيل الحضور لهذا الشخص مسبقاً.";
    }
    if (errorText.includes("already completed") || errorText.includes("is completed")) {
        return "هذه الزيارة مكتملة بالفعل ولا يمكن التعديل عليها.";
    }
    if (errorText.includes("invalid national id") || errorText.includes("nationalid mismatch") || errorText.includes("not match")) {
        return "الرقم القومي المدخل غير متطابق مع بيانات الزيارة.";
    }

    // 3. قراءة رسائل الخطأ التفصيلية من الباك إند (Validation Errors من FluentValidation)
    if (data) {
        if (data.errors && typeof data.errors === 'object') {
            const firstErrorKey = Object.keys(data.errors)[0];
            if (Array.isArray(data.errors[firstErrorKey]) && data.errors[firstErrorKey].length > 0) {
                return data.errors[firstErrorKey][0]; 
            }
        }
    }

    // 4. معالجة أكواد الخطأ الأساسية (Fallbacks)
    // في حالة 400، نعطي الأولوية لرسالة الباك إند لو موجودة لأنها غالباً فيها سبب الرفض
    if (status === 400) return data?.detail || data?.title || "بيانات غير صالحة، يرجى مراجعة المدخلات.";
    if (status === 401) return "الجلسة انتهت أو بيانات الدخول غير صحيحة.";
    if (status === 403) return "لا تملك الصلاحيات الكافية لإجراء هذه العملية، أو أن العملية غير مسموحة حالياً.";
    if (status === 404) return "البيانات المطلوبة غير موجودة في النظام.";
    if (status === 409) return "يوجد تعارض: هذه البيانات مسجلة بالفعل، أو حالة الزيارة تمنع هذا الإجراء.";

    // 5. عرض الرسالة المخصصة من الباك إند (لو لم يتم اصطيادها في الشروط السابقة)
    if (data?.detail) return data.detail;
    if (data?.title) return data.title;

    // 6. رسالة افتراضية لأي خطأ غير معروف
    return "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.";
};
import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api, { authAPI } from "../services/api";
import { toast } from "react-hot-toast";

const VisionLogin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("login"); // 'login' or 'change_password'

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // حالات تغيير الباسورد
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // التقاط أمر التغيير الإجباري إن وجد من زيارة سابقة
  useEffect(() => {
    if (localStorage.getItem("force_change_password") === "true") {
      setStep("change_password");
      setPassword("");
      setError("يرجى تغيير كلمة المرور المؤقتة قبل الدخول للنظام");
    }
  }, []);

  // =========================================================================
  // 1. تسجيل الدخول + الاختبار المخفي (Pre-flight Check)
  // =========================================================================
  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!email || !password) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // الخطوة 1: إرسال طلب تسجيل الدخول
      const response = await authAPI.loginVisitation({ email, password });
      const token = response.data?.token || response.data?.accessToken;

      if (token) {
        // الخطوة 2: حفظ التوكن
        localStorage.setItem("wesal_token", token);
        localStorage.setItem("wesal_user_role", "visitation_center");

        // الخطوة 3: الاختبار المخفي للتوكن المقيد
        try {
          await api.get("/api/visitations?PageNumber=1&PageSize=1", {
            skipAuthRedirect: true,
          });

          // إذا نجح الطلب -> التوكن كامل الصلاحيات
          toast.success("تم تسجيل الدخول بنجاح");
          navigate("/dashboard");
        } catch (pingErr) {
          // إذا فشل الطلب بـ 403 -> التوكن مقيد (كلمة مرور مؤقتة)
          if (pingErr.response?.status === 403) {
            setStep("change_password");
            setError("يرجى تأمين حسابك بكلمة مرور جديدة قبل الدخول للداشبورد.");
            toast("يجب تأمين حسابك بكلمة مرور جديدة أولاً", {
              icon: "🔒",
              duration: 4000,
            });
          } else {
            // أي خطأ آخر، ننتقل للداشبورد وهي تعالجه
            toast.success("تم تسجيل الدخول بنجاح");
            navigate("/dashboard");
          }
        }
      } else {
        throw new Error("لم يتم العثور على رمز المصادقة");
      }
    } catch (err) {
      console.error("Login Error:", err);
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.title ||
        "بيانات الدخول غير صحيحة.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // 2. تغيير كلمة المرور الإجبارية
  // =========================================================================
  const handleChangePassword = async (e) => {
    if (e) e.preventDefault();

    if (!password || !newPassword || !confirmPassword) {
      setError("يرجى تعبئة جميع الحقول");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    if (newPassword.length < 6) {
      setError("يجب أن تتكون كلمة المرور من 6 خانات على الأقل");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // تغيير كلمة المرور
      await api.patch("/api/users/change-password", {
        oldPassword: password,
        newPassword: newPassword,
      });

      // التعديل هنا: رسالة نجاح، مسح البيانات المؤقتة، والرجوع للوجين
      toast.success(
        "تم تغيير كلمة المرور بنجاح! يرجى تسجيل الدخول بالكلمة الجديدة.",
      );
      localStorage.removeItem("force_change_password");
      localStorage.removeItem("wesal_token");

      setStep("login");
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError(null);
    } catch (err) {
      console.error("Change Password Error:", err.response?.data);
      const validationErrors = err.response?.data?.errors;
      let errorMessage = "فشل في تغيير كلمة المرور.";

      if (validationErrors) {
        if (Array.isArray(validationErrors)) {
          errorMessage = validationErrors
            .map((item) => item.description || "كلمة المرور لا تطابق الشروط")
            .join(" - ");
        } else {
          errorMessage = Object.values(validationErrors).flat().join(" - ");
        }
      } else {
        errorMessage =
          err.response?.data?.detail ||
          err.response?.data?.title ||
          errorMessage;
      }

      setError(errorMessage);
      if (err.response?.status === 400) {
        toast.error("يرجى التأكد من صحة كلمة المرور المؤقتة.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 w-full h-full bg-[#F3F4F6] flex flex-col items-center justify-center font-sans overflow-hidden"
      dir="rtl"
    >
      <div className="w-full max-w-lg px-4 flex flex-col items-center relative z-10">
        {/* منطقة الشعار */}
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="mb-4 relative">
            <div className="absolute -inset-4 bg-blue-100/50 rounded-full blur-xl animate-pulse"></div>
            {/* 🚀 التعديل هنا: استخدام المسار السليم للوجو وإيقاف اللوب اللانهائي */}
            <img
              src={`${import.meta.env.BASE_URL}logo.svg`}
              alt="شعار وصال"
              className="w-28 h-auto mx-auto hover:scale-105 transition-transform duration-300 drop-shadow-sm relative z-10"
              onError={(e) => {
                e.target.onerror = null; // يمنع اللوب
                e.target.src = "https://placehold.co/128x128/png?text=Wisal";
              }}
            />
          </div>
          <h1 className="text-3xl font-bold text-[#1e3a8a] mb-1">
            نظام إدارة مكان الرؤية
          </h1>
          <p className="text-gray-500 font-medium text-lg">لم الشمل</p>
        </div>

        {/* شاشة تسجيل الدخول */}
        {step === "login" && (
          <div className="bg-white rounded-[2rem] shadow-xl w-full p-8 md:p-10 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              تسجيل الدخول
            </h2>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 flex items-start gap-2 text-sm border border-red-100">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  البريد الإلكتروني للمركز
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  className="block w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all outline-none"
                  placeholder="admin@center.com"
                  dir="ltr"
                  style={{ textAlign: "right" }}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    className="block w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all outline-none pl-12 font-mono text-lg"
                    placeholder="أدخل كلمة المرور"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1e3a8a] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center hover:bg-[#172554] transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] disabled:opacity-70 mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin ml-2" /> جاري
                    الدخول...
                  </>
                ) : (
                  "تسجيل الدخول"
                )}
              </button>
            </form>

            <div className="mt-5 text-center">
              <a
                href="#"
                className="text-[#1e3a8a] font-bold text-sm hover:underline"
              >
                نسيت كلمة المرور؟
              </a>
            </div>
          </div>
        )}

        {/* شاشة تغيير كلمة المرور */}
        {step === "change_password" && (
          <div className="bg-white rounded-[2rem] shadow-2xl w-full p-8 md:p-10 border border-blue-100 relative overflow-hidden animate-in zoom-in duration-300">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 to-[#1e3a8a]"></div>

            <div className="flex flex-col items-center mb-8 mt-2">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-[#1e3a8a]">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-center text-gray-800 mb-2">
                تأمين الحساب
              </h2>
              <p className="text-center text-gray-500 text-sm leading-relaxed">
                يرجى تغيير كلمة المرور المؤقتة الخاصة بمركز الرؤية لضمان سرية
                البيانات.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-start gap-2 text-sm border border-red-100">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="font-medium leading-relaxed">{error}</p>
                </div>
              )}

              <div>
                <label className="block mb-2 text-gray-700 font-bold text-sm">
                  كلمة المرور المؤقتة (الحالية)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="••••••••"
                    className="w-full text-right pr-4 pl-12 h-14 bg-gray-50 border border-gray-200 focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20 rounded-xl transition-all outline-none font-mono text-lg tracking-widest"
                    dir="ltr"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1e3a8a]"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-gray-700 font-bold text-sm">
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="••••••••"
                    className="w-full text-right pr-4 pl-12 h-14 bg-gray-50 border border-gray-200 focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20 rounded-xl transition-all outline-none font-mono text-lg tracking-widest"
                    dir="ltr"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1e3a8a]"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-gray-700 font-bold text-sm">
                  تأكيد كلمة المرور الجديدة
                </label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="••••••••"
                  className="w-full text-right px-4 h-14 bg-gray-50 border border-gray-200 focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20 rounded-xl transition-all outline-none font-mono text-lg tracking-widest"
                  dir="ltr"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 text-lg font-bold rounded-xl mt-8 flex items-center justify-center gap-2 bg-[#1e3a8a] text-white hover:bg-blue-800 shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" /> جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" /> حفظ وتأمين الحساب
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* الفوتر */}
        <div className="mt-8 text-center opacity-80">
          <div className="bg-white/50 backdrop-blur-sm py-2 px-6 rounded-full inline-block border border-white/60">
            <p className="text-gray-500 text-xs font-semibold">
              نظام آمن ومعتمد من وزارة العدل - مشروع وصال
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisionLogin;
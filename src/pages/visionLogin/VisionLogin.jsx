import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import api, { authAPI } from "../../services/api";

// 1. استدعاء useAuth من الكونتكست
import { useAuth } from "../../context/AuthContext";
// 2. استدعاء دالة معالجة الأخطاء السحرية
import { getErrorMessage } from "../../utils/errorHandler";

// دالة لفك تشفير التوكن بأمان
const parseJwtSafely = (token) => {
  try {
    let base64Url = token.split(".")[1];
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) { base64 += "="; }
    return JSON.parse(atob(base64));
  } catch (e) {
    console.error("Error reading token safely", e);
    return null;
  }
};

export default function VisionLogin({ onLogin }) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formErrors, setFormErrors] = useState({});

  // الحيلة السحرية للقضاء على Autofill
  const [emailFieldName] = useState(() => 'eml_' + Math.random().toString(36).substring(2, 9));
  const [pwdFieldName] = useState(() => 'pwd_' + Math.random().toString(36).substring(2, 9));

  // =========================================================================
  // التنظيف الذكي والتقاط أمر التغيير الإجباري
  // =========================================================================
  useEffect(() => {
    if (sessionStorage.getItem("force_change_password") === "true") {
      setStep("change_password");
      setPassword("");
      setError("يرجى تغيير كلمة المرور المؤقتة قبل الدخول إلى النظام");
    } else {
      sessionStorage.removeItem("wesal_visitation_token");
      sessionStorage.removeItem("temp_visitation_token"); // ✅ مسح التوكن المؤقت لمنع الريلود الخاطئ
      sessionStorage.removeItem("wesal_visitation_user_role");
      sessionStorage.removeItem("wesal_visitation_user_data");
    }
  }, []);

  // ✅ دالة التحقق لحقول تسجيل الدخول
  const validateLoginForm = () => {
    let errors = {};
    let isValid = true;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email.trim() || !emailRegex.test(email)) {
      errors.email = "يرجى إدخال بريد إلكتروني صحيح للمركز";
      isValid = false;
    }
    
    if (!password.trim()) {
      errors.password = "يرجى إدخال كلمة المرور";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // =========================================================================
  // 1. تسجيل الدخول والتأكد من التوكن
  // =========================================================================
  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateLoginForm()) {
        return;
    }

    setIsLoading(true);
    setError("");
    setFormErrors({});

    sessionStorage.removeItem("wesal_visitation_token");
    sessionStorage.removeItem("temp_visitation_token");
    sessionStorage.removeItem("force_change_password");

    try {
      console.log("Attempting visitation center login...");
      const response = await authAPI.loginVisitation({
        email: email.trim(),
        password: password.trim(),
      });

      if (response.data && response.data.token) {
        const token = response.data.token;
        
        let isTempPassword = false;
        let decodedToken = null;
        try {
          decodedToken = parseJwtSafely(token);
          const tmpFlag = decodedToken?.tmp_pwd || decodedToken?.temporaryPassword || decodedToken?.IsTemporaryPassword;
          if (String(tmpFlag).toLowerCase() === "true" || tmpFlag === true) {
            isTempPassword = true;
          }
        } catch (e) {
          console.error("Error reading token safely", e);
        }

        if (isTempPassword) {
          console.log("Temporary password, redirecting to change screen...");
          
          sessionStorage.setItem("temp_visitation_token", token);
          sessionStorage.setItem("force_change_password", "true");
          
          setStep("change_password");
          toast("يجب عليك تأمين حسابك بكلمة مرور جديدة قبل الدخول", { icon: "🔒", duration: 4000 });
        } else {
          console.log("Login successful");
          
          const userDataToSave = {
            id: decodedToken?.nameid || decodedToken?.sub || decodedToken?.jti,
            email: decodedToken?.email || email,
            name: decodedToken?.unique_name || decodedToken?.name || 'موظف الرؤية',
            role: 'visitation_center'
          };
          
          login(userDataToSave, token); 
          
          if (onLogin) onLogin(response.data);
          
          toast.success("تم تسجيل الدخول بنجاح!");
          navigate("/dashboard"); 
        }
      }
    } catch (err) {
      console.error("Login Error:", err);
      sessionStorage.removeItem("force_change_password");
      sessionStorage.removeItem("wesal_visitation_token");
      sessionStorage.removeItem("temp_visitation_token");

      const status = err.response?.status;
      const errorMsg = String(
        err.response?.data?.detail || 
        err.response?.data?.title || 
        err.response?.data?.message || 
        err.response?.data || 
        ""
      ).toLowerCase();

      if (
        status === 403 &&
        (errorMsg.includes("temporary password") || errorMsg.includes("change password") || errorMsg.includes("تغيير كلمة المرور"))
      ) {
        setStep("change_password");
        setError("");
        toast("يجب عليك تأمين حسابك بكلمة مرور جديدة قبل الدخول", { icon: "🔒", duration: 4000 });
      } 
      else if (status === 404) {
        setError("بيانات المركز غير مسجلة في النظام");
      }
      else {
        setError(getErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ دالة التحقق لحقول تغيير كلمة المرور
  const validatePasswordChange = () => {
    let errors = {};
    let isValid = true;
    
    if (!password.trim()) { errors.currentPassword = "يرجى إدخال كلمة المرور الحالية"; isValid = false; }
    if (!newPassword.trim() || newPassword.length < 6) { errors.newPassword = "يجب أن تتكون كلمة المرور من 6 خانات على الأقل"; isValid = false; }
    if (!confirmPassword.trim() || newPassword !== confirmPassword) { errors.confirmPassword = "كلمتا المرور غير متطابقتين"; isValid = false; }

    setFormErrors(errors);
    return isValid;
  };

  // =========================================================================
  // 2. تغيير كلمة المرور الإجبارية
  // =========================================================================
  const handleChangePassword = async (e) => {
    if (e) e.preventDefault();

    if (!validatePasswordChange()) {
        return;
    }

    setIsLoading(true);
    setError("");
    setFormErrors({});

    const tempToken = sessionStorage.getItem("temp_visitation_token");
    if (tempToken) {
      sessionStorage.setItem("wesal_visitation_token", tempToken);
    }

    try {
      await api.patch("/api/users/change-password", {
        oldPassword: password,
        newPassword: newPassword,
      });

      toast.success("تم تأمين الحساب وتغيير كلمة المرور بنجاح! يرجى تسجيل الدخول.");

      sessionStorage.removeItem("force_change_password");
      sessionStorage.removeItem("wesal_visitation_token");
      sessionStorage.removeItem("temp_visitation_token");

      setStep("success_transition");

      setTimeout(() => {
        // ✅ تم إزالة navigate لحماية الـ State الخاصة بالإيميل ليظل مكتوباً
        setStep("login");
        setPassword(""); // يمسح الباسورد القديم فقط
        setNewPassword(""); // يمسح الجديد
        setConfirmPassword(""); // يمسح التأكيد
      }, 2000);
    } catch (err) {
      console.error("Change Password Error Details:", err);
      sessionStorage.removeItem("wesal_visitation_token"); 
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      step === 'login' ? handleLoginSubmit(e) : handleChangePassword(e);
    }
  };

  const handleInputChange = (setter, fieldName) => (e) => {
    setter(e.target.value);
    if (formErrors[fieldName]) {
        setFormErrors(prev => ({...prev, [fieldName]: null}));
    }
  };

  return (
    <div
      className="h-screen w-full overflow-y-auto"
      dir="rtl"
      style={{ fontFamily: '"Times New Roman", "Traditional Arabic", serif', background: '#F5F5F5' }}
    >
      <div className="flex min-h-full w-full justify-center px-4 py-10">
        
        <div className="w-full max-w-[460px] my-auto">
          
          {/* Logo Section */}
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32">
              <img
                src={`${import.meta.env.BASE_URL}logo.svg`}
                alt="Wesal Logo"
                className="w-full h-full object-contain"
                onError={(e) => { e.target.src = 'https://placehold.co/128x128/png?text=Wisal'; }}
              />
            </div>
          </div>

          {/* Title Section */}
          <div className="text-center mb-3">
            <h1 className="text-3xl font-black text-[#2c3e50] mb-2 tracking-tight">نظام إدارة مكان الرؤية</h1>
            <p className="text-sm font-bold text-[#95a5a6] tracking-wider">بوابة وصال - لم الشمل</p>
          </div>

          {/* Regular Login Screen */}
          {step === "login" && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 animate-in fade-in duration-500">
              <h2 className="text-xl font-bold mb-8 text-center text-[#2c3e50]">تسجيل الدخول</h2>

              <div className="space-y-6">
                
                <div style={{ position: 'absolute', opacity: 0, zIndex: -1, width: '1px', height: '1px', overflow: 'hidden' }} aria-hidden="true">
                  <input type="text" name="chrome_trap_vision_user" autoComplete="username" tabIndex={-1} />
                  <input type="password" name="chrome_trap_vision_pass" autoComplete="current-password" tabIndex={-1} />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center font-bold flex items-center gap-2 justify-center">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="relative">
                  <label className="block mb-2 text-[#2c3e50] font-bold text-sm text-right">
                    البريد الإلكتروني للمركز
                  </label>
                  <input
                    type="text"
                    name={emailFieldName}
                    autoComplete="off"
                    value={email}
                    onChange={handleInputChange(setEmail, 'email')}
                    placeholder="admin@center.com"
                    className={`w-full h-12 px-4 text-sm rounded-lg text-right outline-none transition-all font-mono border
                      ${formErrors.email ? 'border-red-400 bg-red-50 focus:ring-1 focus:ring-red-400' : 'bg-[#F8F9FA] border-[#E1E8ED] focus:border-[#2c5aa0] focus:ring-1 focus:ring-[#2c5aa0]'}
                    `}
                    dir="ltr"
                    disabled={isLoading}
                    onKeyDown={handleKeyPress}
                  />
                  {formErrors.email && <p className="absolute -bottom-5 right-0 text-red-500 text-[11px] font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {formErrors.email}</p>}
                </div>

                <div className="relative">
                  <label className="block mb-2 text-[#2c3e50] font-bold text-sm text-right">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name={pwdFieldName}
                      autoComplete="off"
                      value={password}
                      onChange={handleInputChange(setPassword, 'password')}
                      placeholder="أدخل كلمة المرور"
                      style={{ WebkitTextSecurity: showPassword ? 'none' : 'disc' }}
                      className={`w-full h-12 pr-4 pl-12 text-sm rounded-lg text-right outline-none transition-all font-mono border
                        ${formErrors.password ? 'border-red-400 bg-red-50 focus:ring-1 focus:ring-red-400' : 'bg-[#F8F9FA] border-[#E1E8ED] focus:border-[#2c5aa0] focus:ring-1 focus:ring-[#2c5aa0]'}
                      `}
                      dir="ltr"
                      disabled={isLoading}
                      onKeyDown={handleKeyPress}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#95a5a6] hover:text-[#2c3e50] transition-colors focus:outline-none border-none bg-transparent cursor-pointer"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formErrors.password && <p className="absolute -bottom-5 right-0 text-red-500 text-[11px] font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {formErrors.password}</p>}
                </div>

                <button
                  type="button"
                  onClick={handleLoginSubmit}
                  disabled={isLoading}
                  className="w-full h-12 text-base font-bold rounded-lg mt-8 flex items-center justify-center gap-2 border-none transition-all text-white"
                  style={{ background: isLoading ? '#95a5a6' : '#2c5aa0', cursor: isLoading ? 'not-allowed' : 'pointer' }}
                >
                  {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> جاري تسجيل الدخول...</> : "تسجيل الدخول"}
                </button>
              </div>
            </div>
          )}

          {/* Forced Change Password Screen */}
          {step === "change_password" && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 relative overflow-hidden border-t-4 animate-in zoom-in-95 duration-300" style={{ borderColor: '#2c5aa0' }}>
              <div className="flex flex-col items-center mb-6 mt-2">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: '#eef2f7', color: '#2c5aa0' }}>
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold text-[#2c3e50] mb-2 text-center">تأمين الحساب</h2>
                <p className="text-center text-[#95a5a6] text-sm font-bold">
                  يرجى تغيير كلمة المرور المؤقتة الخاصة بمركز الرؤية لضمان سرية البيانات.
                </p>
              </div>

              <div className="space-y-6">
                
                <div style={{ position: 'absolute', opacity: 0, zIndex: -1, width: '1px', height: '1px', overflow: 'hidden' }} aria-hidden="true">
                  <input type="password" name="fake_vision_pwd" autoComplete="current-password" tabIndex="-1" />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center font-bold flex items-center gap-2 justify-center">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="relative">
                  <label className="block mb-2 text-[#2c3e50] font-bold text-sm text-right">
                    كلمة المرور المؤقتة (الحالية)
                  </label>
                  <div className="relative">
                    <input
                      type="text" 
                      name="ws_curr_pass"
                      autoComplete="off"
                      value={password}
                      onChange={handleInputChange(setPassword, 'currentPassword')}
                      placeholder="••••••••"
                      style={{ WebkitTextSecurity: showPassword ? 'none' : 'disc' }}
                      className={`w-full h-12 pr-4 pl-12 text-sm rounded-lg text-right outline-none transition-all font-mono tracking-widest border
                        ${formErrors.currentPassword ? 'border-red-400 bg-red-50 focus:ring-1 focus:ring-red-400' : 'bg-[#F8F9FA] border-[#E1E8ED] focus:border-[#2c5aa0] focus:ring-1 focus:ring-[#2c5aa0]'}
                      `}
                      dir="ltr"
                      disabled={isLoading}
                      onKeyDown={handleKeyPress}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#95a5a6] hover:text-[#2c3e50] transition-colors focus:outline-none border-none bg-transparent cursor-pointer"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formErrors.currentPassword && <p className="absolute -bottom-5 right-0 text-red-500 text-[11px] font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {formErrors.currentPassword}</p>}
                </div>

                <div className="relative">
                  <label className="block mb-2 text-[#2c3e50] font-bold text-sm text-right">
                    كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <input
                      type="text" 
                      name="ws_new_pass"
                      autoComplete="off"
                      value={newPassword}
                      onChange={handleInputChange(setNewPassword, 'newPassword')}
                      placeholder="••••••••"
                      style={{ WebkitTextSecurity: showNewPassword ? 'none' : 'disc' }}
                      className={`w-full h-12 pr-4 pl-12 text-sm rounded-lg text-right outline-none transition-all font-mono tracking-widest border
                        ${formErrors.newPassword ? 'border-red-400 bg-red-50 focus:ring-1 focus:ring-red-400' : 'bg-[#F8F9FA] border-[#E1E8ED] focus:border-[#2c5aa0] focus:ring-1 focus:ring-[#2c5aa0]'}
                      `}
                      dir="ltr"
                      disabled={isLoading}
                      onKeyDown={handleKeyPress}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#95a5a6] hover:text-[#2c3e50] transition-colors focus:outline-none border-none bg-transparent cursor-pointer"
                      disabled={isLoading}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formErrors.newPassword && <p className="absolute -bottom-5 right-0 text-red-500 text-[11px] font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {formErrors.newPassword}</p>}
                </div>

                <div className="relative">
                  <label className="block mb-2 text-[#2c3e50] font-bold text-sm text-right">
                    تأكيد كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <input
                      type="text" 
                      name="ws_conf_pass"
                      autoComplete="off"
                      value={confirmPassword}
                      onChange={handleInputChange(setConfirmPassword, 'confirmPassword')}
                      placeholder="••••••••"
                      style={{ WebkitTextSecurity: showNewPassword ? 'none' : 'disc' }}
                      className={`w-full h-12 px-4 text-sm rounded-lg text-right outline-none transition-all font-mono tracking-widest border
                        ${formErrors.confirmPassword ? 'border-red-400 bg-red-50 focus:ring-1 focus:ring-red-400' : 'bg-[#F8F9FA] border-[#E1E8ED] focus:border-[#2c5aa0] focus:ring-1 focus:ring-[#2c5aa0]'}
                      `}
                      dir="ltr"
                      disabled={isLoading}
                      onKeyDown={handleKeyPress}
                    />
                  </div>
                  {formErrors.confirmPassword && <p className="absolute -bottom-5 right-0 text-red-500 text-[11px] font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {formErrors.confirmPassword}</p>}
                </div>

                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={isLoading || !password || !newPassword || !confirmPassword}
                  className="w-full h-12 text-base font-bold rounded-lg mt-8 flex items-center justify-center gap-2 border-none transition-all text-white"
                  style={{
                    background: (isLoading || !password || !newPassword || !confirmPassword) ? '#95a5a6' : '#2c5aa0',
                    cursor: (isLoading || !password || !newPassword || !confirmPassword) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> جاري التحديث...</>
                  ) : (
                    <><Lock className="w-4 h-4" /> حفظ وتأمين الحساب</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ✅ 3. شاشة التحويل بعد النجاح */}
          {step === 'success_transition' && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 flex flex-col items-center justify-center min-h-[400px] animate-in zoom-in duration-300 border-t-4 border-green-500">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-[#2c3e50] mb-3 text-center">تم تأمين الحساب بنجاح!</h2>
              <p className="text-[#95a5a6] text-sm font-bold text-center mb-8 px-4 leading-relaxed">
                تم تحديث كلمة المرور الخاصة بالمركز، سيتم تحويلك الآن لتسجيل الدخول.
              </p>
              <div className="flex items-center gap-3 text-[#2c5aa0] font-bold">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري تحويلك...</span>
              </div>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-[#95a5a6] font-bold">
              آمن ومعتمد من قبل وزارة العدل
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
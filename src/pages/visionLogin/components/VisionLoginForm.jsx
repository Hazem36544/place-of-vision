import React from 'react';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

const VisionLoginForm = ({
  email, setEmail, password, setPassword,
  showPassword, setShowPassword, isLoading, error, formErrors,
  handleInputChange, handleKeyPress, handleLoginSubmit,
  emailFieldName, pwdFieldName
}) => (
  <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 animate-in fade-in duration-500">
    <h2 className="text-xl font-bold mb-8 text-center text-[#2c3e50]" style={{ fontFamily: '"Times New Roman", "Traditional Arabic", serif' }}>تسجيل الدخول</h2>

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
        <label className="block mb-2 text-[#2c3e50] font-bold text-sm text-right" style={{ fontFamily: '"Times New Roman", "Traditional Arabic", serif' }}>البريد الإلكتروني للمركز</label>
        <input
          type="text" name={emailFieldName} autoComplete="off" value={email}
          onChange={handleInputChange(setEmail, 'email')} placeholder="admin@center.com"
          className={`w-full h-12 px-4 text-sm rounded-lg text-right outline-none transition-all font-mono border ${formErrors.email ? 'border-red-400 bg-red-50 focus:ring-1 focus:ring-red-400' : 'bg-[#F8F9FA] border-[#E1E8ED] focus:border-[#2c5aa0] focus:ring-1 focus:ring-[#2c5aa0]'}`}
          dir="ltr" disabled={isLoading} onKeyDown={handleKeyPress}
        />
        {formErrors.email && <p className="absolute -bottom-5 right-0 text-red-500 text-[11px] font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {formErrors.email}</p>}
      </div>

      <div className="relative">
        <label className="block mb-2 text-[#2c3e50] font-bold text-sm text-right" style={{ fontFamily: '"Times New Roman", "Traditional Arabic", serif' }}>كلمة المرور</label>
        <div className="relative">
          <input
            type="text" name={pwdFieldName} autoComplete="off" value={password}
            onChange={handleInputChange(setPassword, 'password')} placeholder="أدخل كلمة المرور"
            style={{ WebkitTextSecurity: showPassword ? 'none' : 'disc' }}
            className={`w-full h-12 pr-4 pl-12 text-sm rounded-lg text-right outline-none transition-all font-mono border ${formErrors.password ? 'border-red-400 bg-red-50 focus:ring-1 focus:ring-red-400' : 'bg-[#F8F9FA] border-[#E1E8ED] focus:border-[#2c5aa0] focus:ring-1 focus:ring-[#2c5aa0]'}`}
            dir="ltr" disabled={isLoading} onKeyDown={handleKeyPress}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#95a5a6] hover:text-[#2c3e50] transition-colors focus:outline-none border-none bg-transparent cursor-pointer" disabled={isLoading}>
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {formErrors.password && <p className="absolute -bottom-5 right-0 text-red-500 text-[11px] font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {formErrors.password}</p>}
      </div>

      <button
        type="button" onClick={handleLoginSubmit} disabled={isLoading}
        className="w-full h-12 text-base font-bold rounded-lg mt-8 flex items-center justify-center gap-2 border-none transition-all text-white"
        style={{ background: isLoading ? '#95a5a6' : '#2c5aa0', cursor: isLoading ? 'not-allowed' : 'pointer', fontFamily: '"Times New Roman", "Traditional Arabic", serif' }}
      >
        {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> جاري تسجيل الدخول...</> : "تسجيل الدخول"}
      </button>
    </div>
  </div>
);

export default VisionLoginForm;
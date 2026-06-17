import React from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

const VisionSuccessTransition = () => (
  <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 flex flex-col items-center justify-center min-h-[400px] animate-in zoom-in duration-300 border-t-4 border-green-500">
    <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
      <CheckCircle className="w-10 h-10" />
    </div>
    <h2 className="text-2xl font-bold text-[#2c3e50] mb-3 text-center" style={{ fontFamily: '"Times New Roman", "Traditional Arabic", serif' }}>تم تأمين الحساب بنجاح!</h2>
    <p className="text-[#95a5a6] text-sm font-bold text-center mb-8 px-4 leading-relaxed" style={{ fontFamily: '"Times New Roman", "Traditional Arabic", serif' }}>
      تم تحديث كلمة المرور الخاصة بالمركز، سيتم تحويلك الآن لتسجيل الدخول.
    </p>
    <div className="flex items-center gap-3 text-[#2c5aa0] font-bold" style={{ fontFamily: '"Times New Roman", "Traditional Arabic", serif' }}>
      <Loader2 className="w-5 h-5 animate-spin" />
      <span>جاري تحويلك...</span>
    </div>
  </div>
);

export default VisionSuccessTransition;
import React from 'react';
import { CheckCircle, User, FileText } from 'lucide-react';

export default function CompletionCard({ att, visitationData }) {
    if (!(att.areBothCheckedOut || visitationData.completedAt || visitationData.status === 'Completed')) {
        return null;
    }

    return (
        <div className="xl:col-span-2 bg-blue-50 border-2 border-blue-200 p-6 md:p-8 rounded-[2.5rem] flex flex-col items-center text-center animate-in slide-in-from-bottom-6 duration-500 shadow-sm">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <CheckCircle className="text-green-500 w-10 h-10 md:w-12 md:h-12" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-blue-900 mb-2">تم اكتمال جلسة الزيارة بنجاح</h3>
            <p className="text-blue-700 mb-6 font-bold text-sm md:text-base max-w-2xl">
                لقد قام كلا الطرفين بتسجيل الحضور والانصراف، وتم إغلاق وتوثيق هذه الجلسة رسمياً في سجلات المحكمة.
            </p>
            <div className="bg-white text-gray-700 px-6 md:px-10 py-4 md:py-5 rounded-2xl font-bold flex flex-col sm:flex-row items-center gap-4 border border-gray-200 w-full md:w-auto justify-center shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User className="w-4 h-4"/> وقت انصراف الأب:
                    <span className="font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded-md" dir="ltr">{new Date(att.nonCustodialCheckedOutAt).toLocaleTimeString('ar-EG')}</span>
                </div>
                <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FileText className="w-4 h-4"/> وقت انصراف المرافق:
                    <span className="font-mono text-green-600 bg-green-50 px-2 py-1 rounded-md" dir="ltr">{new Date(att.companionCheckedOutAt).toLocaleTimeString('ar-EG')}</span>
                </div>
            </div>
        </div>
    );
}
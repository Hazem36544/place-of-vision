import React from 'react';
import { Search, X, Loader2 } from 'lucide-react';

export default function DashboardSearch({ searchTerm, setSearchTerm, handleSearch, clearSearch, isSearching }) {
    return (
        <section className="bg-white rounded-[2rem] shadow-sm p-6 md:p-8 mb-8 border border-gray-100">
            <div className="w-full">
                <label className="block text-sm md:text-base font-bold text-gray-700 mb-3 mr-1 text-center md:text-right">بحث برقم الهوية للطرف غير الحاضن</label>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="أدخل الرقم القومي للبحث في الزيارات..." 
                            className="block w-full pr-11 pl-12 py-4 h-14 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:bg-white focus:border-[#1e3a8a] outline-none transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value.replace(/\D/g, ''))}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            maxLength="14"
                        />
                        {searchTerm && (
                            <button 
                                onClick={clearSearch}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-gray-200/50 hover:bg-gray-200 text-gray-500 rounded-full transition-colors border-none outline-none"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <button 
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="bg-[#1e3a8a] hover:bg-blue-900 text-white px-8 md:px-10 h-14 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-95 disabled:opacity-70 border-none shrink-0"
                    >
                        {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'بحث'}
                    </button>
                </div>
            </div>
        </section>
    );
}
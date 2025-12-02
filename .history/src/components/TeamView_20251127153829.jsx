import React from 'react';
import { Mail, Phone } from 'lucide-react';

const TeamView = () => {
    return (
        <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Команда</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Карточка сотрудника (Ты) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">А</div>
                    <div>
                        <div className="font-bold text-slate-800">Алексей</div>
                        <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full w-fit mb-2">Администратор</div>
                        <div className="flex gap-2 text-gray-400">
                            <Mail size={14} className="hover:text-slate-600 cursor-pointer" />
                            <Phone size={14} className="hover:text-slate-600 cursor-pointer" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamView;
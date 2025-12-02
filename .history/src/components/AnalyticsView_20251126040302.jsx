import React from 'react';
import { BarChart3, TrendingUp, Users } from 'lucide-react';

const AnalyticsView = () => {
    return (
        <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Аналитика</h1>

            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-gray-500"><TrendingUp size={20} /> Выручка</div>
                    <div className="text-3xl font-bold text-slate-800">0 ₽</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-gray-500"><Users size={20} /> Клиентов</div>
                    <div className="text-3xl font-bold text-slate-800">0</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-gray-500"><BarChart3 size={20} /> Сделок в работе</div>
                    <div className="text-3xl font-bold text-slate-800">0</div>
                </div>
            </div>

            <div className="bg-white h-64 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center text-gray-400">
                График продаж (В разработке)
            </div>
        </div>
    );
};

export default AnalyticsView;
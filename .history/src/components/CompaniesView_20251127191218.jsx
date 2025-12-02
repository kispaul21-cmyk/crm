import React from 'react';
import { Plus, Building2 } from 'lucide-react';

const CompaniesView = ({ companies, onOpenCard }) => {
    return (
        <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Компании</h1>
                <button onClick={() => onOpenCard(null)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700 transition"><Plus size={16} /> Добавить</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companies.map(c => (
                    <div key={c.id} onClick={() => onOpenCard(c.id)} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer group">
                        <div className="flex justify-between items-start mb-2">
                            <div className="font-bold text-lg text-slate-800">{c.name}</div>
                            <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition"><Building2 size={16} /></div>
                        </div>
                        <div className="text-sm text-gray-500">ИНН: {c.inn || '-'}</div>
                        <div className="text-sm text-gray-500 mt-1">{c.phone || 'Нет телефона'}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CompaniesView;
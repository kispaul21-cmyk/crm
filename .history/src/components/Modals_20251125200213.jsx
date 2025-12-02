import React from 'react';
import { X, Phone, Mail, Globe, User, Building2, Briefcase } from 'lucide-react';

// --- МОДАЛКА СОЗДАНИЯ СДЕЛКИ (КРАСИВАЯ) ---
export const DealModal = ({ isOpen, onClose, data, onChange, onSave, stages }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">

                {/* Заголовок */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">Новая сделка</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-sm rounded-full text-gray-400 hover:text-gray-600 transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Поля ввода */}
                <div className="p-6 space-y-5">

                    {/* Название */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Что продаем?</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={data.title}
                                onChange={e => onChange({ ...data, title: e.target.value })}
                                placeholder="Например: Поставка оборудования"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition font-medium text-slate-800"
                            />
                        </div>
                    </div>

                    {/* Компания */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Клиент (Компания)</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={data.company}
                                onChange={e => onChange({ ...data, company: e.target.value })}
                                placeholder="Например: ООО Вектор"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition font-medium text-slate-800"
                            />
                        </div>
                    </div>

                    {/* Этап */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Начальный этап</label>
                        <div className="relative">
                            <select
                                value={data.stage}
                                onChange={e => onChange({ ...data, stage: e.target.value })}
                                className="w-full pl-3 pr-10 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition appearance-none text-slate-700 font-medium cursor-pointer"
                            >
                                {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            {/* Стрелочка для селекта */}
                            <div className="absolute right-4 top-4 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Футер с кнопкой */}
                <div className="p-6 pt-2 bg-white">
                    <button
                        onClick={onSave}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transform active:scale-[0.98] transition-all duration-200"
                    >
                        Создать сделку
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- МОДАЛКА КАРТОЧКИ КОМПАНИИ (КРАСИВАЯ) ---
export const CompanyModal = ({ isOpen, onClose, company, onChange, onSave }) => {
    if (!isOpen || !company) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden transform transition-all">

                {/* Хедер */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/80">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Карточка компании</h2>
                        <p className="text-xs text-gray-500 mt-1">Заполните реквизиты и контакты</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-md rounded-full text-gray-400 hover:text-red-500 transition"><X size={24} /></button>
                </div>

                {/* Тело */}
                <div className="p-8 grid grid-cols-2 gap-6">
                    {/* Основное */}
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Название компании</label>
                        <input type="text" value={company.name} onChange={e => onChange({ ...company, name: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition font-bold text-xl text-slate-800 placeholder-gray-300" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">ИНН</label>
                        <input type="text" value={company.inn || ''} onChange={e => onChange({ ...company, inn: e.target.value })} placeholder="0000000000" className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition font-mono text-slate-700" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Генеральный директор</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 text-gray-400" size={16} />
                            <input type="text" value={company.director || ''} onChange={e => onChange({ ...company, director: e.target.value })} placeholder="Фамилия И.О." className="w-full pl-9 pr-3 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition" />
                        </div>
                    </div>

                    <div className="col-span-2 h-px bg-gray-100 my-2"></div>

                    {/* Контакты */}
                    <div className="col-span-2 grid grid-cols-3 gap-4">
                        <div>
                            <label className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase mb-2"><Phone size={12} /> Телефон</label>
                            <input type="text" value={company.phone || ''} onChange={e => onChange({ ...company, phone: e.target.value })} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-sm" />
                        </div>
                        <div>
                            <label className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase mb-2"><Mail size={12} /> Email</label>
                            <input type="text" value={company.email || ''} onChange={e => onChange({ ...company, email: e.target.value })} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-sm" />
                        </div>
                        <div>
                            <label className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase mb-2"><Globe size={12} /> Сайт</label>
                            <input type="text" value={company.website || ''} onChange={e => onChange({ ...company, website: e.target.value })} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-sm" />
                        </div>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Заметки / Описание</label>
                        <textarea rows="3" value={company.description || ''} onChange={e => onChange({ ...company, description: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-sm text-slate-600 resize-none"></textarea>
                    </div>
                </div>

                {/* Футер */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-200 rounded-xl transition">Отмена</button>
                    <button onClick={onSave} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transform active:scale-95 transition">Сохранить</button>
                </div>
            </div>
        </div>
    );
};
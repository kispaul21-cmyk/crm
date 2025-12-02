```javascript
import React, { useState, useEffect } from 'react';
import { X, Server, FileText, Building, User, Phone, Mail, CreditCard, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';

const DealInfoPanel = ({
    deal,
    onClose,
    dealTasks = [], // Пока не используется в этом дизайне, но оставляем для совместимости
    addTask,
    toggleTask,
    setTaskInProgress,
    deleteTask,
    toggleSubtask
}) => {
    // Состояние формы
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        inn: '',
        noInn: false,
        stage: '',
        value: '',
        prepayment: 30,
        contactName: '',
        contactPosition: '',
        contactPhone: '',
        contactEmail: '',
        comment: '',
        category: 'server' // server | license
    });

    const [stages, setStages] = useState([]);

    // Инициализация данных
    useEffect(() => {
        if (deal) {
            setFormData({
                title: deal.title || '',
                company: deal.company_name || '',
                inn: deal.inn || '',
                noInn: !deal.inn,
                stage: deal.stage || '',
                value: deal.value ? deal.value.toLocaleString('ru-RU') : '',
                prepayment: deal.prepayment || 30, // Предполагаем, что есть такое поле
                contactName: deal.contact_name || '',
                contactPosition: deal.contact_position || '',
                contactPhone: deal.contact_phone || '',
                contactEmail: deal.contact_email || '',
                comment: deal.comment || '',
                category: deal.category || 'server'
            });
        }
        fetchStages();
    }, [deal]);

    const fetchStages = async () => {
        const { data } = await supabase.from('stages').select('*').order('position');
        if (data) setStages(data);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        // Логика сохранения
        const updateData = {
            title: formData.title,
            // company_name: formData.company, // Обычно обновляем через ID компании, но пока так
            // inn: formData.noInn ? null : formData.inn,
            stage: formData.stage,
            value: parseFloat(formData.value.replace(/\s/g, '')),
            contact_name: formData.contactName,
            contact_position: formData.contactPosition,
            contact_phone: formData.contactPhone,
            contact_email: formData.contactEmail,
            comment: formData.comment
        };

        const { error } = await supabase
            .from('deals')
            .update(updateData)
            .eq('id', deal.id);

        if (!error) {
            onClose();
            // Можно добавить обновление списка сделок через callback
        } else {
            alert('Ошибка сохранения: ' + error.message);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-[900px] bg-[#FFF5F0] rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-8 py-6 flex justify-between items-center border-b border-black/5 bg-[#FFFBF8]">
                        <div className="text-[22px] font-extrabold text-[#2D2D2D]">
                            Редактирование сделки
                        </div>
                        <button 
                            onClick={onClose}
                            className="text-[#9CA3AF] hover:text-[#EF4444] transition-colors"
                        >
                            <X size={22} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-8 grid grid-cols-[1fr_1px_1fr] gap-8 overflow-y-auto">
                        
                        {/* Left Column */}
                        <div className="flex flex-col gap-6">
                            <div className="text-[11px] font-extrabold text-[#C0B0A6] uppercase tracking-widest -mb-2">
                                Данные сделки
                            </div>

                            {/* Что продаем */}
                            <div>
                                <label className="block text-xs font-bold text-[#8E8E8E] mb-2 uppercase tracking-wide">
                                    Что продаем? *
                                </label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={16} />
                                    <input 
                                        type="text" 
                                        value={formData.title}
                                        onChange={e => handleChange('title', e.target.value)}
                                        className="w-full h-[46px] pl-10 pr-4 bg-[#F3EBE6] border border-[#E5DCD5] rounded-[10px] text-sm font-medium text-[#333] outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                                    />
                                </div>

                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex gap-1.5">
                                        <label className="cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="cat" 
                                                className="hidden peer"
                                                checked={formData.category === 'server'}
                                                onChange={() => handleChange('category', 'server')}
                                            />
                                            <div className="px-2.5 py-1 rounded-md bg-[#EAE0D9] text-[#888] text-[10px] font-bold uppercase flex items-center gap-1.5 border border-transparent transition-colors hover:bg-[#DCCFC6] peer-checked:bg-[#EEF2FF] peer-checked:text-[#4F46E5] peer-checked:border-[#C7D2FE]">
                                                <Server size={12} /> Серверы
                                            </div>
                                        </label>
                                        <label className="cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="cat" 
                                                className="hidden peer"
                                                checked={formData.category === 'license'}
                                                onChange={() => handleChange('category', 'license')}
                                            />
                                            <div className="px-2.5 py-1 rounded-md bg-[#EAE0D9] text-[#888] text-[10px] font-bold uppercase flex items-center gap-1.5 border border-transparent transition-colors hover:bg-[#DCCFC6] peer-checked:bg-[#ECFDF5] peer-checked:text-[#059669] peer-checked:border-[#A7F3D0]">
                                                <FileText size={12} /> Лицензии
                                            </div>
                                        </label>
                                    </div>
                                    <div className="font-mono text-xs font-semibold text-[#9CA3AF] bg-black/5 px-1.5 py-0.5 rounded">
                                        ID: {deal?.id?.toString().slice(0, 8).toUpperCase()}
                                    </div>
                                </div>
                            </div>

                            {/* Клиент */}
                            <div>
                                <label className="block text-xs font-bold text-[#8E8E8E] mb-2 uppercase tracking-wide">
                                    Клиент (Компания) *
                                </label>
                                <div className="relative">
                                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={16} />
                                    <input 
                                        type="text" 
                                        value={formData.company}
                                        onChange={e => handleChange('company', e.target.value)}
                                        className="w-full h-[46px] pl-10 pr-4 bg-[#F3EBE6] border border-[#E5DCD5] rounded-[10px] text-sm font-medium text-[#333] outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                                    />
                                </div>
                            </div>

                            {/* ИНН */}
                            <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
                                <div>
                                    <label className="block text-xs font-bold text-[#8E8E8E] mb-2 uppercase tracking-wide">
                                        ИНН
                                    </label>
                                    <input 
                                        type="text" 
                                        value={formData.inn}
                                        disabled={formData.noInn}
                                        onChange={e => handleChange('inn', e.target.value)}
                                        placeholder="0000000000"
                                        className={`w - full h - [46px] px - 4 border border - [#E5DCD5] rounded - [10px] text - sm font - medium outline - none transition - all ${ formData.noInn ? 'bg-[#E0E0E0] text-gray-400' : 'bg-[#F3EBE6] text-[#333] focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10' } `}
                                    />
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer mb-3 text-[13px] font-semibold text-[#666]">
                                    <input 
                                        type="checkbox" 
                                        className="hidden peer"
                                        checked={formData.noInn}
                                        onChange={e => handleChange('noInn', e.target.checked)}
                                    />
                                    <div className="w-5 h-5 border-2 border-[#AFAFAF] rounded flex items-center justify-center transition-colors peer-checked:bg-[#444] peer-checked:border-[#444]">
                                        {formData.noInn && <span className="text-white text-xs">✔</span>}
                                    </div>
                                    <span>Нет ИНН</span>
                                </label>
                            </div>

                            {/* Этап */}
                            <div>
                                <label className="block text-xs font-bold text-[#8E8E8E] mb-2 uppercase tracking-wide">
                                    Этап
                                </label>
                                <div className="relative">
                                    <select 
                                        value={formData.stage}
                                        onChange={e => handleChange('stage', e.target.value)}
                                        className="w-full h-[46px] px-4 bg-[#F3EBE6] border border-[#E5DCD5] rounded-[10px] text-sm font-medium text-[#333] outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all appearance-none cursor-pointer"
                                    >
                                        {stages.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 1L5 5L9 1" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Финансы */}
                            <div className="grid grid-cols-[1.2fr_1fr] gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#8E8E8E] mb-2 uppercase tracking-wide">
                                        Сумма
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={formData.value}
                                            onChange={e => handleChange('value', e.target.value)}
                                            className="w-full h-[46px] pl-4 pr-8 bg-[#F3EBE6] border border-[#E5DCD5] rounded-[10px] text-sm font-bold text-[#333] outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] font-bold">₽</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#8E8E8E] mb-2 uppercase tracking-wide">
                                        Предоплата
                                    </label>
                                    <div className="relative mb-2">
                                        <input 
                                            type="number" 
                                            value={formData.prepayment}
                                            onChange={e => handleChange('prepayment', e.target.value)}
                                            className="w-full h-[46px] pl-4 pr-8 bg-[#F3EBE6] border border-[#E5DCD5] rounded-[10px] text-sm font-bold text-[#333] outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] font-bold">%</span>
                                    </div>
                                    <div className="flex gap-1">
                                        {[30, 50, 100].map(val => (
                                            <button 
                                                key={val}
                                                onClick={() => handleChange('prepayment', val)}
                                                className={`flex - 1 py - 1 rounded text - [10px] font - bold transition - colors ${ formData.prepayment == val ? 'bg-blue-600 text-white' : 'bg-[#EAE0D9] text-[#888] hover:bg-[#DCCFC6]' } `}
                                            >
                                                                        <input
                                                                            type="text"
                                                                            value={newSubtaskText}
                                                                            onChange={(e) => setNewSubtaskText(e.target.value)}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') {
                                                                                    handleAddSubtask(task);
                                                                                } else if (e.key === 'Escape') {
                                                                                    setAddingSubtaskForTask(null);
                                                                                    setNewSubtaskText('');
                                                                                }
                                                                            }}
                                                                            placeholder="Введите название и нажмите Enter"
                                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                            autoFocus
                                                                        />
                                                                        <button
                                                                            onClick={() => {
                                                                                setAddingSubtaskForTask(null);
                                                                                setNewSubtaskText('');
                                                                            }}
                                                                            className="text-gray-400 hover:text-red-500"
                                                                        >
                                                                            <X size={18} />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => setAddingSubtaskForTask(task.id)}
                                                                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                                    >
                                                                        <Plus size={14} />
                                                                        Добавить пункт
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Правая колонка - Настройки */}
                                                        <div className="space-y-4">
                                                            {/* Срок исполнения и Исполнитель */}
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="text-xs font-semibold text-gray-500 mb-2 block">
                                                                        Срок исполнения
                                                                    </label>
                                                                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                                                        <Calendar size={14} className="text-gray-400" />
                                                                        <span className="text-sm text-slate-700">
                                                                            {task.due_date
                                                                                ? new Date(task.due_date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                                                                                : 'Не указан'
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="text-xs font-semibold text-gray-500 mb-2 block">
                                                                        Исполнитель
                                                                    </label>
                                                                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                                                        <User size={14} className="text-gray-400" />
                                                                        <span className="text-sm text-slate-700">
                                                                            {task.assignee || 'Не назначен'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Блок файлов */}
                                                            <div>
                                                                <label className="text-xs font-semibold text-gray-500 mb-2 block">
                                                                    Вложения
                                                                </label>
                                                                {task.files && task.files.length > 0 ? (
                                                                    <div className="space-y-2 mb-3">
                                                                        {task.files.map((file, idx) => (
                                                                            <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                                                                                <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                                                                                    <FileText size={16} className="text-red-600" />
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="text-sm font-medium text-slate-700 truncate">
                                                                                        {file.name}
                                                                                    </div>
                                                                                    <div className="text-xs text-gray-500">
                                                                                        {file.size}
                                                                                    </div>
                                                                                </div>
                                                                                <button className="text-gray-400 hover:text-red-500">
                                                                                    <X size={14} />
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : null}
                                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer">
                                                                    <Upload size={20} className="mx-auto text-gray-400 mb-1" />
                                                                    <div className="text-xs text-gray-500">Прикрепить файл</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ===== ТАБ ИСТОРИЯ ===== */}
                {activeTab === 'history' && (
                    <div className="p-6 space-y-4">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">История активности</h3>
                        <div className="text-center py-12 text-gray-400">
                            История пока не реализована
                        </div>
                    </div>
                )}

                {/* ===== ТАБ ФАЙЛЫ ===== */}
                {activeTab === 'files' && (
                    <div className="p-6 space-y-4">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Файлы</h3>
                        <div className="text-center py-12 text-gray-400">
                            Файлы пока не реализованы
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default DealInfoPanel;
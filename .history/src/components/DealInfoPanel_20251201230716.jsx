import React, { useState, useEffect } from 'react';
import { X, Server, FileText, Building, User, Phone, Mail, CreditCard, Briefcase, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';
import { fetchCompanyByINN, getDaDataApiKey } from '../services/DaDataService';

const DealInfoPanel = ({
    deal,
    onClose,
    dealTasks = [],
    addTask,
    toggleTask,
    setTaskInProgress,
    deleteTask,
    toggleSubtask,
    onDealCreated, // Callback to refresh deals list after creation
    companies = []
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
    const [isFetchingInn, setIsFetchingInn] = useState(false);
    const [innError, setInnError] = useState(null);
    const [dadataCompany, setDadataCompany] = useState(null);

    // Инициализация данных
    useEffect(() => {
        if (deal) {
            // Режим редактирования
            setFormData({
                title: deal.title || '',
                company: deal.company_name || '',
                inn: deal.inn || (deal.companies?.inn) || '', // Пытаемся взять ИНН из сделки или связанной компании
                noInn: !deal.inn && !deal.companies?.inn,
                stage: deal.stage || '',
                value: deal.value ? deal.value.toLocaleString('ru-RU') : '',
                prepayment: deal.prepayment || 30,
                contactName: deal.contact_name || '',
                contactPosition: deal.contact_position || '',
                contactPhone: deal.contact_phone || '',
                contactEmail: deal.contact_email || '',
                comment: deal.comment || '',
                category: deal.category || 'server'
            });
        } else {
            // Режим создания - сброс или значения по умолчанию
            setFormData({
                title: 'Новая сделка',
                company: '',
                inn: '',
                noInn: false,
                stage: stages.length > 0 ? stages[0].id : '',
                value: '',
                prepayment: 30,
                contactName: '',
                contactPosition: '',
                contactPhone: '',
                contactEmail: '',
                comment: '',
                category: 'server'
            });
        }
    }, [deal, stages]); // stages добавлено, чтобы установить дефолтный этап при загрузке

    useEffect(() => {
        fetchStages();
    }, []);

    const fetchStages = async () => {
        const { data } = await supabase.from('stages').select('*').order('position');
        if (data) {
            setStages(data);
            // Если создаем новую сделку и этап еще не выбран, ставим первый
            if (!deal && !formData.stage && data.length > 0) {
                setFormData(prev => ({ ...prev, stage: data[0].id }));
            }
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Обработка ввода ИНН
    const handleInnChange = async (value) => {
        // Разрешаем только цифры
        const cleanValue = value.replace(/\D/g, '');
        handleChange('inn', cleanValue);
        setInnError(null);

        // Если длина достаточная, делаем запрос
        if (cleanValue.length >= 10) {
            // Сначала ищем в существующих компаниях
            const existingCompany = companies.find(c => c.inn === cleanValue);
            if (existingCompany) {
                setFormData(prev => ({
                    ...prev,
                    company: existingCompany.name,
                    contactPosition: prev.contactPosition || existingCompany.director_post || '',
                    contactName: prev.contactName || existingCompany.director || ''
                }));
                // Можно сохранить ID найденной компании, если нужно
                return;
            }

            // Если не нашли, ищем в DaData
            setIsFetchingInn(true);
            try {
                const apiKey = await getDaDataApiKey(supabase);
                if (!apiKey) {
                    console.warn('DaData API key not found');
                    setIsFetchingInn(false);
                    return;
                }

                const companyData = await fetchCompanyByINN(cleanValue, apiKey);

                if (companyData) {
                    setDadataCompany(companyData); // Сохраняем полные данные для создания
                    setFormData(prev => ({
                        ...prev,
                        company: companyData.name,
                        // Можно также заполнить другие поля, если они пусты
                        contactPosition: prev.contactPosition || companyData.director_post || '',
                        contactName: prev.contactName || companyData.director || ''
                    }));
                } else {
                    setInnError('Компания не найдена');
                }
            } catch (error) {
                console.error('Error fetching company:', error);
                setInnError('Ошибка поиска');
            } finally {
                setIsFetchingInn(false);
            }
        }
    };

    const handleSave = async () => {
        let companyId = deal?.company_id || null;

        // 1. Попытка найти или создать компанию
        if (formData.company) {
            // Ищем по имени или ИНН
            const existing = companies.find(c =>
                (formData.inn && c.inn === formData.inn) ||
                c.name.toLowerCase() === formData.company.toLowerCase()
            );

            if (existing) {
                companyId = existing.id;
            } else if (dadataCompany && dadataCompany.name === formData.company) {
                // Создаем из DaData
                const { data: newCompany, error: createError } = await supabase
                    .from('companies')
                    .insert([{
                        name: dadataCompany.name,
                        inn: dadataCompany.inn,
                        kpp: dadataCompany.kpp,
                        ogrn: dadataCompany.ogrn,
                        okpo: dadataCompany.okpo,
                        okved: dadataCompany.okved,
                        legal_address: dadataCompany.legal_address,
                        postal_code: dadataCompany.postal_code,
                        director: dadataCompany.director,
                        director_post: dadataCompany.director_post,
                        phone: dadataCompany.phone,
                        email: dadataCompany.email,
                        website: dadataCompany.website,
                        status: dadataCompany.status,
                        registration_date: dadataCompany.registration_date,
                        capital: dadataCompany.capital,
                        employee_count: dadataCompany.employee_count,
                        full_name: dadataCompany.full_name,
                        short_name: dadataCompany.short_name,
                        opf: dadataCompany.opf,
                        bank_bik: dadataCompany.bank_bik,
                        bank_name: dadataCompany.bank_name,
                    }])
                    .select()
                    .single();

                if (!createError && newCompany) {
                    companyId = newCompany.id;
                }
            } else {
                // Создаем простую компанию по имени
                const { data: newCompany, error: createError } = await supabase
                    .from('companies')
                    .insert([{
                        name: formData.company,
                        inn: formData.inn || null
                    }])
                    .select()
                    .single();

                if (!createError && newCompany) {
                    companyId = newCompany.id;
                }
            }
        }

        // Подготовка данных сделки
        const dealData = {
            title: formData.title,
            company_id: companyId, // Важно!
            stage: formData.stage,
            value: formData.value ? parseFloat(formData.value.replace(/\s/g, '')) : null,
            contact_name: formData.contactName,
            contact_position: formData.contactPosition,
            contact_phone: formData.contactPhone,
            contact_email: formData.contactEmail,
            comment: formData.comment,
            category: formData.category,
            inn: formData.inn // Сохраняем и в сделку тоже, для удобства
        };

        if (deal?.id) {
            // === UPDATE ===
            const { error } = await supabase
                .from('deals')
                .update(dealData)
                .eq('id', deal.id);

            if (!error) {
                onClose();
                if (onDealCreated) onDealCreated(); // Refresh list
            } else {
                alert('Ошибка сохранения: ' + error.message);
            }
        } else {
            // === CREATE ===
            const { error } = await supabase
                .from('deals')
                .insert([dealData]);

            if (!error) {
                onClose();
                if (onDealCreated) onDealCreated();
            } else {
                alert('Ошибка создания: ' + error.message);
            }
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
                    className="w-[900px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-8 py-6 flex justify-between items-center border-b border-gray-100 bg-white">
                        <div className="flex-1 mr-8">
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => handleChange('title', e.target.value)}
                                placeholder="Название сделки"
                                className="text-[22px] font-extrabold text-[#2D2D2D] bg-transparent border-none outline-none placeholder-gray-300 w-full hover:bg-gray-50 rounded px-2 -ml-2 transition-colors focus:bg-gray-50 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                        <button
                            onClick={onClose}
                            className="text-[#9CA3AF] hover:text-[#EF4444] transition-colors p-2 hover:bg-red-50 rounded-full"
                        >
                            <X size={22} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-8 grid grid-cols-[1fr_1px_1fr] gap-8 overflow-y-auto bg-white">

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
                                        value={formData.title} // Дублируем название здесь или можно убрать
                                        onChange={e => handleChange('title', e.target.value)}
                                        className="w-full h-[46px] pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-[10px] text-sm font-medium text-[#333] outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
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
                                            <div className="px-2.5 py-1 rounded-md bg-gray-100 text-[#888] text-[10px] font-bold uppercase flex items-center gap-1.5 border border-transparent transition-colors hover:bg-gray-200 peer-checked:bg-[#EEF2FF] peer-checked:text-[#4F46E5] peer-checked:border-[#C7D2FE]">
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
                                            <div className="px-2.5 py-1 rounded-md bg-gray-100 text-[#888] text-[10px] font-bold uppercase flex items-center gap-1.5 border border-transparent transition-colors hover:bg-gray-200 peer-checked:bg-[#ECFDF5] peer-checked:text-[#059669] peer-checked:border-[#A7F3D0]">
                                                <FileText size={12} /> Лицензии
                                            </div>
                                        </label>
                                    </div>
                                    {deal && (
                                        <div className="font-mono text-xs font-semibold text-[#9CA3AF] bg-black/5 px-1.5 py-0.5 rounded">
                                            ID: {deal.id.toString().slice(0, 8).toUpperCase()}
                                        </div>
                                    )}
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
                                        className="w-full h-[46px] pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-[10px] text-sm font-medium text-[#333] outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                                    />
                                </div>
                            </div>

                            {/* ИНН */}
                            <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
                                <div>
                                    <label className="block text-xs font-bold text-[#8E8E8E] mb-2 uppercase tracking-wide">
                                        ИНН
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={formData.inn}
                                            disabled={formData.noInn}
                                            onChange={e => handleInnChange(e.target.value)}
                                            placeholder="0000000000"
                                            className={`w-full h-[46px] px-4 border border-gray-200 rounded-[10px] text-sm font-medium outline-none transition-all ${formData.noInn ? 'bg-gray-100 text-gray-400' : 'bg-gray-50 text-[#333] focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10'}`}
                                        />
                                        {isFetchingInn && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <Loader size={16} className="animate-spin text-blue-600" />
                                            </div>
                                        )}
                                    </div>
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
                            {innError && (
                                <div className="text-xs text-red-500 -mt-4 ml-1">{innError}</div>
                            )}

                            {/* Этап */}
                            <div>
                                <label className="block text-xs font-bold text-[#8E8E8E] mb-2 uppercase tracking-wide">
                                    Этап
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.stage}
                                        onChange={e => handleChange('stage', e.target.value)}
                                        className="w-full h-[46px] px-4 bg-gray-50 border border-gray-200 rounded-[10px] text-sm font-medium text-[#333] outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all appearance-none cursor-pointer"
                                    >
                                        {stages.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 1L5 5L9 1" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
                                            className="w-full h-[46px] pl-4 pr-8 bg-gray-50 border border-gray-200 rounded-[10px] text-sm font-bold text-[#333] outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
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
                                            className="w-full h-[46px] pl-4 pr-8 bg-gray-50 border border-gray-200 rounded-[10px] text-sm font-bold text-[#333] outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] font-bold">%</span>
                                    </div>
                                    <div className="flex gap-1">
                                        {[30, 50, 100].map(val => (
                                            <button
                                                key={val}
                                                onClick={() => handleChange('prepayment', val)}
                                                className={`flex-1 py-1 rounded text-[10px] font-bold transition-colors ${formData.prepayment == val ? 'bg-blue-600 text-white' : 'bg-gray-100 text-[#888] hover:bg-gray-200'}`}
                                            >
                                                {val}%
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="w-px bg-gray-200 h-full"></div>

                        {/* Right Column */}
                        <div className="flex flex-col gap-6">
                            <div className="text-[11px] font-extrabold text-[#C0B0A6] uppercase tracking-widest -mb-2">
                                Контактное лицо
                            </div>

                            {/* Имя */}
                            <div>
                                <label className="block text-xs font-bold text-[#8E8E8E] mb-2 uppercase tracking-wide">
                                    Имя Фамилия
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={16} />
                                    <input
                                        type="text"
                                        value={formData.contactName}
                                        onChange={e => handleChange('contactName', e.target.value)}
                                        className="w-full h-[46px] pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-[10px] text-sm font-medium text-[#333] outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Должность */}
                            <div>
                                <label className="block text-xs font-bold text-[#8E8E8E] mb-2 uppercase tracking-wide">
                                    Должность
                                </label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={16} />
                                    <input
                                        type="text"
                                        value={formData.contactPosition}
                                        onChange={e => handleChange('contactPosition', e.target.value)}
                                        className="w-full h-[46px] pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-[10px] text-sm font-medium text-[#333] outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Телефон и Email */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#8E8E8E] mb-2 uppercase tracking-wide">
                                        Телефон
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={16} />
                                        <input
                                            type="tel"
                                            value={formData.contactPhone}
                                            onChange={e => handleChange('contactPhone', e.target.value)}
                                            placeholder="+7..."
                                            className="w-full h-[46px] pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-[10px] text-sm font-medium text-[#333] outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#8E8E8E] mb-2 uppercase tracking-wide">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={16} />
                                        <input
                                            type="email"
                                            value={formData.contactEmail}
                                            onChange={e => handleChange('contactEmail', e.target.value)}
                                            placeholder="mail@..."
                                            className="w-full h-[46px] pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-[10px] text-sm font-medium text-[#333] outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Комментарий */}
                            <div className="flex-grow flex flex-col">
                                <label className="block text-xs font-bold text-[#8E8E8E] mb-2 uppercase tracking-wide">
                                    Комментарий
                                </label>
                                <textarea
                                    value={formData.comment}
                                    onChange={e => handleChange('comment', e.target.value)}
                                    placeholder="Дополнительная информация..."
                                    className="w-full flex-grow min-h-[100px] p-4 bg-gray-50 border border-gray-200 rounded-[10px] text-sm font-medium text-[#333] outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all resize-none"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-5 border-t border-gray-100 bg-white flex justify-end">
                        <button
                            onClick={handleSave}
                            className="px-10 h-12 bg-blue-600 text-white text-base font-bold rounded-[10px] shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
                        >
                            {deal ? 'Сохранить сделку' : 'Создать сделку'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default DealInfoPanel;
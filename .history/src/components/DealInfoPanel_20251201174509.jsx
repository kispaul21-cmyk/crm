import React, { useState, useEffect } from 'react';
import { X, Briefcase, Building2, User, CreditCard, Phone, Mail, FileText, Server, Award } from 'lucide-react';
import { supabase } from '../supabase';
import { fetchCompanyByINN, getDaDataApiKey } from '../services/DaDataService';

const DealInfoPanel = ({ deal, onClose }) => {
    // Основные стейты
    const [title, setTitle] = useState(deal?.title || 'Новая сделка');
    const [category, setCategory] = useState('server'); // server | license
    const [dealCode, setDealCode] = useState('DELL-2024-001'); // Пример кода

    // Данные компании
    const [companyName, setCompanyName] = useState(deal?.company_name || '');
    const [inn, setInn] = useState(''); // В deal может не быть поля inn, добавим локально
    const [noInn, setNoInn] = useState(false);
    const [stage, setStage] = useState(deal?.stage || 'new'); // Нужно мапить на ID этапов

    // Финансы
    const [amount, setAmount] = useState(deal?.budget || 0);
    const [prepayPercent, setPrepayPercent] = useState(30);

    // Контакт
    const [contactName, setContactName] = useState(deal?.contact_name || '');
    const [contactPosition, setContactPosition] = useState(deal?.contact_position || '');
    const [contactPhone, setContactPhone] = useState(deal?.contact_phone || '');
    const [contactEmail, setContactEmail] = useState(deal?.contact_email || '');
    const [comment, setComment] = useState('');

    // DaData
    const [dadataApiKey, setDadataApiKey] = useState(null);
    const [isLoadingCompany, setIsLoadingCompany] = useState(false);

    // Загрузка API ключа DaData
    useEffect(() => {
        const loadApiKey = async () => {
            const key = await getDaDataApiKey(supabase);
            setDadataApiKey(key);
        };
        loadApiKey();
    }, []);

    // Поиск по ИНН
    const handleInnChange = async (e) => {
        const value = e.target.value;
        setInn(value);

        if (value.length >= 10 && dadataApiKey) {
            setIsLoadingCompany(true);
            try {
                const companyData = await fetchCompanyByINN(value, dadataApiKey);
                if (companyData) {
                    setCompanyName(companyData.name);
                    // Можно заполнить и другие поля, если они есть
                }
            } catch (error) {
                console.error('Ошибка DaData:', error);
            } finally {
                setIsLoadingCompany(false);
            }
        }
    };

    // Сохранение сделки
    const handleSave = async () => {
        try {
            const { error } = await supabase
                .from('deals')
                .update({
                    title,
                    company_name: companyName,
                    budget: parseFloat(amount),
                    // stage: stage, // Пока не обновляем этап, так как нужны ID
                    contact_name: contactName,
                    contact_position: contactPosition,
                    contact_phone: contactPhone,
                    contact_email: contactEmail,
                    // Дополнительные поля можно сохранять в jsonb поле, если оно есть, или добавить колонки
                })
                .eq('id', deal.id);

            if (error) throw error;

            // Обновляем локальный объект deal (для родителя)
            deal.title = title;
            deal.company_name = companyName;
            deal.budget = parseFloat(amount);
            deal.contact_name = contactName;

            onClose();
        } catch (error) {
            alert('Ошибка при сохранении: ' + error.message);
        }
    };

    // Форматирование суммы
    const handleAmountChange = (e) => {
        // Убираем пробелы и буквы
        const val = e.target.value.replace(/\D/g, '');
        setAmount(val);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-[900px] rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">

                {/* Шапка */}
                <div className="px-8 py-6 flex justify-between items-center border-b border-gray-100 bg-gray-50">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-3xl font-extrabold text-gray-800 bg-transparent outline-none w-full mr-4 placeholder-gray-400"
                        placeholder="Название сделки"
                    />
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X size={28} />
                    </button>
                </div>

                {/* Тело */}
                <div className="p-8 grid grid-cols-[1fr_1px_1fr] gap-10 overflow-y-auto bg-white">

                    {/* Левая колонка: Данные сделки */}
                    <div className="flex flex-col gap-8">
                        <div className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-[-10px]">Данные сделки</div>

                        {/* Что продаем */}
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Что продаем? *</label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    value="Поставка оборудования" // Пока хардкод или из стейта
                                    readOnly
                                    className="w-full h-[52px] px-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-800 font-medium outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition"
                                />
                            </div>

                            <div className="flex items-center justify-between mt-3">
                                <div className="flex gap-2">
                                    <label className="cursor-pointer">
                                        <input
                                            type="radio"
                                            name="cat"
                                            className="hidden peer"
                                            checked={category === 'server'}
                                            onChange={() => setCategory('server')}
                                        />
                                        <div className="text-xs font-bold uppercase px-3 py-1.5 rounded-md bg-gray-100 text-gray-500 border border-transparent peer-checked:bg-indigo-50 peer-checked:text-indigo-600 peer-checked:border-indigo-200 transition-all flex items-center gap-2 hover:bg-gray-200">
                                            <Server size={12} /> Серверы
                                        </div>
                                    </label>
                                    <label className="cursor-pointer">
                                        <input
                                            type="radio"
                                            name="cat"
                                            className="hidden peer"
                                            checked={category === 'license'}
                                            onChange={() => setCategory('license')}
                                        />
                                        <div className="text-xs font-bold uppercase px-3 py-1.5 rounded-md bg-gray-100 text-gray-500 border border-transparent peer-checked:bg-emerald-50 peer-checked:text-emerald-600 peer-checked:border-emerald-200 transition-all flex items-center gap-2 hover:bg-gray-200">
                                            <Award size={12} /> Лицензии
                                        </div>
                                    </label>
                                </div>
                                <div className="font-mono text-sm font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                    {dealCode}
                                </div>
                            </div>
                        </div>

                        {/* Клиент */}
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Клиент (Компания) *</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="w-full h-[52px] px-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-800 font-medium outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition"
                                />
                            </div>
                        </div>

                        {/* ИНН */}
                        <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">ИНН</label>
                                <input
                                    type="text"
                                    value={inn}
                                    onChange={handleInnChange}
                                    disabled={noInn}
                                    placeholder="0000000000"
                                    className={`w-full h-[52px] px-4 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-800 font-medium outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition ${noInn ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : ''}`}
                                />
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer mb-4 text-sm font-semibold text-gray-500 select-none">
                                <input
                                    type="checkbox"
                                    className="hidden peer"
                                    checked={noInn}
                                    onChange={(e) => setNoInn(e.target.checked)}
                                />
                                <div className="w-6 h-6 border-2 border-gray-300 rounded flex items-center justify-center peer-checked:bg-gray-700 peer-checked:border-gray-700 transition-all">
                                    {noInn && <span className="text-white text-xs">✔</span>}
                                </div>
                                <span>Нет ИНН</span>
                            </label>
                        </div>

                        {/* Этап */}
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Этап</label>
                            <select className="w-full h-[52px] px-4 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-800 font-medium outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition appearance-none cursor-pointer">
                                <option>Новая заявка</option>
                                <option>В работе</option>
                                <option>Договор</option>
                            </select>
                        </div>

                        {/* Финансы */}
                        <div className="grid grid-cols-[1.2fr_1fr] gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Сумма</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={amount}
                                        onChange={handleAmountChange}
                                        className="w-full h-[52px] px-4 pr-8 bg-gray-50 border border-gray-200 rounded-xl text-lg text-gray-800 font-bold outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₽</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Предоплата</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={prepayPercent}
                                        onChange={(e) => setPrepayPercent(e.target.value)}
                                        className="w-full h-[52px] px-4 pr-8 bg-gray-50 border border-gray-200 rounded-xl text-lg text-gray-800 font-bold outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                                </div>
                                <div className="flex gap-1 mt-2">
                                    {[30, 50, 100].map(p => (
                                        <div
                                            key={p}
                                            onClick={() => setPrepayPercent(p)}
                                            className={`flex-1 text-center text-xs font-bold py-1.5 rounded cursor-pointer transition-colors ${prepayPercent === p ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                                        >
                                            {p}%
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Разделитель */}
                    <div className="w-px h-full bg-gray-200"></div>

                    {/* Правая колонка: Контактное лицо */}
                    <div className="flex flex-col gap-8">
                        <div className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-[-10px]">Контактное лицо</div>

                        {/* Имя */}
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Имя Фамилия</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    value={contactName}
                                    onChange={(e) => setContactName(e.target.value)}
                                    className="w-full h-[52px] px-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-800 font-medium outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition"
                                />
                            </div>
                        </div>

                        {/* Должность */}
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Должность</label>
                            <div className="relative">
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    value={contactPosition}
                                    onChange={(e) => setContactPosition(e.target.value)}
                                    className="w-full h-[52px] px-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-800 font-medium outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition"
                                />
                            </div>
                        </div>

                        {/* Телефон и Email */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Телефон</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="tel"
                                        value={contactPhone}
                                        onChange={(e) => setContactPhone(e.target.value)}
                                        placeholder="+7..."
                                        className="w-full h-[52px] px-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-800 font-medium outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="email"
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                        placeholder="mail@..."
                                        className="w-full h-[52px] px-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-800 font-medium outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Комментарий */}
                        <div className="flex-grow flex flex-col">
                            <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Комментарий</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Дополнительная информация..."
                                className="w-full flex-grow p-4 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-800 font-medium outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition resize-none min-h-[120px]"
                            ></textarea>
                        </div>

                    </div>
                </div>

                {/* Футер */}
                <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="px-10 h-14 bg-blue-600 text-white text-lg font-bold rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
                    >
                        Сохранить
                    </button>
                </div>

            </div>
        </div>
    );
};

export default DealInfoPanel;
import React, { useState, useEffect } from 'react';
import { X, Phone, Mail, Globe, User, Building2, Briefcase, Sparkles, Loader, Plus, Minus } from 'lucide-react';
import { fetchCompanyByINN, getDaDataApiKey } from '../services/DaDataService';
import { supabase } from '../supabase';

// Список всех доступных дополнительных полей
const ADDITIONAL_FIELDS = [
    { key: 'okpo', label: 'ОКПО', placeholder: '12345678' },
    { key: 'okved', label: 'ОКВЭД', placeholder: '62.01' },
    { key: 'director_post', label: 'Должность директора', placeholder: 'Генеральный директор' },
    { key: 'phone', label: 'Телефон', placeholder: '+7 (999) 123-45-67' },
    { key: 'email', label: 'Email', placeholder: 'info@company.ru' },
    { key: 'website', label: 'Сайт', placeholder: 'https://company.ru' },
    { key: 'status', label: 'Статус компании', placeholder: 'Действующая' },
    { key: 'registration_date', label: 'Дата регистрации', placeholder: '2020-01-15', type: 'date' },
    { key: 'capital', label: 'Уставный капитал (₽)', placeholder: '10000', type: 'number' },
    { key: 'employee_count', label: 'Количество сотрудников', placeholder: '50', type: 'number' },
    { key: 'full_name', label: 'Полное наименование', placeholder: 'Общество с ограниченной ответственностью...' },
    { key: 'short_name', label: 'Краткое наименование', placeholder: 'ООО "Компания"' },
    { key: 'opf', label: 'ОПФ', placeholder: 'ООО' },
    { key: 'postal_code', label: 'Почтовый индекс', placeholder: '123456' },
];

// --- МОДАЛКА СОЗДАНИЯ СДЕЛКИ (БЕЗ ИЗМЕНЕНИЙ) ---
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

// --- МОДАЛКА КАРТОЧКИ КОМПАНИИ (С ГИБКИМИ ПОЛЯМИ) ---
export const CompanyModal = ({ isOpen, onClose, company, onChange, onSave }) => {
    const [isFetching, setIsFetching] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [fetchSuccess, setFetchSuccess] = useState(false);
    const [showFieldSelector, setShowFieldSelector] = useState(false);
    const [visibleFields, setVisibleFields] = useState([]);

    // Загружаем видимые поля при открытии (useEffect должен быть ДО return null!)
    useEffect(() => {
        if (isOpen && company && company.visible_fields && Array.isArray(company.visible_fields)) {
            setVisibleFields(company.visible_fields);
        } else if (isOpen && company) {
            setVisibleFields([]);
        }
    }, [company?.id, isOpen]);

    if (!isOpen || !company) return null;

    // Функция автозаполнения по ИНН
    const handleFetchByINN = async () => {
        if (!company.inn || company.inn.trim().length < 10) {
            setFetchError('Введите корректный ИНН (10 или 12 цифр)');
            return;
        }

        setIsFetching(true);
        setFetchError(null);
        setFetchSuccess(false);

        try {
            const apiKey = await getDaDataApiKey(supabase);

            if (!apiKey) {
                setFetchError('Интеграция DaData не настроена. Перейдите в Настройки → Интеграции');
                setIsFetching(false);
                return;
            }

            const companyData = await fetchCompanyByINN(company.inn, apiKey);

            if (!companyData) {
                setFetchError('Компания с таким ИНН не найдена');
                setIsFetching(false);
                return;
            }

            // Обновляем все поля компании
            onChange({
                ...company,
                name: companyData.name || company.name,
                inn: companyData.inn || company.inn,
                kpp: companyData.kpp || company.kpp,
                ogrn: companyData.ogrn || company.ogrn,
                legal_address: companyData.legal_address || company.legal_address,
                director: companyData.director || company.director,
                bank_bik: companyData.bank_bik || company.bank_bik,
                bank_name: companyData.bank_name || company.bank_name,
                // Дополнительные поля
                okpo: companyData.okpo || company.okpo,
                okved: companyData.okved || company.okved,
                director_post: companyData.director_post || company.director_post,
                phone: companyData.phone || company.phone,
                email: companyData.email || company.email,
                website: companyData.website || company.website,
                status: companyData.status || company.status,
                registration_date: companyData.registration_date || company.registration_date,
                capital: companyData.capital || company.capital,
                employee_count: companyData.employee_count || company.employee_count,
                full_name: companyData.full_name || company.full_name,
                short_name: companyData.short_name || company.short_name,
                opf: companyData.opf || company.opf,
                postal_code: companyData.postal_code || company.postal_code,
            });

            setFetchSuccess(true);

            setTimeout(() => {
                setFetchSuccess(false);
            }, 3000);

        } catch (error) {
            console.error('Ошибка получения данных DaData:', error);
            setFetchError(error.message || 'Ошибка при получении данных. Попробуйте позже.');
        } finally {
            setIsFetching(false);
        }
    };

    // Добавить дополнительное поле
    const addField = (fieldKey) => {
        if (!visibleFields.includes(fieldKey)) {
            const newVisibleFields = [...visibleFields, fieldKey];
            setVisibleFields(newVisibleFields);
            // Обновляем company с новым массивом видимых полей
            onChange({ ...company, visible_fields: newVisibleFields });
        }
        setShowFieldSelector(false);
    };

    // Удалить дополнительное поле
    const removeField = (fieldKey) => {
        const newVisibleFields = visibleFields.filter(f => f !== fieldKey);
        setVisibleFields(newVisibleFields);
        onChange({ ...company, visible_fields: newVisibleFields });
    };

    // Доступные для добавления поля (те, которые ещё не добавлены)
    const availableFields = ADDITIONAL_FIELDS.filter(field => !visibleFields.includes(field.key));

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 overflow-hidden transform transition-all">

                {/* Хедер */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/80">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Карточка компании</h2>
                        <p className="text-xs text-gray-500 mt-1">Заполните реквизиты и контакты</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-md rounded-full text-gray-400 hover:text-red-500 transition"><X size={24} /></button>
                </div>

                {/* Тело */}
                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">

                    {/* СТАНДАРТНЫЕ ПОЛЯ */}

                    {/* Название компании */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Название компании *</label>
                        <input
                            type="text"
                            value={company.name || ''}
                            onChange={e => onChange({ ...company, name: e.target.value })}
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition font-bold text-xl text-slate-800 placeholder-gray-300"
                        />
                    </div>

                    {/* ИНН с кнопкой автозаполнения */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">ИНН *</label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={company.inn || ''}
                                onChange={e => {
                                    onChange({ ...company, inn: e.target.value });
                                    setFetchError(null);
                                    setFetchSuccess(false);
                                }}
                                placeholder="0000000000"
                                className="flex-1 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition font-mono text-slate-700"
                            />
                            <button
                                onClick={handleFetchByINN}
                                disabled={isFetching || !company.inn || company.inn.trim().length < 10}
                                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${isFetching
                                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                        : fetchSuccess
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl active:scale-95'
                                    }`}
                                title="Заполнить данные компании автоматически по ИНН"
                            >
                                {isFetching ? (
                                    <>
                                        <Loader size={18} className="animate-spin" />
                                        Загрузка...
                                    </>
                                ) : fetchSuccess ? (
                                    <>
                                        <Sparkles size={18} />
                                        Заполнено!
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} />
                                        Заполнить
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Сообщения об ошибках */}
                        {fetchError && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                <div className="text-red-600 text-xs mt-0.5">⚠️</div>
                                <p className="text-xs text-red-700">{fetchError}</p>
                            </div>
                        )}

                        {/* Сообщение об успехе */}
                        {fetchSuccess && (
                            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                                <div className="text-green-600 text-xs mt-0.5">✓</div>
                                <p className="text-xs text-green-700 font-medium">Данные успешно загружены из DaData!</p>
                            </div>
                        )}
                    </div>

                    {/* КПП, ОГРН */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">КПП</label>
                            <input
                                type="text"
                                value={company.kpp || ''}
                                onChange={e => onChange({ ...company, kpp: e.target.value })}
                                placeholder="770701001"
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition font-mono text-slate-700"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">ОГРН</label>
                            <input
                                type="text"
                                value={company.ogrn || ''}
                                onChange={e => onChange({ ...company, ogrn: e.target.value })}
                                placeholder="1027700132195"
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition font-mono text-slate-700"
                            />
                        </div>
                    </div>

                    {/* Юридический адрес */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Юридический адрес</label>
                        <textarea
                            rows="2"
                            value={company.legal_address || ''}
                            onChange={e => onChange({ ...company, legal_address: e.target.value })}
                            placeholder="г Москва, ул Примерная, д 1"
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-sm text-slate-700 resize-none"
                        />
                    </div>

                    {/* Генеральный директор */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Генеральный директор</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 text-gray-400" size={16} />
                            <input
                                type="text"
                                value={company.director || ''}
                                onChange={e => onChange({ ...company, director: e.target.value })}
                                placeholder="Фамилия Имя Отчество"
                                className="w-full pl-9 pr-3 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition"
                            />
                        </div>
                    </div>

                    {/* Банковские реквизиты */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">БИК банка</label>
                            <input
                                type="text"
                                value={company.bank_bik || ''}
                                onChange={e => onChange({ ...company, bank_bik: e.target.value })}
                                placeholder="044525225"
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition font-mono text-slate-700"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Название банка</label>
                            <input
                                type="text"
                                value={company.bank_name || ''}
                                onChange={e => onChange({ ...company, bank_name: e.target.value })}
                                placeholder="ПАО СБЕРБАНК"
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition text-slate-700"
                            />
                        </div>
                    </div>

                    {/* Разделитель */}
                    <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase">Дополнительные поля</h3>

                            {/* Кнопка добавления поля */}
                            {availableFields.length > 0 && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowFieldSelector(!showFieldSelector)}
                                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition flex items-center gap-2 text-sm font-semibold"
                                    >
                                        <Plus size={16} />
                                        Добавить поле
                                    </button>

                                    {/* Выпадающий список полей */}
                                    {showFieldSelector && (
                                        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-10 max-h-80 overflow-y-auto">
                                            <div className="p-2">
                                                {availableFields.map(field => (
                                                    <button
                                                        key={field.key}
                                                        onClick={() => addField(field.key)}
                                                        className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded-lg transition text-sm text-slate-700 font-medium"
                                                    >
                                                        {field.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ДОПОЛНИТЕЛЬНЫЕ ПОЛЯ */}
                        {visibleFields.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">
                                Нажмите "Добавить поле" чтобы показать дополнительную информацию
                            </p>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            {visibleFields.map(fieldKey => {
                                const field = ADDITIONAL_FIELDS.find(f => f.key === fieldKey);
                                if (!field) return null;

                                return (
                                    <div key={fieldKey} className="relative group">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                                            {field.label}
                                            <button
                                                onClick={() => removeField(fieldKey)}
                                                className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-100 rounded text-red-500"
                                                title="Удалить поле"
                                            >
                                                <Minus size={12} />
                                            </button>
                                        </label>
                                        <input
                                            type={field.type || 'text'}
                                            value={company[fieldKey] || ''}
                                            onChange={e => onChange({ ...company, [fieldKey]: e.target.value })}
                                            placeholder={field.placeholder}
                                            className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition text-sm text-slate-700"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Заметки (всегда внизу) */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Заметки / Описание</label>
                        <textarea
                            rows="3"
                            value={company.description || ''}
                            onChange={e => onChange({ ...company, description: e.target.value })}
                            placeholder="Дополнительная информация о компании..."
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-sm text-slate-600 resize-none"
                        />
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
import React, { useState, useEffect } from 'react';
import { X, Phone, Mail, Globe, User, Building2, Briefcase, Sparkles, Loader, Plus, Minus, Search, CheckSquare } from 'lucide-react';
import { fetchCompanyByINN, getDaDataApiKey } from '../services/DaDataService';
import { supabase } from '../supabase';
import { ADDITIONAL_FIELDS } from '../constants/companyFields';

// --- МОДАЛКА СОЗДАНИЯ СДЕЛКИ (С АВТОКОМПЛИТОМ И ИНН) ---
export const DealModal = ({ isOpen, onClose, data, onChange, onSave, stages, companies = [] }) => {
    const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [innValue, setInnValue] = useState('');
    const [noInn, setNoInn] = useState(false);
    const [isFetchingInn, setIsFetchingInn] = useState(false);
    const [innError, setInnError] = useState(null);
    const [foundCompany, setFoundCompany] = useState(null);

    useEffect(() => {
        if (isOpen) {
            // Если это редактирование (есть selectedCompanyId), загружаем ИНН
            if (data.selectedCompanyId) {
                const company = companies.find(c => c.id === data.selectedCompanyId);
                if (company) {
                    setInnValue(company.inn || '');
                    setFoundCompany(company);
                }
            } else {
                // Если создание новой сделки - сбрасываем
                setInnValue('');
                setFoundCompany(null);
            }
            setNoInn(false);
            setInnError(null);
        }
    }, [isOpen, data.selectedCompanyId, companies]);

    if (!isOpen) return null;

    // Фильтрация компаний по вводу
    const handleCompanyInput = (value) => {
        onChange({ ...data, company: value });
        
        if (value.trim().length >= 2) {
            const filtered = companies.filter(c => 
                c.name.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 5); // Показываем максимум 5 подсказок
            
            setFilteredCompanies(filtered);
            setShowCompanySuggestions(filtered.length > 0);
        } else {
            setShowCompanySuggestions(false);
        }
    };

    // Выбор компании из подсказок
    const selectCompany = (company) => {
        onChange({ ...data, company: company.name, selectedCompanyId: company.id });
        setInnValue(company.inn || '');
        setShowCompanySuggestions(false);
        setFoundCompany(company);
    };

    // Поиск/создание компании по ИНН
    const handleInnChange = async (value) => {
        setInnValue(value);
        setInnError(null);
        setFoundCompany(null);

        // Если меньше 10 символов - не проверяем
        if (value.trim().length < 10) return;

        // Проверяем в существующих компаниях
        const existing = companies.find(c => c.inn === value.trim());
        if (existing) {
            onChange({ ...data, company: existing.name, selectedCompanyId: existing.id });
            setFoundCompany(existing);
            return;
        }

        // Если компании нет - запрашиваем DaData
        if (value.trim().length >= 10) {
            setIsFetchingInn(true);
            try {
                const apiKey = await getDaDataApiKey(supabase);
                
                if (!apiKey) {
                    setInnError('DaData не настроена');
                    setIsFetchingInn(false);
                    return;
                }

                const companyData = await fetchCompanyByINN(value.trim(), apiKey);
                
                if (companyData) {
                    onChange({ 
                        ...data, 
                        company: companyData.name,
                        dadataCompany: companyData // Сохраняем данные для создания компании
                    });
                    setFoundCompany({ name: companyData.name, isNew: true });
                } else {
                    setInnError('Компания с таким ИНН не найдена');
                }
            } catch (error) {
                setInnError(error.message);
            } finally {
                setIsFetchingInn(false);
            }
        }
    };

    // Валидация перед сохранением
    const handleSave = () => {
        if (!data.title?.trim()) {
            alert('Введите название сделки');
            return;
        }

        if (!noInn && innValue.trim().length > 0 && innValue.trim().length < 10) {
            alert('ИНН должен содержать 10 или 12 цифр');
            return;
        }

        if (!noInn && !innValue.trim() && !data.company?.trim()) {
            alert('Введите название компании или ИНН');
            return;
        }

        onSave();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden transform transition-all scale-100 flex flex-col">

                {/* Заголовок */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-base font-bold text-slate-800">
                        {data.dealId ? 'Редактирование сделки' : 'Новая сделка'}
                    </h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-white hover:shadow-sm rounded-full text-gray-400 hover:text-gray-600 transition">
                        <X size={18} />
                    </button>
                </div>

                {/* Поля ввода */}
                <div className="p-4 space-y-3 overflow-y-auto flex-1">

                    {/* Название сделки */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Что продаем? *</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input
                                type="text"
                                value={data.title}
                                onChange={e => onChange({ ...data, title: e.target.value })}
                                placeholder="Поставка оборудования"
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition text-sm font-medium text-slate-800"
                            />
                        </div>
                    </div>

                    {/* Название компании (с автокомплитом) */}
                    <div className="relative">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                            Клиент (Компания) *
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input
                                type="text"
                                value={data.company}
                                onChange={e => handleCompanyInput(e.target.value)}
                                onFocus={() => {
                                    if (filteredCompanies.length > 0) {
                                        setShowCompanySuggestions(true);
                                    }
                                }}
                                placeholder="ООО Вектор"
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition text-sm font-medium text-slate-800"
                            />
                            {foundCompany && (
                                <div className="absolute right-3 top-2.5">
                                    <CheckSquare size={16} className="text-green-600" />
                                </div>
                            )}
                        </div>

                        {/* Подсказки компаний */}
                        {showCompanySuggestions && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-10 max-h-60 overflow-y-auto">
                                {filteredCompanies.map(company => (
                                    <button
                                        key={company.id}
                                        onClick={() => selectCompany(company)}
                                        className="w-full text-left px-4 py-3 hover:bg-blue-50 transition border-b border-gray-100 last:border-0"
                                    >
                                        <div className="font-semibold text-slate-800">{company.name}</div>
                                        {company.inn && (
                                            <div className="text-xs text-gray-500 mt-1">ИНН: {company.inn}</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Информация о найденной компании */}
                        {foundCompany && foundCompany.isNew && (
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
                                ✓ Новая компания будет создана из DaData
                            </div>
                        )}
                    </div>

                    {/* ИНН компании */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                            ИНН компании
                        </label>
                        <div className="flex gap-2 items-center">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={innValue}
                                    onChange={e => handleInnChange(e.target.value)}
                                    placeholder="0000000000"
                                    disabled={noInn}
                                    className={`w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition font-mono text-sm text-slate-700 ${
                                        noInn ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white'
                                    }`}
                                />
                                {isFetchingInn && (
                                    <div className="absolute right-3 top-2.5">
                                        <Loader size={16} className="animate-spin text-blue-600" />
                                    </div>
                                )}
                            </div>

                            {/* Галочка "Нет ИНН" */}
                            <label className="flex items-center gap-1.5 cursor-pointer select-none whitespace-nowrap">
                                <input
                                    type="checkbox"
                                    checked={noInn}
                                    onChange={e => {
                                        setNoInn(e.target.checked);
                                        if (e.target.checked) {
                                            setInnValue('');
                                            setInnError(null);
                                            setFoundCompany(null);
                                        }
                                    }}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-xs text-gray-600 font-medium">Нет ИНН</span>
                            </label>
                        </div>

                        {/* Ошибка ИНН */}
                        {innError && !noInn && (
                            <div className="mt-1.5 p-1.5 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                                ⚠️ {innError}
                            </div>
                        )}
                    </div>

                    {/* Этап и Сумма в одну строку */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Этап */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Этап</label>
                            <div className="relative">
                                <select
                                    value={data.stage}
                                    onChange={e => onChange({ ...data, stage: e.target.value })}
                                    className="w-full pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition appearance-none text-slate-700 text-sm font-medium cursor-pointer"
                                >
                                    {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                <div className="absolute right-3 top-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        {/* Сумма сделки */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Сумма</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={data.value || ''}
                                    onChange={e => onChange({ ...data, value: e.target.value })}
                                    placeholder="0"
                                    className="w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition text-sm font-medium text-slate-800"
                                />
                                <span className="absolute right-3 top-2.5 text-gray-400 text-sm font-medium">₽</span>
                            </div>
                        </div>
                    </div>

                    {/* Контактное лицо - заголовок */}
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider pt-1">Контактное лицо</div>

                    {/* Имя контакта */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-1.5">Имя</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input
                                type="text"
                                value={data.contact_name || ''}
                                onChange={e => onChange({ ...data, contact_name: e.target.value })}
                                placeholder="Иван Иванов"
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition text-sm text-slate-800"
                            />
                        </div>
                    </div>

                    {/* Должность */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-1.5">Должность</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input
                                type="text"
                                value={data.contact_position || ''}
                                onChange={e => onChange({ ...data, contact_position: e.target.value })}
                                placeholder="Директор"
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition text-sm text-slate-800"
                            />
                        </div>
                    </div>

                    {/* Email и Телефон в одну строку */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Email */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input
                                    type="email"
                                    value={data.contact_email || ''}
                                    onChange={e => onChange({ ...data, contact_email: e.target.value })}
                                    placeholder="email@example.com"
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition text-sm text-slate-800"
                                />
                            </div>
                        </div>

                        {/* Телефон */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1.5">Телефон</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input
                                    type="tel"
                                    value={data.contact_phone || ''}
                                    onChange={e => onChange({ ...data, contact_phone: e.target.value })}
                                    placeholder="+7 999 999-99-99"
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition text-sm text-slate-800"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Комментарий */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-1.5">Комментарий</label>
                        <textarea
                            value={data.comment || ''}
                            onChange={e => onChange({ ...data, comment: e.target.value })}
                            placeholder="Примечания..."
                            rows={2}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition text-sm text-slate-800 resize-none"
                        />
                    </div>

                </div>

                {/* Футер с кнопкой */}
                <div className="px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0">
                    <button
                        onClick={handleSave}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transform active:scale-[0.98] transition-all duration-200"
                    >
                        {data.dealId ? 'Сохранить изменения' : 'Создать сделку'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Список всех доступных дополнительных полей
// ADDITIONAL_FIELDS теперь импортируется из constants/companyFields.js


// --- МОДАЛКА КАРТОЧКИ КОМПАНИИ (БЕЗ ИЗМЕНЕНИЙ ИЗ ПРЕДЫДУЩЕЙ ВЕРСИИ) ---
export const CompanyModal = ({ isOpen, onClose, company, onChange, onSave }) => {
    const [isFetching, setIsFetching] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [fetchSuccess, setFetchSuccess] = useState(false);
    const [showFieldSelector, setShowFieldSelector] = useState(false);
    const [visibleFields, setVisibleFields] = useState([]);
    const [companyDeals, setCompanyDeals] = useState([]);
    const [loadingDeals, setLoadingDeals] = useState(false);

    // Загружаем видимые поля при открытии (useEffect должен быть ДО return null!)
    useEffect(() => {
        if (isOpen && company && company.visible_fields && Array.isArray(company.visible_fields)) {
            setVisibleFields(company.visible_fields);
        } else if (isOpen && company) {
            setVisibleFields([]);
        }
    }, [company?.id, isOpen]);

    // Загружаем сделки компании
    useEffect(() => {
        const fetchCompanyDeals = async () => {
            if (isOpen && company && company.id) {
                setLoadingDeals(true);
                try {
                    // Сначала загружаем сделки
                    const { data: dealsData, error: dealsError } = await supabase
                        .from('deals')
                        .select('*')
                        .eq('company_id', company.id)
                        .order('created_at', { ascending: false });

                    if (dealsError) {
                        console.error('Ошибка загрузки сделок:', dealsError);
                        setCompanyDeals([]);
                        setLoadingDeals(false);
                        return;
                    }

                    // Загружаем этапы отдельно
                    const { data: stagesData, error: stagesError } = await supabase
                        .from('stages')
                        .select('*');

                    if (stagesError) {
                        console.error('Ошибка загрузки этапов:', stagesError);
                    }

                    // Объединяем данные вручную
                    const dealsWithStages = (dealsData || []).map(deal => ({
                        ...deal,
                        stage_info: stagesData?.find(s => s.id === deal.stage) || null
                    }));

                    setCompanyDeals(dealsWithStages);
                } catch (err) {
                    console.error('Ошибка загрузки сделок:', err);
                    setCompanyDeals([]);
                } finally {
                    setLoadingDeals(false);
                }
            }
        };

        fetchCompanyDeals();
    }, [isOpen, company?.id]);

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

    // Доступные для добавления поля
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
                                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${
                                    isFetching 
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

                    {/* СДЕЛКИ С ЭТОЙ КОМПАНИЕЙ */}
                    {company.id && (
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">
                                Сделки с этой компанией ({companyDeals.length})
                            </h3>
                            
                            {loadingDeals ? (
                                <div className="flex justify-center py-6">
                                    <Loader size={24} className="animate-spin text-blue-600" />
                                </div>
                            ) : companyDeals.length > 0 ? (
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {companyDeals.map(deal => (
                                        <div 
                                            key={deal.id}
                                            className="bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition cursor-pointer"
                                            onClick={() => {
                                                // Можно добавить функцию открытия сделки
                                                console.log('Открыть сделку:', deal.id);
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-slate-800">{deal.title}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(deal.created_at).toLocaleDateString('ru-RU')}
                                                    </p>
                                                </div>
                                                {deal.stage_info && (
                                                    <div className="flex items-center gap-2">
                                                        <div 
                                                            className="w-3 h-3 rounded-full" 
                                                            style={{ backgroundColor: deal.stage_info.color }}
                                                        />
                                                        <span className="text-sm text-gray-600">{deal.stage_info.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 text-center py-4">
                                    Пока нет сделок с этой компанией
                                </p>
                            )}
                        </div>
                    )}

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
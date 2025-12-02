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
                                    const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    return (
        <div
            key={task.id}
            className={`bg-white border border-gray-200 rounded-xl overflow-hidden transition-all ${task.is_done ? 'opacity-60' : ''
                } ${isExpanded ? 'shadow-lg' : 'shadow-sm'}`}
        >
            {/* Заголовок задачи */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => toggleExpand(task.id)}
            >
                <div className="flex items-center gap-3 flex-1">
                    <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition ${task.is_done
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 hover:border-green-500'
                            }`}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleTask(task);
                        }}
                    >
                        {task.is_done && (
                            <CheckSquare size={14} className="text-white" />
                        )}
                    </div>
                    <span className={`font-medium text-slate-800 ${task.is_done ? 'line-through' : ''}`}>
                        {task.text}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {task.due_date && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs">
                            <Clock size={12} />
                            {new Date(task.due_date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    )}
                    {task.in_progress && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-600 rounded-lg text-xs">
                            <Flame size={12} />
                        </div>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteTask(task.id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Тело задачи (раскрывается) */}
            {isExpanded && (
                <div className="border-t border-gray-100 p-4">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Левая колонка - Чек-лист */}
                        <div>
                            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                {/* Заголовок чек-листа */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-700">Чек-лист</span>
                                    <span className="text-xs text-gray-500">
                                        {completedSubtasks} из {totalSubtasks}
                                    </span>
                                </div>

                                {/* Прогресс-бар */}
                                {hasSubtasks && (
                                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                )}

                                {/* Список подзадач */}
                                {hasSubtasks && (
                                    <div className="space-y-2">
                                        {task.subtasks.map((subtask, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white transition cursor-pointer"
                                                onClick={() => handleToggleSubtask(task, idx)}
                                            >
                                                <div
                                                    className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${subtask.is_done || task.is_done
                                                        ? 'bg-blue-500 border-blue-500'
                                                        : 'border-gray-300'
                                                        }`}
                                                >
                                                    {(subtask.is_done || task.is_done) && (
                                                        <CheckSquare size={10} className="text-white" />
                                                    )}
                                                </div>
                                                <span
                                                    className={`text-sm ${subtask.is_done || task.is_done
                                                        ? 'text-gray-400 line-through'
                                                        : 'text-slate-700'
                                                        }`}
                                                >
                                                    {subtask.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Форма добавления подзадачи */}
                                {addingSubtaskForTask === task.id ? (
                                    <div className="flex gap-2">
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
                            </div >
                        )}
                    </div >
                )}

{/* ===== ТАБ ИСТОРИЯ ===== */ }
{
    activeTab === 'history' && (
        <div className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4">История активности</h3>
            <div className="text-center py-12 text-gray-400">
                История пока не реализована
            </div>
        </div>
    )
}

{/* ===== ТАБ ФАЙЛЫ ===== */ }
{
    activeTab === 'files' && (
        <div className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Файлы</h3>
            <div className="text-center py-12 text-gray-400">
                Файлы пока не реализованы
            </div>
        </div>
    )
}
            </div >
        </motion.div >
    );
};

export default DealInfoPanel;
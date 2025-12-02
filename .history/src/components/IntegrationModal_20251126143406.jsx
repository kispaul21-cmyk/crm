import React, { useState, useEffect } from 'react';
import { X, Key, Check, AlertCircle, Loader, ExternalLink } from 'lucide-react';
import { validateApiKey, saveDaDataApiKey, getDaDataApiKey } from '../services/DaDataService';
import { supabase } from '../supabase';

/**
 * Модальное окно настройки интеграции DaData
 * В стиле твоей CRM
 */
export const IntegrationModal = ({ isOpen, onClose, onSave }) => {
    const [apiKey, setApiKey] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [isValid, setIsValid] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Загружаем существующий API ключ при открытии
    useEffect(() => {
        if (isOpen) {
            loadExistingApiKey();
        }
    }, [isOpen]);

    const loadExistingApiKey = async () => {
        try {
            const key = await getDaDataApiKey(supabase);
            if (key) {
                setApiKey(key);
                setIsValid(true);
            }
        } catch (err) {
            console.error('Ошибка загрузки API ключа:', err);
        }
    };

    // Валидация API ключа
    const handleValidate = async () => {
        if (!apiKey.trim()) {
            setError('Введите API ключ');
            return;
        }

        setIsValidating(true);
        setError(null);
        setIsValid(null);

        try {
            const valid = await validateApiKey(apiKey.trim());
            setIsValid(valid);
            
            if (!valid) {
                setError('Неверный API ключ. Проверьте правильность ввода.');
            }
        } catch (err) {
            setError('Ошибка проверки ключа. Попробуйте позже.');
            setIsValid(false);
        } finally {
            setIsValidating(false);
        }
    };

    // Сохранение интеграции
    const handleSave = async () => {
        if (!isValid) {
            setError('Сначала проверьте валидность API ключа');
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            await saveDaDataApiKey(supabase, apiKey.trim());
            setSuccessMessage('Интеграция DaData успешно настроена! ✓');
            
            // Уведомляем родительский компонент
            if (onSave) {
                onSave();
            }

            // Закрываем модалку через 1.5 секунды
            setTimeout(() => {
                onClose();
                setSuccessMessage(null);
            }, 1500);
        } catch (err) {
            setError(err.message || 'Ошибка сохранения. Попробуйте снова.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden transform transition-all">
                
                {/* Заголовок */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Key size={24} className="text-blue-600" />
                            Настройка интеграции DaData
                        </h2>
                        <p className="text-xs text-gray-600 mt-1">
                            Автоматическое заполнение реквизитов компаний по ИНН
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-white hover:shadow-md rounded-full text-gray-400 hover:text-red-500 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Инструкция */}
                <div className="p-6 bg-blue-50 border-b border-blue-100">
                    <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                        <AlertCircle size={16} />
                        Как получить API ключ DaData:
                    </h3>
                    <ol className="text-xs text-blue-800 space-y-1.5 ml-6 list-decimal">
                        <li>Зарегистрируйтесь на сайте <a href="https://dadata.ru" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600 inline-flex items-center gap-1">dadata.ru <ExternalLink size={10} /></a></li>
                        <li>Подтвердите email (проверьте папку "Спам")</li>
                        <li>Откройте раздел <a href="https://dadata.ru/profile/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600 inline-flex items-center gap-1">"Профиль" <ExternalLink size={10} /></a></li>
                        <li>Скопируйте <strong>API ключ</strong> (строка из ~40 символов)</li>
                        <li>Бесплатно доступно <strong>10,000 запросов в день</strong></li>
                    </ol>
                </div>

                {/* Форма */}
                <div className="p-6 space-y-5">
                    
                    {/* Поле API ключа */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            API ключ DaData *
                        </label>
                        <div className="relative">
                            <Key className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={apiKey}
                                onChange={(e) => {
                                    setApiKey(e.target.value);
                                    setIsValid(null);
                                    setError(null);
                                }}
                                placeholder="Например: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"
                                className={`w-full pl-10 pr-12 py-3 bg-gray-50 border rounded-xl outline-none transition font-mono text-sm ${
                                    isValid === true ? 'border-green-500 bg-green-50 focus:ring-4 focus:ring-green-500/10' :
                                    isValid === false ? 'border-red-500 bg-red-50 focus:ring-4 focus:ring-red-500/10' :
                                    'border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10'
                                }`}
                                disabled={isValidating || isSaving}
                            />
                            
                            {/* Иконка статуса */}
                            {isValid === true && (
                                <div className="absolute right-3 top-3.5">
                                    <Check size={18} className="text-green-600" />
                                </div>
                            )}
                            {isValid === false && (
                                <div className="absolute right-3 top-3.5">
                                    <AlertCircle size={18} className="text-red-600" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Кнопка проверки */}
                    <button
                        onClick={handleValidate}
                        disabled={!apiKey.trim() || isValidating || isSaving}
                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                            isValidating 
                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                : isValid === true
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 active:scale-[0.98]'
                        }`}
                    >
                        {isValidating ? (
                            <>
                                <Loader size={18} className="animate-spin" />
                                Проверка ключа...
                            </>
                        ) : isValid === true ? (
                            <>
                                <Check size={18} />
                                Ключ валиден
                            </>
                        ) : (
                            'Проверить API ключ'
                        )}
                    </button>

                    {/* Сообщения об ошибках */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-red-900">Ошибка</p>
                                <p className="text-xs text-red-700 mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Сообщение об успехе */}
                    {successMessage && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                            <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-green-900">{successMessage}</p>
                            </div>
                        </div>
                    )}

                    {/* Информация о данных */}
                    {isValid === true && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <h4 className="text-xs font-bold text-blue-900 mb-2">Что будет заполняться автоматически:</h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-blue-800">
                                <div>✓ Полное название</div>
                                <div>✓ Краткое название</div>
                                <div>✓ ИНН, КПП, ОГРН</div>
                                <div>✓ Юридический адрес</div>
                                <div>✓ ФИО директора</div>
                                <div>✓ Должность директора</div>
                                <div>✓ Статус компании</div>
                                <div>✓ Дата регистрации</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Футер */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button 
                        onClick={onClose} 
                        disabled={isSaving}
                        className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-200 rounded-xl transition disabled:opacity-50"
                    >
                        Отмена
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={!isValid || isSaving}
                        className={`px-8 py-3 font-bold rounded-xl transition-all duration-200 flex items-center gap-2 ${
                            !isValid || isSaving
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transform active:scale-95'
                        }`}
                    >
                        {isSaving ? (
                            <>
                                <Loader size={18} className="animate-spin" />
                                Сохранение...
                            </>
                        ) : (
                            <>
                                <Check size={18} />
                                Сохранить интеграцию
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IntegrationModal;
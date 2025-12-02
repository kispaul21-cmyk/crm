import IntegrationModal from './IntegrationModal';
import React, { useState, useEffect, useRef } from 'react';
import { Trash2, GripVertical, Wand2, Plus, MessageSquare, Palette, ChevronDown, Settings, BarChart3, Building2, CheckSquare, TrendingUp, Plug, Type } from 'lucide-react';
import { supabase } from '../supabase';
import { Reorder } from 'framer-motion';
import { FONT_SIZES } from '../constants/fontSizes';

// Дефолтная палитра цветов для этапов
const DEFAULT_COLORS = [
    { id: 'border-red-500', bg: 'bg-red-500', hex: '#ef4444', name: 'Красный' },
    { id: 'border-orange-500', bg: 'bg-orange-500', hex: '#f97316', name: 'Оранжевый' },
    { id: 'border-amber-500', bg: 'bg-amber-500', hex: '#f59e0b', name: 'Янтарь' },
    { id: 'border-yellow-400', bg: 'bg-yellow-400', hex: '#facc15', name: 'Желтый' },
    { id: 'border-lime-500', bg: 'bg-lime-500', hex: '#84cc16', name: 'Лайм' },
    { id: 'border-green-500', bg: 'bg-green-500', hex: '#22c55e', name: 'Зеленый' },
    { id: 'border-emerald-500', bg: 'bg-emerald-500', hex: '#10b981', name: 'Изумруд' },
    { id: 'border-teal-500', bg: 'bg-teal-500', hex: '#14b8a6', name: 'Бирюза' },
];

// Палитра цветов для сообщений (10 цветов)
const MESSAGE_COLORS = [
    { id: 'red', bg: 'bg-red-600', text: 'text-white', name: 'Красный' },
    { id: 'orange', bg: 'bg-orange-600', text: 'text-white', name: 'Оранжевый' },
    { id: 'amber', bg: 'bg-amber-600', text: 'text-white', name: 'Янтарь' },
    { id: 'yellow', bg: 'bg-yellow-500', text: 'text-white', name: 'Жёлтый' },
    { id: 'green', bg: 'bg-green-600', text: 'text-white', name: 'Зелёный' },
    { id: 'teal', bg: 'bg-teal-600', text: 'text-white', name: 'Бирюзовый' },
    { id: 'blue', bg: 'bg-blue-600', text: 'text-white', name: 'Синий' },
    { id: 'indigo', bg: 'bg-indigo-600', text: 'text-white', name: 'Индиго' },
    { id: 'purple', bg: 'bg-purple-600', text: 'text-white', name: 'Пурпурный' },
    { id: 'pink', bg: 'bg-pink-600', text: 'text-white', name: 'Розовый' },
];

// Предустановленные цветовые палитры
const COLOR_GRADIENTS = [
    { name: '🌈 Радуга', colors: ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6'] },
    { name: '🔥 Огонь', colors: ['#7f1d1d', '#991b1b', '#dc2626', '#f87171', '#fca5a5', '#fecaca'] },
    { name: '🌊 Океан', colors: ['#1e3a8a', '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'] },
    { name: '🌲 Лес', colors: ['#14532d', '#166534', '#16a34a', '#22c55e', '#86efac', '#d1fae5'] },
    { name: '🌅 Закат', colors: ['#7c2d12', '#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa'] },
    { name: '💜 Фиолет', colors: ['#4c1d95', '#6d28d9', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ede9fe'] },
    { name: '🍒 Ягоды', colors: ['#881337', '#be123c', '#e11d48', '#fb7185', '#fda4af', '#fecdd3'] },
    { name: '🌿 Мята', colors: ['#064e3b', '#047857', '#10b981', '#34d399', '#6ee7b7', '#d1fae5'] },
    { name: '☀️ Солнце', colors: ['#713f12', '#a16207', '#ca8a04', '#eab308', '#facc15', '#fef08a'] },
    { name: '🌸 Сакура', colors: ['#831843', '#be185d', '#ec4899', '#f472b6', '#f9a8d4', '#fce7f3'] },
    { name: '🌌 Космос', colors: ['#1e1b4b', '#312e81', '#4c1d95', '#6d28d9', '#7c3aed', '#a78bfa'] },
    { name: '🍊 Цитрус', colors: ['#c2410c', '#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa'] },
];

const SETTINGS_SECTIONS = [
    { id: 'crm', name: 'CRM', icon: Settings },
    { id: 'tasks', name: 'Задачи', icon: CheckSquare },
    { id: 'companies', name: 'Компании', icon: Building2 },
    { id: 'analytics', name: 'Аналитика', icon: TrendingUp },
    { id: 'integrations', name: 'Интеграции', icon: Plug },
];

const SettingsView = ({ stages, onStagesChange }) => {
    const [activeSection, setActiveSection] = useState('crm');
    const [localStages, setLocalStages] = useState(stages);
    const [newName, setNewName] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [showGradientMenu, setShowGradientMenu] = useState(false);

    // Custom colors palette
    const [customColors, setCustomColors] = useState(() => {
        const saved = localStorage.getItem('customStageColors');
        {
            activeSection === 'tasks' && (
                <TasksSettings
                    reminderTime={reminderTime}
                    setReminderTime={setReminderTime}
                    soundEnabled={soundEnabled}
                    setSoundEnabled={setSoundEnabled}
                    showCompleted={showCompleted}
                    setShowCompleted={setShowCompleted}
                />
            )
        }

        {
            activeSection === 'companies' && (
                <CompaniesSettings
                    companySortBy={companySortBy}
                    setCompanySortBy={setCompanySortBy}
                    showLogos={showLogos}
                    setShowLogos={setShowLogos}
                />
            )
        }

        {
            activeSection === 'analytics' && (
                <AnalyticsSettings
                    analyticsPeriod={analyticsPeriod}
                    setAnalyticsPeriod={setAnalyticsPeriod}
                />
            )
        }

        {
            activeSection === 'integrations' && (
                <IntegrationsSettings
                    onOpenModal={() => setIsIntegrationModalOpen(true)}
                />
            )
        }
            </div >

    {/* Integration Modal */ }
    < IntegrationModal
isOpen = { isIntegrationModalOpen }
onClose = {() => setIsIntegrationModalOpen(false)}
onSave = {() => {
    console.log('Интеграция DaData настроена');
}}
            />
        </div >
    );
};

// Tasks Settings Component
const TasksSettings = ({ reminderTime, setReminderTime, soundEnabled, setSoundEnabled, showCompleted, setShowCompleted }) => (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Настройки задач</h2>
            <p className="text-sm text-gray-500">Управление напоминаниями и отображением задач</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            {/* Reminder Time */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Время напоминания по умолчанию</label>
                <select
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition"
                >
                    <option value="15">За 15 минут</option>
                    <option value="30">За 30 минут</option>
                    <option value="60">За 1 час</option>
                    <option value="180">За 3 часа</option>
                    <option value="1440">За 1 день</option>
                </select>
            </div>

            {/* Sound Notifications */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-gray-700">Звуковые уведомления</h3>
                    <p className="text-xs text-gray-500 mt-1">Воспроизводить звук при напоминаниях</p>
                </div>
                <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`relative w-12 h-6 rounded-full transition ${soundEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${soundEnabled ? 'translate-x-6' : ''}`} />
                </button>
            </div>

            {/* Show Completed */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-gray-700">Показывать выполненные задачи</h3>
                    <p className="text-xs text-gray-500 mt-1">Отображать завершённые задачи в списке</p>
                </div>
                <button
                    onClick={() => setShowCompleted(!showCompleted)}
                    className={`relative w-12 h-6 rounded-full transition ${showCompleted ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${showCompleted ? 'translate-x-6' : ''}`} />
                </button>
            </div>
        </div>
    </div>
);

// Companies Settings Component
const CompaniesSettings = ({ companySortBy, setCompanySortBy, showLogos, setShowLogos }) => (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Настройки компаний</h2>
            <p className="text-sm text-gray-500">Управление отображением списка компаний</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            {/* Sort By */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Сортировка по умолчанию</label>
                <select
                    value={companySortBy}
                    onChange={(e) => setCompanySortBy(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition"
                >
                    <option value="name">По названию (А-Я)</option>
                    <option value="created_at">По дате создания</option>
                    <option value="deals_count">По количеству сделок</option>
                </select>
            </div>

            {/* Show Logos */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-gray-700">Показывать логотипы</h3>
                    <p className="text-xs text-gray-500 mt-1">Отображать логотипы компаний в списке</p>
                </div>
                <button
                    onClick={() => setShowLogos(!showLogos)}
                    className={`relative w-12 h-6 rounded-full transition ${showLogos ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${showLogos ? 'translate-x-6' : ''}`} />
                </button>
            </div>
        </div>
    </div>
);

// Analytics Settings Component
const AnalyticsSettings = ({ analyticsPeriod, setAnalyticsPeriod }) => (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Настройки аналитики</h2>
            <p className="text-sm text-gray-500">Управление отображением аналитических данных</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            {/* Period */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Период по умолчанию</label>
                <select
                    value={analyticsPeriod}
                    onChange={(e) => setAnalyticsPeriod(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition"
                >
                    <option value="week">Неделя</option>
                    <option value="month">Месяц</option>
                    <option value="quarter">Квартал</option>
                    <option value="year">Год</option>
                </select>
            </div>
        </div>
    </div>
);

// Integrations Settings Component
const IntegrationsSettings = ({ onOpenModal }) => (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Интеграции</h2>
            <p className="text-sm text-gray-500">Подключение внешних сервисов для автоматизации</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            {/* DaData Integration */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                        <Plug size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-800">DaData</h3>
                        <p className="text-xs text-gray-600 mt-0.5">Автозаполнение реквизитов компаний по ИНН</p>
                    </div>
                </div>
                <button
                    onClick={onOpenModal}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                >
                    Настроить
                </button>
            </div>

            {/* Placeholder для будущих интеграций */}
            <div className="p-6 border-2 border-dashed border-gray-200 rounded-xl text-center">
                <p className="text-sm text-gray-400">Другие интеграции появятся здесь</p>
            </div>
        </div>
    </div>
);

export default SettingsView;
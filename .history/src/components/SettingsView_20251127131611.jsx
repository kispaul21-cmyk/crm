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
        return saved ? JSON.parse(saved) : DEFAULT_COLORS;
    });

    const colorPickerRef = useRef(null);
    const [editingColorIndex, setEditingColorIndex] = useState(null);

   // Message colors
    const [myMessageColor, setMyMessageColor] = useState(
        localStorage.getItem('myMessageColor') || 'blue'
    );
    const [incomingMessageColor, setIncomingMessageColor] = useState(
        localStorage.getItem('incomingMessageColor') || 'purple'
    );

    // Font size settings - CRM Global
    const [crmGlobalFontSize, setCrmGlobalFontSize] = useState(
        localStorage.getItem('crmGlobalFontSize') || 'm'
    );
    const [crmApplySidebar, setCrmApplySidebar] = useState(
        localStorage.getItem('crmApplySidebar') !== 'false'
    );
    const [crmApplyPipeline, setCrmApplyPipeline] = useState(
        localStorage.getItem('crmApplyPipeline') !== 'false'
    );
    const [crmApplyRightPanel, setCrmApplyRightPanel] = useState(
        localStorage.getItem('crmApplyRightPanel') !== 'false'
    );
    const [crmApplyChatHeader, setCrmApplyChatHeader] = useState(
        localStorage.getItem('crmApplyChatHeader') !== 'false'
    );

    // Font size settings - Chat Messages
    const [chatIncomingFontSize, setChatIncomingFontSize] = useState(
        localStorage.getItem('chatIncomingFontSize') || 'm'
    );
    const [chatOutgoingFontSize, setChatOutgoingFontSize] = useState(
        localStorage.getItem('chatOutgoingFontSize') || 'm'
    );
    const [chatEmojiSize, setChatEmojiSize] = useState(
        localStorage.getItem('chatEmojiSize') || 'm'
    );

    // Task settings
    const [reminderTime, setReminderTime] = useState(
        localStorage.getItem('taskReminderTime') || '60'
    );
    const [soundEnabled, setSoundEnabled] = useState(
        localStorage.getItem('taskSoundEnabled') !== 'false'
    );
    const [showCompleted, setShowCompleted] = useState(
        localStorage.getItem('taskShowCompleted') !== 'false'
    );

    // Company settings
    const [companySortBy, setCompanySortBy] = useState(
        localStorage.getItem('companySortBy') || 'name'
    );
    const [showLogos, setShowLogos] = useState(
        localStorage.getItem('companyShowLogos') !== 'false'
    );

    // Analytics settings
    const [analyticsPeriod, setAnalyticsPeriod] = useState(
        localStorage.getItem('analyticsPeriod') || 'month'
    );

    // Integration modal state
    const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);

    useEffect(() => { setLocalStages(stages); }, [stages]);

    // Save custom colors to localStorage
    useEffect(() => {
        localStorage.setItem('customStageColors', JSON.stringify(customColors));
    }, [customColors]);

    // Save message colors to localStorage
    useEffect(() => {
        localStorage.setItem('myMessageColor', myMessageColor);
        window.dispatchEvent(new CustomEvent('messageColorsChanged'));
    }, [myMessageColor]);

    useEffect(() => {
        localStorage.setItem('incomingMessageColor', incomingMessageColor);
        window.dispatchEvent(new CustomEvent('messageColorsChanged'));
    }, [incomingMessageColor]);

    // Save task settings
    useEffect(() => {
        localStorage.setItem('taskReminderTime', reminderTime);
    }, [reminderTime]);

    useEffect(() => {
        localStorage.setItem('taskSoundEnabled', soundEnabled);
    }, [soundEnabled]);

    useEffect(() => {
        localStorage.setItem('taskShowCompleted', showCompleted);
    }, [showCompleted]);

    // Save company settings
    useEffect(() => {
        localStorage.setItem('companySortBy', companySortBy);
    }, [companySortBy]);

    useEffect(() => {
        localStorage.setItem('companyShowLogos', showLogos);
    }, [showLogos]);

    // Save analytics settings
    useEffect(() => {
        localStorage.setItem('analyticsPeriod', analyticsPeriod);
    }, [analyticsPeriod]);

    // Handle color picker change
    const handleColorChange = (e) => {
        if (editingColorIndex === null) return;
        const newHex = e.target.value;
        const updatedColors = [...customColors];
        updatedColors[editingColorIndex] = {
            ...updatedColors[editingColorIndex],
            hex: newHex,
        };
        setCustomColors(updatedColors);
    };

    // Add new custom color
    const addCustomColor = () => {
        if (customColors.length >= 12) {
            alert('Максимум 12 цветов');
            return;
        }
        const newColor = {
            id: `border-custom-${Date.now()}`,
            bg: `bg-custom-${Date.now()}`,
            hex: '#3b82f6',
            name: 'Новый цвет'
        };
        setCustomColors([...customColors, newColor]);
    };

    // Delete custom color
    const deleteCustomColor = (index) => {
        if (customColors.length <= 4) {
            alert('Минимум 4 цвета');
            return;
        }
        const updated = customColors.filter((_, i) => i !== index);
        setCustomColors(updated);
    };

    // Apply gradient
    const applyGradient = (colors) => {
        const newColors = colors.map((hex, idx) => ({
            id: `border-gradient-${idx}`,
            bg: `bg-gradient-${idx}`,
            hex,
            name: `Градиент ${idx + 1}`
        }));
        setCustomColors(newColors);
        setShowGradientMenu(false);
    };

    // Reorder stages
    const reorderStages = async (newOrder) => {
        setLocalStages(newOrder);
        const updates = newOrder.map((s, idx) => ({ id: s.id, position: idx + 1 }));
        for (const upd of updates) {
            await supabase.from('stages').update({ position: upd.position }).eq('id', upd.id);
        }
        onStagesChange();
    };

    const addStage = async () => {
        if (!newName.trim()) return;
        const nextPosition = Math.max(...localStages.map(s => s.position || 0), 0) + 1;
        const chosenColor = selectedColor || customColors[0]?.hex || '#3b82f6';
        await supabase.from('stages').insert([{ name: newName, color: chosenColor, position: nextPosition }]);
        setNewName('');
        setSelectedColor('');
        onStagesChange();
    };

    const deleteStage = async (id) => {
        if (!confirm('Удалить этап?')) return;
        await supabase.from('stages').delete().eq('id', id);
        onStagesChange();
    };

    const updateStageColor = async (id, color) => {
        await supabase.from('stages').update({ color }).eq('id', id);
        onStagesChange();
    };

    return (
        <div className="flex-1 flex bg-[#eef1f5] overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 p-6 overflow-y-auto">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Настройки</h2>
                <nav className="space-y-2">
                    {SETTINGS_SECTIONS.map(section => {
                        const Icon = section.icon;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeSection === section.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <Icon size={20} />
                                <span>{section.name}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
                {activeSection === 'crm' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Настройки CRM</h2>
                            <p className="text-sm text-gray-500">Управление этапами воронки продаж</p>
                        </div>

                        {/* Stages List */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Этапы сделок</h3>
                            <Reorder.Group axis="y" values={localStages} onReorder={reorderStages} className="space-y-2">
                                {localStages.map(stage => (
                                    <Reorder.Item key={stage.id} value={stage}>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-move hover:bg-gray-100 transition">
                                            <GripVertical size={18} className="text-gray-400" />
                                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: stage.color }}></div>
                                            <span className="flex-1 font-medium text-slate-700">{stage.name}</span>

                                            {/* Color Picker */}
                                            <div className="relative">
                                                <input
                                                    type="color"
                                                    value={stage.color}
                                                    onChange={(e) => updateStageColor(stage.id, e.target.value)}
                                                    className="w-8 h-8 rounded cursor-pointer border-2 border-gray-300"
                                                    title="Изменить цвет"
                                                />
                                            </div>

                                            <button onClick={() => deleteStage(stage.id)} className="text-red-400 hover:text-red-600 p-1 transition">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>

                            {/* Add New Stage */}
                            <div className="mt-4 flex gap-3">
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder="Название нового этапа..."
                                    className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition"
                                />
                                <input
                                    type="color"
                                    value={selectedColor || customColors[0]?.hex || '#3b82f6'}
                                    onChange={e => setSelectedColor(e.target.value)}
                                    className="w-12 h-12 rounded-xl cursor-pointer border-2 border-gray-300"
                                />
                                <button
                                    onClick={addStage}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition flex items-center gap-2"
                                >
                                    <Plus size={18} />
                                    Добавить
                                </button>
                            </div>
                        </div>

                        {/* Color Palette Manager */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2">
                                    <Palette size={16} />
                                    Палитра цветов
                                </h3>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowGradientMenu(!showGradientMenu)}
                                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-lg hover:shadow-lg transition flex items-center gap-2"
                                    >
                                        <Wand2 size={14} />
                                        Градиенты
                                        <ChevronDown size={14} />
                                    </button>
                                    {showGradientMenu && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-10 p-2 max-h-80 overflow-y-auto">
                                            {COLOR_GRADIENTS.map((grad, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => applyGradient(grad.colors)}
                                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition flex items-center gap-3"
                                                >
                                                    <div className="flex gap-0.5">
                                                        {grad.colors.slice(0, 6).map((c, i) => (
                                                            <div key={i} className="w-4 h-4 rounded" style={{ backgroundColor: c }}></div>
                                                        ))}
                                                    </div>
                                                    <span className="text-xs font-medium">{grad.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-8 gap-3">
                                {customColors.map((color, idx) => (
                                    <div key={idx} className="group relative">
                                        <input
                                            ref={idx === editingColorIndex ? colorPickerRef : null}
                                            type="color"
                                            value={color.hex}
                                            onChange={handleColorChange}
                                            onFocus={() => setEditingColorIndex(idx)}
                                            onBlur={() => setEditingColorIndex(null)}
                                            className="w-full h-12 rounded-xl cursor-pointer border-2 border-gray-300 hover:border-blue-500 transition"
                                        />
                                        {customColors.length > 4 && (
                                            <button
                                                onClick={() => deleteCustomColor(idx)}
                                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs font-bold"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {customColors.length < 12 && (
                                    <button
                                        onClick={addCustomColor}
                                        className="h-12 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition text-gray-400 hover:text-blue-600"
                                    >
                                        <Plus size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'chat' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Настройки чата</h2>
                            <p className="text-sm text-gray-500">Цвета сообщений и оформление</p>
                        </div>

                        {/* My Messages */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Мои сообщения</h3>
                            <div className="flex gap-2 mb-4 flex-wrap">
                                {MESSAGE_COLORS.map(color => (
                                    <button
                                        key={color.id}
                                        onClick={() => setMyMessageColor(color.id)}
                                        className={`w-8 h-8 rounded-full ${color.bg} transition-all hover:scale-110 ${myMessageColor === color.id ? 'ring-2 ring-offset-2 ring-blue-400 scale-110' : ''
                                            }`}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                            {/* Preview */}
                            <div className="flex justify-end">
                                <div className={`${MESSAGE_COLORS.find(c => c.id === myMessageColor)?.bg} ${MESSAGE_COLORS.find(c => c.id === myMessageColor)?.text} px-3 py-2 rounded-2xl rounded-tr-none text-xs shadow-sm`}>
                                    Пример сообщения
                                </div>
                            </div>
                        </div>

                        {/* Incoming Messages */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Входящие сообщения</h3>
                            <div className="flex gap-2 mb-4 flex-wrap">
                                {MESSAGE_COLORS.map(color => (
                                    <button
                                        key={color.id}
                                        onClick={() => setIncomingMessageColor(color.id)}
                                        className={`w-8 h-8 rounded-full ${color.bg} transition-all hover:scale-110 ${incomingMessageColor === color.id ? 'ring-2 ring-offset-2 ring-purple-400 scale-110' : ''
                                            }`}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                            {/* Preview */}
                            <div className="flex justify-start">
                                <div className={`${MESSAGE_COLORS.find(c => c.id === incomingMessageColor)?.bg} ${MESSAGE_COLORS.find(c => c.id === incomingMessageColor)?.text} px-3 py-2 rounded-2xl rounded-tl-none text-xs shadow-sm`}>
                                    Пример сообщения
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'tasks' && (
                    <TasksSettings
                        reminderTime={reminderTime}
                        setReminderTime={setReminderTime}
                        soundEnabled={soundEnabled}
                        setSoundEnabled={setSoundEnabled}
                        showCompleted={showCompleted}
                        setShowCompleted={setShowCompleted}
                    />
                )}

                {activeSection === 'companies' && (
                    <CompaniesSettings
                        companySortBy={companySortBy}
                        setCompanySortBy={setCompanySortBy}
                        showLogos={showLogos}
                        setShowLogos={setShowLogos}
                    />
                )}

                {activeSection === 'analytics' && (
                    <AnalyticsSettings
                        analyticsPeriod={analyticsPeriod}
                        setAnalyticsPeriod={setAnalyticsPeriod}
                    />
                )}

                {activeSection === 'integrations' && (
                    <IntegrationsSettings
                        onOpenModal={() => setIsIntegrationModalOpen(true)}
                    />
                )}
            </div>

            {/* Integration Modal */}
            <IntegrationModal
                isOpen={isIntegrationModalOpen}
                onClose={() => setIsIntegrationModalOpen(false)}
                onSave={() => {
                    console.log('Интеграция DaData настроена');
                }}
            />
        </div>
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
import React, { useState, useEffect, useRef } from 'react';
import { Trash2, GripVertical, Wand2, Plus, MessageSquare, Palette, ChevronDown, Settings, BarChart3, Building2, CheckSquare, TrendingUp } from 'lucide-react';
import { supabase } from '../supabase';
import { Reorder } from 'framer-motion';

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
    { id: 'chat', name: 'Чат', icon: MessageSquare },
    { id: 'tasks', name: 'Задачи', icon: CheckSquare },
    { id: 'companies', name: 'Компании', icon: Building2 },
    { id: 'analytics', name: 'Аналитика', icon: TrendingUp },
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
            id: `custom-${Date.now()}`,
            bg: '',
            hex: '#3b82f6',
            name: 'Новый цвет'
        };
        setCustomColors([...customColors, newColor]);
    };

    // Remove custom color
    const removeCustomColor = (index) => {
        if (customColors.length <= 4) {
            alert('Минимум 4 цвета');
            return;
        }
        setCustomColors(customColors.filter((_, i) => i !== index));
    };

    // Reset to default colors
    const resetColors = () => {
        if (confirm('Сбросить цвета к стандартным?')) {
            setCustomColors(DEFAULT_COLORS);
        }
    };

    // --- ЛОГИКА СОРТИРОВКИ (FRAMER MOTION) ---
    const handleReorder = (newOrder) => {
        setLocalStages(newOrder);
        saveNewOrder(newOrder);
    };

    const saveNewOrder = async (newStages) => {
        const updates = newStages.map((s, index) => ({ ...s, position: index + 1 }));
        await Promise.all(
            updates.map(item =>
                supabase.from('stages').update({ position: item.position }).eq('id', item.id)
            )
        );
        onStagesChange();
    };

    // --- АВТО-ГРАДИЕНТ ---
    const applyAutoGradient = async () => {
        const total = localStages.length;
        const updated = localStages.map((s, i) => {
            const colorIndex = Math.floor((i / (total - 1 || 1)) * (customColors.length - 1));
            return { ...s, color: customColors[colorIndex]?.hex || customColors[0].hex };
        });

        setLocalStages(updated);
        for (const s of updated) await supabase.from('stages').update({ color: s.color }).eq('id', s.id);
        onStagesChange();
        setShowGradientMenu(false);
    };

    // Применить предустановленный градиент
    const applyPresetGradient = async (gradientColors) => {
        // Сначала обновляем палитру цветов
        const newColors = gradientColors.map((hex, index) => ({
            id: `gradient-${Date.now()}-${index}`,
            bg: '',
            hex: hex,
            name: `Цвет ${index + 1}`
        }));

        setCustomColors(newColors);

        // Теперь применяем эти цвета к этапам
        const total = localStages.length;
        const updated = localStages.map((s, i) => {
            const colorIndex = Math.floor((i / (total - 1 || 1)) * (newColors.length - 1));
            return { ...s, color: newColors[colorIndex].hex };
        });

        setLocalStages(updated);
        for (const s of updated) await supabase.from('stages').update({ color: s.color }).eq('id', s.id);
        onStagesChange();
        setShowGradientMenu(false);
    };

    // --- ДОБАВЛЕНИЕ / УДАЛЕНИЕ ---
    const addNewStage = async () => {
        if (!newName) return;
        const colorToUse = selectedColor || customColors[0].hex;
        await supabase.from('stages').insert([{ name: newName, color: colorToUse, position: localStages.length + 1 }]);
        setNewName('');
        setSelectedColor('');
        onStagesChange();
    };

    const deleteStage = async (id) => {
        if (confirm('Удалить этап?')) { await supabase.from('stages').delete().eq('id', id); onStagesChange(); }
    };

    const updateColor = async (id, color) => {
        const updated = localStages.map(s => s.id === id ? { ...s, color } : s);
        setLocalStages(updated);
        await supabase.from('stages').update({ color }).eq('id', id);
        onStagesChange();
    };

    return (
        <div className="flex h-full bg-gray-50">
            {/* Left Sidebar - Sections */}
            <div className="w-72 bg-white border-r border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">Настройки</h1>
                <div className="space-y-2">
                    {SETTINGS_SECTIONS.map(section => {
                        const Icon = section.icon;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeSection === section.id
                                        ? 'bg-blue-50 text-blue-700 font-semibold'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon size={20} />
                                <span>{section.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Right Panel - Settings Content */}
            <div className="flex-1 overflow-y-auto p-8">
                {activeSection === 'crm' && (
                    <CRMSettings
                        localStages={localStages}
                        customColors={customColors}
                        newName={newName}
                        setNewName={setNewName}
                        selectedColor={selectedColor}
                        setSelectedColor={setSelectedColor}
                        showGradientMenu={showGradientMenu}
                        setShowGradientMenu={setShowGradientMenu}
                        handleReorder={handleReorder}
                        applyAutoGradient={applyAutoGradient}
                        applyPresetGradient={applyPresetGradient}
                        addNewStage={addNewStage}
                        deleteStage={deleteStage}
                        updateColor={updateColor}
                        editingColorIndex={editingColorIndex}
                        setEditingColorIndex={setEditingColorIndex}
                        handleColorChange={handleColorChange}
                        addCustomColor={addCustomColor}
                        removeCustomColor={removeCustomColor}
                        resetColors={resetColors}
                    />
                )}

                {activeSection === 'chat' && (
                    <ChatSettings
                        myMessageColor={myMessageColor}
                        setMyMessageColor={setMyMessageColor}
                        incomingMessageColor={incomingMessageColor}
                        setIncomingMessageColor={setIncomingMessageColor}
                    />
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
            </div>
        </div>
    );
};

// CRM Settings Component
const CRMSettings = ({ localStages, customColors, newName, setNewName, selectedColor, setSelectedColor, showGradientMenu, setShowGradientMenu, handleReorder, applyAutoGradient, applyPresetGradient, addNewStage, deleteStage, updateColor, editingColorIndex, setEditingColorIndex, handleColorChange, addCustomColor, removeCustomColor, resetColors }) => (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Воронка продаж</h2>
            <p className="text-sm text-gray-500">Настройте этапы и цвета вашей воронки продаж</p>
        </div>

        {/* Gradient Menu */}
        <div className="flex justify-between items-center">
            <div className="relative">
                <button
                    onClick={() => setShowGradientMenu(!showGradientMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition shadow-sm font-medium"
                >
                    <Wand2 size={16} /> Авто-цвета
                    <ChevronDown size={14} className={`transition-transform ${showGradientMenu ? 'rotate-180' : ''}`} />
                </button>

                {showGradientMenu && (
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg z-10 overflow-hidden">
                        <div className="p-2 space-y-1">
                            <button
                                onClick={applyAutoGradient}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 text-sm font-medium text-gray-700 transition"
                            >
                                ✨ Текущая палитра
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            {COLOR_GRADIENTS.map((gradient, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => applyPresetGradient(gradient.colors)}
                                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 transition group"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">{gradient.name}</span>
                                        <div className="flex gap-0.5">
                                            {gradient.colors.slice(0, 5).map((color, i) => (
                                                <div
                                                    key={i}
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Custom Color Palette */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Palette size={16} className="text-purple-600" />
                    <h3 className="text-sm font-bold text-gray-700">Палитра цветов</h3>
                </div>
                <button onClick={resetColors} className="text-xs text-gray-500 hover:text-purple-600 transition">
                    Сбросить
                </button>
            </div>
            <div className="flex gap-2 flex-wrap">
                {customColors.map((color, index) => (
                    <div key={color.id} className="relative group">
                        <input
                            type="color"
                            value={color.hex}
                            onChange={handleColorChange}
                            onFocus={() => setEditingColorIndex(index)}
                            onBlur={() => setEditingColorIndex(null)}
                            className="absolute opacity-0 w-0 h-0"
                            id={`color-picker-${index}`}
                        />
                        <label
                            htmlFor={`color-picker-${index}`}
                            className="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-200 hover:border-purple-400 transition block"
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                        />
                        {customColors.length > 4 && (
                            <button
                                onClick={() => removeCustomColor(index)}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                            >
                                ×
                            </button>
                        )}
                    </div>
                ))}
                {customColors.length < 12 && (
                    <button
                        onClick={addCustomColor}
                        className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50 transition flex items-center justify-center text-gray-400 hover:text-purple-600"
                        title="Добавить цвет"
                    >
                        <Plus size={20} />
                    </button>
                )}
            </div>
        </div>

        {/* Add Stage Form */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Название этапа</label>
                    <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Например: Согласование" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition" />
                </div>
                <div className="hidden md:block">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Цвет</label>
                    <div className="flex gap-1 p-2 bg-gray-50 rounded-xl border border-gray-200">
                        {customColors.slice(0, 8).map(c => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedColor(c.hex)}
                                className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${selectedColor === c.hex ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                                style={{ backgroundColor: c.hex }}
                                title={c.name}
                            />
                        ))}
                    </div>
                </div>
                <button onClick={addNewStage} className="h-[50px] bg-blue-600 text-white px-6 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition flex items-center gap-2">
                    <Plus size={20} /> Добавить
                </button>
            </div>
        </div>

        {/* Stages List */}
        <Reorder.Group axis="y" values={localStages} onReorder={handleReorder} className="space-y-3">
            {localStages.map((stage) => {
                return (
                    <Reorder.Item
                        key={stage.id}
                        value={stage}
                        whileDrag={{ scale: 1.02, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
                        className="group flex items-center gap-4 p-4 bg-white rounded-xl border shadow-sm cursor-grab active:cursor-grabbing border-l-[6px] select-none"
                        style={{ borderLeftColor: stage.color || '#6b7280' }}
                    >
                        <div className="text-gray-300 group-hover:text-gray-500">
                            <GripVertical size={20} />
                        </div>

                        <span className="flex-1 font-bold text-slate-700 text-lg">{stage.name}</span>

                        {/* Quick colors */}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-4">
                            {customColors.slice(0, 5).map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => updateColor(stage.id, c.hex)}
                                    className="w-4 h-4 rounded-full hover:scale-125 transition"
                                    style={{ backgroundColor: c.hex }}
                                />
                            ))}
                        </div>

                        <button onClick={() => deleteStage(stage.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                            <Trash2 size={18} />
                        </button>
                    </Reorder.Item>
                );
            })}
        </Reorder.Group>
    </div>
);

// Chat Settings Component
const ChatSettings = ({ myMessageColor, setMyMessageColor, incomingMessageColor, setIncomingMessageColor }) => (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Цвета сообщений</h2>
            <p className="text-sm text-gray-500">Настройте цвета для ваших сообщений и входящих</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </div>
);

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

export default SettingsView;
import React, { useState, useEffect } from 'react';
import { Trash2, GripVertical, Wand2, Plus, MessageSquare } from 'lucide-react';
import { supabase } from '../supabase';
import { Reorder } from 'framer-motion';

// Палитра цветов для этапов
const COLORS = [
    { id: 'border-red-500', bg: 'bg-red-500', name: 'Красный' },
    { id: 'border-orange-500', bg: 'bg-orange-500', name: 'Оранжевый' },
    { id: 'border-amber-500', bg: 'bg-amber-500', name: 'Янтарь' },
    { id: 'border-yellow-400', bg: 'bg-yellow-400', name: 'Желтый' },
    { id: 'border-lime-500', bg: 'bg-lime-500', name: 'Лайм' },
    { id: 'border-green-500', bg: 'bg-green-500', name: 'Зеленый' },
    { id: 'border-emerald-500', bg: 'bg-emerald-500', name: 'Изумруд' },
    { id: 'border-teal-500', bg: 'bg-teal-500', name: 'Бирюза' },
    { id: 'border-cyan-500', bg: 'bg-cyan-500', name: 'Циан' },
    { id: 'border-sky-500', bg: 'bg-sky-500', name: 'Небо' },
    { id: 'border-blue-600', bg: 'bg-blue-600', name: 'Синий' },
    { id: 'border-indigo-500', bg: 'bg-indigo-500', name: 'Индиго' },
    { id: 'border-violet-500', bg: 'bg-violet-500', name: 'Фиолет' },
    { id: 'border-purple-600', bg: 'bg-purple-600', name: 'Пурпур' },
    { id: 'border-fuchsia-500', bg: 'bg-fuchsia-500', name: 'Фуксия' },
    { id: 'border-pink-500', bg: 'bg-pink-500', name: 'Розовый' },
    { id: 'border-rose-500', bg: 'bg-rose-500', name: 'Роза' },
    { id: 'border-gray-500', bg: 'bg-gray-500', name: 'Серый' },
];

// Палитра цветов для сообщений
const MESSAGE_COLORS = [
    { id: 'blue', bg: 'bg-blue-600', text: 'text-white', name: 'Синий' },
    { id: 'purple', bg: 'bg-purple-600', text: 'text-white', name: 'Пурпурный' },
    { id: 'green', bg: 'bg-green-600', text: 'text-white', name: 'Зелёный' },
    { id: 'red', bg: 'bg-red-600', text: 'text-white', name: 'Красный' },
    { id: 'orange', bg: 'bg-orange-600', text: 'text-white', name: 'Оранжевый' },
    { id: 'pink', bg: 'bg-pink-600', text: 'text-white', name: 'Розовый' },
    { id: 'teal', bg: 'bg-teal-600', text: 'text-white', name: 'Бирюзовый' },
    { id: 'indigo', bg: 'bg-indigo-600', text: 'text-white', name: 'Индиго' },
    { id: 'slate', bg: 'bg-slate-700', text: 'text-white', name: 'Серый' },
];

const SettingsView = ({ stages, onStagesChange }) => {
    const [localStages, setLocalStages] = useState(stages);
    const [newName, setNewName] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[0].id);

    // Message colors
    const [myMessageColor, setMyMessageColor] = useState(
        localStorage.getItem('myMessageColor') || 'blue'
    );
    const [incomingMessageColor, setIncomingMessageColor] = useState(
        localStorage.getItem('incomingMessageColor') || 'purple'
    );

    useEffect(() => { setLocalStages(stages); }, [stages]);

    // Save message colors to localStorage
    useEffect(() => {
        localStorage.setItem('myMessageColor', myMessageColor);
        // Trigger custom event to notify CrmChat
        window.dispatchEvent(new CustomEvent('messageColorsChanged'));
    }, [myMessageColor]);

    useEffect(() => {
        localStorage.setItem('incomingMessageColor', incomingMessageColor);
        window.dispatchEvent(new CustomEvent('messageColorsChanged'));
    }, [incomingMessageColor]);

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
        const gradientColors = [
            'border-red-500', 'border-orange-500', 'border-amber-500',
            'border-yellow-400', 'border-lime-500', 'border-green-500',
            'border-emerald-500', 'border-teal-500', 'border-cyan-500',
            'border-sky-500', 'border-blue-600', 'border-indigo-500', 'border-violet-500'
        ];

        const total = localStages.length;
        const updated = localStages.map((s, i) => {
            const colorIndex = Math.floor((i / (total - 1 || 1)) * (gradientColors.length - 1));
            return { ...s, color: gradientColors[colorIndex] || 'border-gray-500' };
        });

        setLocalStages(updated);
        for (const s of updated) await supabase.from('stages').update({ color: s.color }).eq('id', s.id);
        onStagesChange();
    };

    // --- ДОБАВЛЕНИЕ / УДАЛЕНИЕ ---
    const addNewStage = async () => {
        if (!newName) return;
        await supabase.from('stages').insert([{ name: newName, color: selectedColor, position: localStages.length + 1 }]);
        setNewName(''); onStagesChange();
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
        <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* ========================================================================
                    СЕКЦИЯ: ЦВЕТА СООБЩЕНИЙ
                ======================================================================== */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <MessageSquare size={20} className="text-blue-600" />
                        <h1 className="text-2xl font-bold text-slate-800">Цвета сообщений</h1>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">Выберите цвета для ваших сообщений и входящих сообщений.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Мои сообщения */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-700 mb-4">Мои сообщения</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {MESSAGE_COLORS.map(color => (
                                    <button
                                        key={color.id}
                                        onClick={() => setMyMessageColor(color.id)}
                                        className={`h-12 rounded-xl ${color.bg} ${color.text} font-medium transition-all hover:scale-105 ${myMessageColor === color.id ? 'ring-4 ring-offset-2 ring-blue-400 scale-105' : ''
                                            }`}
                                        title={color.name}
                                    >
                                        {myMessageColor === color.id && '✓'}
                                    </button>
                                ))}
                            </div>
                            {/* Preview */}
                            <div className="mt-4 flex justify-end">
                                <div className={`${MESSAGE_COLORS.find(c => c.id === myMessageColor)?.bg} ${MESSAGE_COLORS.find(c => c.id === myMessageColor)?.text} p-3 rounded-2xl rounded-tr-none text-sm shadow-sm max-w-[80%]`}>
                                    Пример моего сообщения
                                </div>
                            </div>
                        </div>

                        {/* Входящие сообщения */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-700 mb-4">Входящие сообщения</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {MESSAGE_COLORS.map(color => (
                                    <button
                                        key={color.id}
                                        onClick={() => setIncomingMessageColor(color.id)}
                                        className={`h-12 rounded-xl ${color.bg} ${color.text} font-medium transition-all hover:scale-105 ${incomingMessageColor === color.id ? 'ring-4 ring-offset-2 ring-purple-400 scale-105' : ''
                                            }`}
                                        title={color.name}
                                    >
                                        {incomingMessageColor === color.id && '✓'}
                                    </button>
                                ))}
                            </div>
                            {/* Preview */}
                            <div className="mt-4 flex justify-start">
                                <div className={`${MESSAGE_COLORS.find(c => c.id === incomingMessageColor)?.bg} ${MESSAGE_COLORS.find(c => c.id === incomingMessageColor)?.text} p-3 rounded-2xl rounded-tl-none text-sm shadow-sm max-w-[80%]`}>
                                    Пример входящего сообщения
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========================================================================
                    СЕКЦИЯ: ВОРОНКА ПРОДАЖ
                ======================================================================== */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Воронка продаж</h1>
                            <p className="text-sm text-gray-500 mt-1">Перетащите, чтобы изменить порядок этапов.</p>
                        </div>
                        <button onClick={applyAutoGradient} className="flex items-center gap-2 px-4 py-2 bg-white border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition shadow-sm font-medium">
                            <Wand2 size={16} /> Авто-цвета
                        </button>
                    </div>

                    {/* Форма добавления */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-6">
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Название этапа</label>
                                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Например: Согласование" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition" />
                            </div>
                            <div className="hidden md:block">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Цвет</label>
                                <div className="flex gap-1 p-2 bg-gray-50 rounded-xl border border-gray-200">
                                    {COLORS.slice(0, 8).map(c => (
                                        <button key={c.id} onClick={() => setSelectedColor(c.id)} className={`w-6 h-6 rounded-full ${c.bg} transition-transform hover:scale-110 ${selectedColor === c.id ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`} title={c.name} />
                                    ))}
                                </div>
                            </div>
                            <button onClick={addNewStage} className="h-[50px] bg-blue-600 text-white px-6 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition flex items-center gap-2">
                                <Plus size={20} /> Добавить
                            </button>
                        </div>
                    </div>

                    {/* ИНТЕРАКТИВНЫЙ СПИСОК (REORDER) */}
                    <Reorder.Group axis="y" values={localStages} onReorder={handleReorder} className="space-y-3">
                        {localStages.map((stage) => (
                            <Reorder.Item
                                key={stage.id}
                                value={stage}
                                whileDrag={{ scale: 1.02, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
                                className={`
                                group flex items-center gap-4 p-4 bg-white rounded-xl border shadow-sm cursor-grab active:cursor-grabbing
                                border-l-[6px] ${stage.color} select-none
                            `}
                            >
                                <div className="text-gray-300 group-hover:text-gray-500">
                                    <GripVertical size={20} />
                                </div>

                                <span className="flex-1 font-bold text-slate-700 text-lg">{stage.name}</span>

                                {/* Быстрые цвета */}
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-4">
                                    {COLORS.slice(0, 5).map(c => (
                                        <button key={c.id} onClick={() => updateColor(stage.id, c.id)} className={`w-4 h-4 rounded-full ${c.bg} hover:scale-125 transition`} />
                                    ))}
                                </div>

                                <button onClick={() => deleteStage(stage.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                                    <Trash2 size={18} />
                                </button>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
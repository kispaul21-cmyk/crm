import React, { useState, useEffect, useRef } from 'react';
import { Trash2, GripVertical, Wand2, Plus, MessageSquare, Palette } from 'lucide-react';
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
        const colorToUse = selectedColor || customColors[0].id;
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Мои сообщения */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Мои сообщения</h3>
                        <div className="flex gap-2 mb-4">
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

                    {/* Входящие сообщения */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Входящие сообщения</h3>
                        <div className="flex gap-2 mb-4">
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

                {/* Кастомная палитра цветов */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm mb-6">
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
                                {customColors.slice(0, 8).map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => setSelectedColor(c.id)}
                                        className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${selectedColor === c.id ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
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

                {/* ИНТЕРАКТИВНЫЙ СПИСОК (REORDER) */}
                <Reorder.Group axis="y" values={localStages} onReorder={handleReorder} className="space-y-3">
                    {localStages.map((stage) => {
                        const stageColor = customColors.find(c => c.id === stage.color);
                        return (
                            <Reorder.Item
                                key={stage.id}
                                value={stage}
                                whileDrag={{ scale: 1.02, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
                                className="group flex items-center gap-4 p-4 bg-white rounded-xl border shadow-sm cursor-grab active:cursor-grabbing border-l-[6px] select-none"
                                style={{ borderLeftColor: stageColor?.hex || '#6b7280' }}
                            >
                                <div className="text-gray-300 group-hover:text-gray-500">
                                    <GripVertical size={20} />
                                </div>

                                <span className="flex-1 font-bold text-slate-700 text-lg">{stage.name}</span>

                                {/* Быстрые цвета */}
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-4">
                                    {customColors.slice(0, 5).map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => updateColor(stage.id, c.id)}
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
        </div>
    </div>
);
};

export default SettingsView;
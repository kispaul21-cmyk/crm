import IntegrationModal from './IntegrationModal';
import React, { useState, useEffect, useRef } from 'react';
import { Trash2, GripVertical, Wand2, Plus, MessageSquare, Palette, ChevronDown, Settings, BarChart3, Building2, CheckSquare, TrendingUp, Plug, Type } from 'lucide-react';
import { supabase } from '../supabase';
import { Reorder, useDragControls } from 'framer-motion';
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

// Компонент для отдельного этапа с drag controls
const StageItem = ({ stage, updateStageColor, deleteStage }) => {
    const controls = useDragControls();

    return (
        <Reorder.Item key={stage.id} value={stage} dragListener={false} dragControls={controls}>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition">
                <div
                    className="cursor-move"
                    onPointerDown={(e) => controls.start(e)}
                >
                    <GripVertical size={18} className="text-gray-400" />
                </div>
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

                {/* Delete Button */}
                <button
                    onClick={() => deleteStage(stage.id)}
                    className="text-red-400 hover:text-red-600 p-1 transition hover:bg-red-50 rounded"
                    title="Удалить этап"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </Reorder.Item>
    );
};

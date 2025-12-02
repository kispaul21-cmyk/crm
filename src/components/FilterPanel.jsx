import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';

const FilterPanel = ({ isOpen, onClose, dateFrom, setDateFrom, dateTo, setDateTo, onClear }) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* Slide-over Panel */}
            <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 flex flex-col">
                {/* Header */}
                <div className="h-14 flex items-center justify-between px-6 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-slate-800">Фильтры</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Date Range */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                            <Calendar size={12} className="inline mr-1" />
                            Дата создания
                        </label>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">От</label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">До</label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Placeholder for future filters */}
                    <div className="pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400 italic">Дополнительные фильтры будут добавлены позже</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex gap-3">
                    <button
                        onClick={onClear}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition"
                    >
                        Сбросить
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-600/30"
                    >
                        Применить
                    </button>
                </div>
            </div>
        </>
    );
};

export default FilterPanel;

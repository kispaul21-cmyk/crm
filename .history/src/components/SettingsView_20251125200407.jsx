import React from 'react';
import { Trash2 } from 'lucide-react';

const SettingsView = ({ stages, newStageName, setNewStageName, newStageColor, setNewStageColor, addStage, deleteStage }) => {
  return (
    <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Настройки системы</h1>
        
        {/* Блок: Редактор воронки */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm max-w-3xl">
            <h2 className="text-lg font-bold text-slate-700 mb-4">Редактор воронки продаж</h2>
            <p className="text-sm text-gray-500 mb-6">Добавляйте этапы, через которые проходит сделка. Перетаскивание пока не поддерживается (сортировка по порядку создания).</p>
            
            {/* Форма добавления */}
            <div className="flex gap-4 mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Название этапа</label>
                    <input 
                        type="text" 
                        value={newStageName} 
                        onChange={e => setNewStageName(e.target.value)} 
                        placeholder="Например: Согласование КП" 
                        className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Цвет</label>
                    <select 
                        value={newStageColor} 
                        onChange={e => setNewStageColor(e.target.value)} 
                        className="p-3 bg-white border border-gray-200 rounded-lg outline-none cursor-pointer"
                    >
                        <option value="border-red-500">Красный</option>
                        <option value="border-orange-500">Оранжевый</option>
                        <option value="border-yellow-400">Желтый</option>
                        <option value="border-green-500">Зеленый</option>
                        <option value="border-blue-600">Синий</option>
                        <option value="border-purple-600">Фиолетовый</option>
                        <option value="border-gray-500">Серый</option>
                    </select>
                </div>
                <div className="flex items-end">
                    <button onClick={addStage} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition">
                        Добавить
                    </button>
                </div>
            </div>

            {/* Список этапов */}
            <div className="space-y-3">
                {stages.map((s, index) => (
                    <div key={s.id} className={`flex justify-between items-center p-4 border bg-white rounded-xl transition hover:shadow-md border-l-8 ${s.color}`}>
                        <div className="flex items-center gap-3">
                            <span className="text-gray-400 font-mono text-xs">#{index + 1}</span>
                            <span className="font-medium text-slate-700">{s.name}</span>
                        </div>
                        <button 
                            onClick={() => deleteStage(s.id)} 
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Удалить этап"
                        >
                            <Trash2 size={18}/>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default SettingsView;
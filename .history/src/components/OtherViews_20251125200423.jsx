import React from 'react';
import { CheckSquare, Plus, Building2, Trash2, User } from 'lucide-react';

// Экран ЗАДАЧ
export const TasksView = ({ tasks, filter, setFilter, newTaskText, setNewTaskText, addTask, toggleTask }) => {
  const filteredTasks = tasks.filter(t => {
    if (filter === 'my') return t.assignee === 'Я';
    if (filter === 'assigned') return t.assignee !== 'Я';
    return true;
  });

  return (
    <div className="flex-1 bg-gray-50 flex flex-col p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-slate-800">Задачи</h1>
            <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                <button onClick={() => setFilter('all')} className={`px-4 py-1.5 text-sm rounded ${filter === 'all' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-500'}`}>Все</button>
                <button onClick={() => setFilter('my')} className={`px-4 py-1.5 text-sm rounded ${filter === 'my' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-500'}`}>Мои</button>
            </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-3 mb-6">
            <input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask(newTaskText)} placeholder="Новая задача..." className="flex-1 outline-none text-sm"/>
            <button onClick={() => addTask(newTaskText)} className="text-blue-600 font-medium text-sm">Добавить</button>
        </div>
        <div className="space-y-2">
            {filteredTasks.map(task => (
                <div key={task.id} className="flex items-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition">
                    <button onClick={() => toggleTask(task)} className={`w-5 h-5 rounded border mr-4 flex items-center justify-center ${task.is_done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>{task.is_done && <CheckSquare size={12}/>}</button>
                    <div className="flex-1">
                        <span className={`block text-sm ${task.is_done ? 'text-gray-400 line-through' : 'text-slate-800'}`}>{task.text}</span>
                        {task.deal_id && <span className="inline-block mt-1 text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Привязано к сделке</span>}
                    </div>
                </div>
            ))}
        </div>
        </div>
    </div>
  );
};

// Экран КОМПАНИЙ
export const CompaniesView = ({ companies, onOpenCard }) => (
    <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
    <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Компании</h1>
        <button onClick={() => onOpenCard(null)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"><Plus size={16}/> Добавить</button>
    </div>
    <div className="grid grid-cols-3 gap-4">
        {companies.map(c => (
        <div key={c.id} onClick={() => onOpenCard(c.id)} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer group">
            <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-lg text-slate-800">{c.name}</div>
                <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition"><Building2 size={16}/></div>
            </div>
            <div className="text-sm text-gray-500">ИНН: {c.inn || '-'}</div>
        </div>
        ))}
    </div>
    </div>
);
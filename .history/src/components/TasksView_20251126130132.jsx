import React, { useState } from 'react';
import { CheckSquare, Trash2, ChevronDown, ChevronRight, Search, MessageSquare, Calendar } from 'lucide-react';

const TasksView = ({ tasks, deals, filter, setFilter, newTaskText, setNewTaskText, addTask, toggleTask, toggleSubtask, deleteTask }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTasks = tasks.filter(t => {
        // Filter by assignee
        if (filter === 'my' && t.assignee !== 'Я') return false;
        if (filter === 'assigned' && t.assignee === 'Я') return false;

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const taskText = t.text?.toLowerCase() || '';
            const dealTitle = deals.find(d => d.id === t.deal_id)?.title?.toLowerCase() || '';

            if (!taskText.includes(query) && !dealTitle.includes(query)) {
                return false;
            }
        }

        return true;
    });

    return (
        <div className="flex-1 bg-gray-50 flex flex-col p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto w-full">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">Задачи</h1>
                    <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                        <button onClick={() => setFilter('all')} className={`px-4 py-1.5 text-sm rounded ${filter === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-500'}`}>Все</button>
                        <button onClick={() => setFilter('my')} className={`px-4 py-1.5 text-sm rounded ${filter === 'my' ? 'bg-blue-50 text-blue-700' : 'text-gray-500'}`}>Мои</button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-3 mb-4">
                    <Search size={18} className="text-gray-400 mt-0.5" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Поиск по задачам и чатам..."
                        className="flex-1 outline-none text-sm"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="text-gray-400 hover:text-gray-600 text-sm"
                        >
                            Очистить
                        </button>
                    )}
                </div>

                {/* New Task Input */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-3 mb-6">
                    <input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask(newTaskText)} placeholder="Новая задача..." className="flex-1 outline-none text-sm" />
                    <button onClick={() => addTask(newTaskText)} className="text-blue-600 font-medium text-sm">Добавить</button>
                </div>

                <div className="space-y-2">
                    {filteredTasks.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            {searchQuery ? 'Задачи не найдены' : 'Нет задач'}
                        </div>
                    ) : (
                        filteredTasks.map(task => (
                            <TaskItem key={task.id} task={task} deals={deals} toggleTask={toggleTask} toggleSubtask={toggleSubtask} deleteTask={deleteTask} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// Отдельный компонент для задачи в списке
const TaskItem = ({ task, deals, toggleTask, toggleSubtask, deleteTask }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;

    // Find associated deal
    const deal = deals.find(d => d.id === task.deal_id);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        // If today
        if (diffDays === 0) {
            if (diffMins < 60) return `${diffMins} мин назад`;
            return `${diffHours} ч назад`;
        }

        // If yesterday
        if (diffDays === 1) return 'Вчера';

        // Otherwise show date
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden">
            <div className="flex items-center p-4 group">
                <button onClick={() => toggleTask(task)} className={`w-5 h-5 rounded border mr-4 flex items-center justify-center transition flex-shrink-0 ${task.is_done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-blue-500'}`}>
                    {task.is_done && <CheckSquare size={12} />}
                </button>

                <div className="flex-1 cursor-pointer min-w-0" onClick={() => hasSubtasks && setIsExpanded(!isExpanded)}>
                    <span className={`block text-sm font-medium ${task.is_done ? 'text-gray-400 line-through' : 'text-slate-800'}`}>{task.text}</span>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {deal && (
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded flex items-center gap-1">
                                <MessageSquare size={10} />
                                {deal.title}
                            </span>
                        )}
                        {task.created_at && (
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                <Calendar size={10} />
                                {formatDate(task.created_at)}
                            </span>
                        )}
                        {hasSubtasks && <span className="text-[10px] text-gray-400 flex items-center gap-1">{isExpanded ? 'Скрыть' : `${task.subtasks.length} подзадач`} {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}</span>}
                    </div>
                </div>

                <button onClick={() => deleteTask(task.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition flex-shrink-0 ml-2">
                    <Trash2 size={18} />
                </button>
            </div>

            {/* Список подзадач (выпадающий) */}
            {hasSubtasks && isExpanded && (
                <div className="bg-gray-50 border-t border-gray-100 px-4 py-2 space-y-1">
                    {task.subtasks.map((sub, idx) => (
                        <div key={idx} className="flex items-center gap-3 py-1 cursor-pointer" onClick={() => toggleSubtask(task, idx)}>
                            <div className={`w-3 h-3 rounded border flex items-center justify-center ${sub.is_done || task.is_done ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                {(sub.is_done || task.is_done) && <CheckSquare size={8} className="text-white" />}
                            </div>
                            <span className={`text-xs ${sub.is_done || task.is_done ? 'text-gray-400 line-through' : 'text-slate-600'}`}>{sub.text}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TasksView;
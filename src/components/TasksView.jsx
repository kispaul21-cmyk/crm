import React, { useState, useEffect } from 'react';
import { CheckSquare, Trash2, ChevronDown, ChevronRight, Search, MessageSquare, Calendar, Clock, X } from 'lucide-react';
import TaskReminderToast from './TaskReminderToast';

const TasksView = ({ tasks, deals, filter, setFilter, newTaskText, setNewTaskText, addTask, toggleTask, setTaskInProgress, toggleSubtask, deleteTask, updateTaskDueDate }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [reminders, setReminders] = useState([]);

    // Check for upcoming task reminders
    useEffect(() => {
        const checkReminders = () => {
            const now = new Date();
            const upcomingTasks = tasks.filter(task => {
                if (task.is_done || !task.due_date) return false;

                const dueDate = new Date(task.due_date);
                const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60);

                // Show reminder if due within 1 hour or overdue
                return hoursUntilDue <= 1;
            });

            setReminders(upcomingTasks);
        };

        checkReminders();
        const interval = setInterval(checkReminders, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [tasks]);

    const dismissReminder = (taskId) => {
        setReminders(prev => prev.filter(r => r.id !== taskId));
    };

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
            <TaskReminderToast reminders={reminders} onDismiss={dismissReminder} />

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
                            <TaskItem
                                key={task.id}
                                task={task}
                                deals={deals}
                                toggleTask={toggleTask}
                                toggleSubtask={toggleSubtask}
                                deleteTask={deleteTask}
                                updateTaskDueDate={updateTaskDueDate}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// Отдельный компонент для задачи в списке
const TaskItem = ({ task, deals, toggleTask, toggleSubtask, deleteTask, updateTaskDueDate }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
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

    const getDueDateColor = () => {
        if (!task.due_date) return '';

        const now = new Date();
        const dueDate = new Date(task.due_date);
        const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60);

        if (hoursUntilDue < 0) return 'bg-red-50 text-red-600 border-red-200';
        if (hoursUntilDue < 24) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        return 'bg-green-50 text-green-600 border-green-200';
    };

    const formatDueDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}.${month} ${hours}:${minutes}`;
    };

    const handleSetDueDate = (dateTimeString) => {
        if (dateTimeString) {
            updateTaskDueDate(task.id, dateTimeString);
        }
        setShowDatePicker(false);
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden">
            <div className="flex items-center p-4 group">
                <button onClick={() => toggleTask(task)} className={`w-5 h-5 rounded border mr-4 flex items-center justify-center transition flex-shrink-0 ${task.is_done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-blue-500'}`}>
                    {task.is_done && <CheckSquare size={12} />}
                </button>

                <div className="flex-1 cursor-pointer min-w-0" onClick={() => hasSubtasks && setIsExpanded(!isExpanded)}>
                    <span className={`block text-sm font-medium ${task.is_done ? 'text-gray-400 line-through' : 'text-slate-800'}`}>{task.text}</span>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {deal && (
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded flex items-center gap-1">
                                <MessageSquare size={11} />
                                {deal.title}
                            </span>
                        )}
                        {task.created_at && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Calendar size={11} />
                                {formatDate(task.created_at)}
                            </span>
                        )}
                        {task.due_date && (
                            <span className={`text-xs px-2 py-1 rounded border flex items-center gap-1 ${getDueDateColor()}`}>
                                <Clock size={11} />
                                {formatDueDate(task.due_date)}
                            </span>
                        )}
                        {hasSubtasks && <span className="text-xs text-gray-400 flex items-center gap-1">{isExpanded ? 'Скрыть' : `${task.subtasks.length} подзадач`} {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}</span>}
                    </div>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowDatePicker(!showDatePicker);
                    }}
                    className="text-gray-400 hover:text-blue-500 transition flex-shrink-0 ml-2"
                    title="Установить дедлайн"
                >
                    <Clock size={18} />
                </button>

                <button onClick={() => deleteTask(task.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition flex-shrink-0 ml-2">
                    <Trash2 size={18} />
                </button>
            </div>

            {/* Date Picker Modal */}
            {showDatePicker && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                    <div className="flex items-center gap-3">
                        <input
                            type="datetime-local"
                            defaultValue={task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : ''}
                            onChange={(e) => handleSetDueDate(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {task.due_date && (
                            <button
                                onClick={() => handleSetDueDate(null)}
                                className="text-red-500 hover:text-red-600 text-sm"
                            >
                                Удалить
                            </button>
                        )}
                        <button
                            onClick={() => setShowDatePicker(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}

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
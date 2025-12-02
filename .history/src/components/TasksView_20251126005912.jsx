import React, { useState } from 'react';
import { CheckSquare, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

const TasksView = ({ tasks, filter, setFilter, newTaskText, setNewTaskText, addTask, toggleTask, toggleSubtask, deleteTask }) => {
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
                <button onClick={() => setFilter('all')} className={`px-4 py-1.5 text-sm rounded ${filter === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-500'}`}>Все</button>
                <button onClick={() => setFilter('my')} className={`px-4 py-1.5 text-sm rounded ${filter === 'my' ? 'bg-blue-50 text-blue-700' : 'text-gray-500'}`}>Мои</button>
            </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-3 mb-6">
            <input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask(newTaskText)} placeholder="Новая задача..." className="flex-1 outline-none text-sm"/>
            <button onClick={() => addTask(newTaskText)} className="text-blue-600 font-medium text-sm">Добавить</button>
        </div>

        <div className="space-y-2">
            {filteredTasks.map(task => (
                <TaskItem key={task.id} task={task} toggleTask={toggleTask} toggleSubtask={toggleSubtask} deleteTask={deleteTask} />
            ))}
        </div>
        </div>
    </div>
  );
};

// Отдельный компонент для задачи в списке
const TaskItem = ({ task, toggleTask, toggleSubtask, deleteTask }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden">
            <div className="flex items-center p-4 group">
                <button onClick={() => toggleTask(task)} className={`w-5 h-5 rounded border mr-4 flex items-center justify-center transition ${task.is_done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-blue-500'}`}>
                    {task.is_done && <CheckSquare size={12}/>}
                </button>
                
                <div className="flex-1 cursor-pointer" onClick={() => hasSubtasks && setIsExpanded(!isExpanded)}>
                    <span className={`block text-sm font-medium ${task.is_done ? 'text-gray-400 line-through' : 'text-slate-800'}`}>{task.text}</span>
                    <div className="flex items-center gap-2 mt-1">
                        {task.deal_id && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Сделка</span>}
                        {hasSubtasks && <span className="text-[10px] text-gray-400 flex items-center gap-1">{isExpanded ? 'Скрыть' : `${task.subtasks.length} подзадач`} {isExpanded ? <ChevronDown size={10}/> : <ChevronRight size={10}/>}</span>}
                    </div>
                </div>

                <button onClick={() => deleteTask(task.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                    <Trash2 size={18} />
                </button>
            </div>

            {/* Список подзадач (выпадающий) */}
            {hasSubtasks && isExpanded && (
                <div className="bg-gray-50 border-t border-gray-100 px-4 py-2 space-y-1">
                    {task.subtasks.map((sub, idx) => (
                        <div key={idx} className="flex items-center gap-3 py-1 cursor-pointer" onClick={() => toggleSubtask(task, idx)}>
                            <div className={`w-3 h-3 rounded border flex items-center justify-center ${sub.is_done || task.is_done ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                {(sub.is_done || task.is_done) && <CheckSquare size={8} className="text-white"/>}
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
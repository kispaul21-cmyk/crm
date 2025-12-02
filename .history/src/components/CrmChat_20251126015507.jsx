import React, { useRef, useEffect, useState } from 'react';
import { MoreVertical, Plus, Smile, Send, Building2, X, CheckSquare, ChevronDown, ChevronRight, Trash2, ListChecks } from 'lucide-react';

const CrmChat = ({
    selectedDeal, chatStream, dealTasks,
    quickTaskText, setQuickTaskText, addTask, toggleTask, toggleSubtask, deleteTask,
    newMessage, setNewMessage, sendMessage, replyTo, setReplyTo,
    openCompanyCard
}) => {

    const messagesEndRef = useRef(null);

    return (
        <div className="flex gap-3 mb-4 group">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-sm border border-emerald-200">
                <ListChecks size={16} />
            </div>

            <div className={`w-[80%] bg-white border rounded-xl rounded-tl-none shadow-sm overflow-hidden transition-all ${task.is_done ? 'opacity-60 border-gray-200' : 'border-emerald-100'}`}>
                <div className={`flex items-center p-3 gap-3 ${hasSubtasks ? 'border-b border-gray-50' : ''}`}>
                    <button onClick={() => toggleTask(task)} className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition ${task.is_done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 hover:border-emerald-500'}`}>
                        {task.is_done && <CheckSquare size={12} />}
                    </button>
                    <div className="flex-1 min-w-0">
                        <span className={`font-bold text-sm block truncate ${task.is_done ? 'text-gray-400 line-through' : 'text-slate-700'}`}>{task.text}</span>
                    </div>
                    {hasSubtasks && <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-400 hover:text-blue-600 p-1">{isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</button>}
                    <button onClick={() => deleteTask(task.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1"><Trash2 size={14} /></button>
                </div>

                {hasSubtasks && isExpanded && (
                    <div className="bg-emerald-50/20 p-2 space-y-1">
                        {task.subtasks.map((sub, idx) => (
                            <div key={idx} className="flex items-start gap-2 px-2 py-1.5 hover:bg-white/50 rounded cursor-pointer transition" onClick={() => toggleSubtask(task, idx)}>
                                <div className={`mt-0.5 w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition ${sub.is_done || task.is_done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'}`}>
                                    {(sub.is_done || task.is_done) && <CheckSquare size={10} className="text-white" />}
                                </div>
                                <span className={`text-xs leading-tight ${sub.is_done || task.is_done ? 'text-gray-400 line-through' : 'text-slate-700'}`}>{sub.text}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const TopPanelTask = ({ task, toggleTask, toggleSubtask, deleteTask }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;

    return (
        <div className={`group border-b border-gray-50 last:border-0 hover:bg-gray-50 transition rounded-lg px-2 ${task.is_done ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-3 py-2">
                <button onClick={() => toggleTask(task)} className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition ${task.is_done ? 'bg-gray-400 border-gray-400 text-white' : 'border-gray-300 hover:border-blue-500 text-transparent'}`}>
                    <CheckSquare size={10} />
                </button>

                <div className="flex-1 cursor-pointer min-w-0" onClick={() => hasSubtasks && setIsExpanded(!isExpanded)}>
                    <span className={`text-sm block truncate ${task.is_done ? 'text-gray-400 line-through' : 'text-slate-700 font-medium'}`}>{task.text}</span>
                </div>

                {hasSubtasks && (
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-400 hover:text-blue-600 p-1">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                )}

                <button onClick={() => deleteTask(task.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1">
                    <Trash2 size={14} />
                </button>
            </div>

            {hasSubtasks && isExpanded && (
                <div className="pl-9 pr-2 pb-2 space-y-1">
                    {task.subtasks.map((sub, idx) => (
                        <div key={idx} className="flex items-center gap-2 py-0.5 cursor-pointer hover:text-blue-600 transition" onClick={() => toggleSubtask(task, idx)}>
                            <div className={`w-3 h-3 rounded border flex-shrink-0 flex items-center justify-center ${sub.is_done || task.is_done ? 'bg-gray-400 border-gray-400' : 'border-gray-300'}`}>
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

export default CrmChat;
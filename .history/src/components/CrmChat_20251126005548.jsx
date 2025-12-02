import React, { useRef, useEffect, useState } from 'react';
import { MoreVertical, Plus, Smile, Send, Paperclip, Building2, X, CheckSquare, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';

const CrmChat = ({ 
  selectedDeal, chatStream, dealTasks, 
  quickTaskText, setQuickTaskText, addTask, toggleTask, toggleSubtask, deleteTask,
  newMessage, setNewMessage, sendMessage, replyTo, setReplyTo,
  openCompanyCard 
}) => {
  
  const messagesEndRef = useRef(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatStream]);

  if (!selectedDeal) return <div className="flex-1 flex items-center justify-center text-gray-400 bg-[#eef1f5]">Выберите сделку</div>;

  // Сортировка верхних задач: сначала активные, потом выполненные
  const sortedTopTasks = [...dealTasks].sort((a, b) => Number(a.is_done) - Number(b.is_done));

  return (
    <div className="flex-1 flex flex-col bg-[#eef1f5] min-w-[500px]">
        {/* Хедер */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
            <div>
              <h2 className="font-bold text-slate-800 flex items-center gap-2">{selectedDeal.title}</h2>
              <p className="text-xs text-blue-600 cursor-pointer hover:underline flex items-center gap-1" onClick={() => openCompanyCard(selectedDeal.company_id)}>
                <Building2 size={10}/> {selectedDeal.company_name}
              </p>
            </div>
            <MoreVertical size={20} className="text-gray-400 cursor-pointer"/>
        </div>

        {/* Панель задач (Сверху) */}
        <div className="bg-white/80 border-b border-gray-200 px-6 py-3 backdrop-blur-sm max-h-32 overflow-y-auto custom-scrollbar">
            <div className="flex flex-wrap gap-2 mb-2">
                {sortedTopTasks.map(task => (
                <div key={task.id} 
                     className={`flex items-center gap-2 border text-xs px-3 py-1.5 rounded-full cursor-pointer transition group
                     ${task.is_done ? 'bg-gray-50 border-gray-200 text-gray-400 line-through' : 'bg-white border-blue-100 text-slate-700 hover:border-blue-400'}`}
                     onClick={() => toggleTask(task)}
                >
                    <div className={`w-3 h-3 border rounded-full flex items-center justify-center ${task.is_done ? 'border-gray-300 bg-gray-200' : 'border-blue-400'}`}>
                        {task.is_done && <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>}
                    </div>
                    <span>{task.text}</span>
                </div>
                ))}
            </div>
            <div className="flex items-center gap-2">
                <Plus size={14} className="text-blue-500"/>
                <input type="text" value={quickTaskText} onChange={(e) => setQuickTaskText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask(quickTaskText, selectedDeal.id)} placeholder="Быстрая задача..." className="bg-transparent text-xs w-full outline-none"/>
            </div>
        </div>

        {/* ЕДИНАЯ ЛЕНТА (ЧАТ + ЗАДАЧИ) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatStream.length === 0 && <div className="text-center text-gray-400 mt-10 text-sm">История пуста</div>}
            
            {chatStream.map(item => {
                // РЕНДЕР ЗАДАЧИ В ПОТОКЕ
                if (item.type === 'task') {
                    return <TaskBubble key={item.id} task={item} toggleTask={toggleTask} toggleSubtask={toggleSubtask} deleteTask={deleteTask} />;
                }
                
                // РЕНДЕР СООБЩЕНИЯ
                return (
                    <div key={item.id} className={`flex gap-3 group ${item.is_me ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${item.is_me ? 'bg-blue-600' : 'bg-purple-600'}`}>{item.is_me ? 'Я' : 'К'}</div>
                        <div className="max-w-[70%]">
                            {item.reply_to_id && <div className="text-[10px] mb-1 p-1 border-l-2 border-gray-300 text-gray-500">Ответ</div>}
                            <div className={`p-3 rounded-2xl text-sm shadow-sm ${item.is_me ? 'bg-white text-slate-800 rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none'}`}>
                                <div className="whitespace-pre-wrap">{item.text}</div>
                                <div className="text-[10px] text-gray-400 text-right mt-1">{new Date(item.created_at).toLocaleTimeString().slice(0,5)}</div>
                            </div>
                            <button onClick={() => setReplyTo(item)} className="text-[10px] text-gray-400 mt-1 hover:text-blue-600 opacity-0 group-hover:opacity-100">Ответить</button>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>

        {/* Ввод */}
        <div className="p-4 bg-white border-t border-gray-200">
            {replyTo && <div className="flex justify-between bg-blue-50 p-2 text-xs text-blue-700 mb-2 rounded"><span>Ответ...</span><X size={14} className="cursor-pointer" onClick={() => setReplyTo(null)}/></div>}
            <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-xl border border-transparent focus-within:bg-white focus-within:border-blue-200 transition-all">
                <button className="p-2 text-gray-400 hover:text-gray-600"><Smile size={20}/></button>
                <textarea 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)} 
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                    }}
                    placeholder="Сообщение или #Задача..." 
                    className="flex-1 bg-transparent outline-none text-sm resize-none max-h-24 py-2"
                    rows={1}
                />
                <button onClick={sendMessage} className="bg-blue-600 text-white p-2 rounded-lg"><Send size={18}/></button>
            </div>
        </div>
    </div>
  );
};

// Компонент карточки задачи внутри чата
const TaskBubble = ({ task, toggleTask, toggleSubtask, deleteTask }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;

    return (
        <div className="flex justify-center my-4">
            <div className={`w-full max-w-md bg-white border rounded-xl shadow-sm overflow-hidden transition-all ${task.is_done ? 'opacity-60 bg-gray-50 border-gray-200' : 'border-blue-100'}`}>
                {/* Шапка задачи */}
                <div className="flex items-center p-3 gap-3 border-b border-gray-50">
                    <button onClick={() => toggleTask(task)} className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition ${task.is_done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-blue-500'}`}>
                        {task.is_done && <CheckSquare size={12}/>}
                    </button>
                    <span className={`flex-1 font-bold text-sm ${task.is_done ? 'text-gray-400 line-through' : 'text-slate-700'}`}>{task.text}</span>
                    
                    {hasSubtasks && (
                        <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-400 hover:text-blue-600">
                            {isExpanded ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                        </button>
                    )}
                    <button onClick={() => deleteTask(task.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={14}/></button>
                </div>

                {/* Подзадачи */}
                {hasSubtasks && isExpanded && (
                    <div className="bg-gray-50/50 p-2 space-y-1">
                        {task.subtasks.map((sub, idx) => (
                            <div key={idx} className="flex items-start gap-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer" onClick={() => toggleSubtask(task, idx)}>
                                <div className={`mt-1 w-3 h-3 rounded border flex-shrink-0 flex items-center justify-center ${sub.is_done || task.is_done ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                    {(sub.is_done || task.is_done) && <CheckSquare size={10} className="text-white"/>}
                                </div>
                                <span className={`text-xs ${sub.is_done || task.is_done ? 'text-gray-400 line-through' : 'text-slate-600'}`}>{sub.text}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CrmChat;
import React, { useRef, useEffect, useState } from 'react';
import { MoreVertical, Plus, Smile, Send, Building2, X, CheckSquare, ChevronDown, ChevronRight, Trash2, ListChecks } from 'lucide-react';

const CrmChat = ({ 
  selectedDeal, messages, dealTasks, 
  quickTaskText, setQuickTaskText, addTask, toggleTask, toggleSubtask, deleteTask,
  newMessage, setNewMessage, sendMessage, replyTo, setReplyTo,
  openCompanyCard 
}) => {
  
  const messagesEndRef = useRef(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (!selectedDeal) return <div className="flex-1 flex items-center justify-center text-gray-400 bg-[#eef1f5]">Выберите сделку</div>;

  // Сортировка задач (активные сверху)
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

        {/* --- ПАНЕЛЬ БЫСТРЫХ ЗАДАЧ (УЛУЧШЕННАЯ) --- */}
        <div className="bg-white/90 border-b border-gray-200 px-6 py-4 backdrop-blur-sm max-h-64 overflow-y-auto custom-scrollbar shadow-sm">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-2">
                <ListChecks size={12}/> Задачи по сделке
            </h3>
            
            <div className="space-y-2 mb-3">
                {sortedTopTasks.map(task => (
                    <TopPanelTask 
                        key={task.id} 
                        task={task} 
                        toggleTask={toggleTask} 
                        toggleSubtask={toggleSubtask} 
                        deleteTask={deleteTask} 
                    />
                ))}
                {sortedTopTasks.length === 0 && <div className="text-xs text-gray-400 italic pl-1">Нет активных задач</div>}
            </div>

            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 focus-within:bg-white focus-within:border-blue-300 transition">
                <Plus size={14} className="text-blue-500"/>
                <input type="text" value={quickTaskText} onChange={(e) => setQuickTaskText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask(quickTaskText, selectedDeal.id)} placeholder="Новая задача..." className="bg-transparent text-xs w-full outline-none"/>
            </div>
        </div>

        {/* --- ЛЕНТА СООБЩЕНИЙ (ТОЛЬКО СООБЩЕНИЯ) --- */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {messages.length === 0 && <div className="text-center text-gray-400 mt-10 text-sm">История пуста</div>}
            
            {messages.map(item => (
                <div key={item.id} className={`flex gap-3 group ${item.is_me ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${item.is_me ? 'bg-blue-600' : 'bg-purple-600'}`}>{item.is_me ? 'Я' : 'К'}</div>
                    <div className="max-w-[80%]">
                        {item.reply_to_id && <div className="text-[10px] mb-1 p-1 border-l-2 border-gray-300 text-gray-500">Ответ</div>}
                        
                        {/* Оформление системных уведомлений (о задачах) */}
                        {item.text.startsWith('⚡') ? (
                            <div className="bg-gray-100 border border-gray-200 text-slate-600 text-xs px-4 py-2 rounded-xl inline-block">
                                {item.text}
                            </div>
                        ) : (
                            <div className={`p-3 rounded-2xl text-sm shadow-sm ${item.is_me ? 'bg-white text-slate-800 rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none'}`}>
                                <div className="whitespace-pre-wrap">{item.text}</div>
                                <div className="text-[10px] text-gray-400 text-right mt-1">{new Date(item.created_at).toLocaleTimeString().slice(0,5)}</div>
                            </div>
                        )}
                        
                        {!item.text.startsWith('⚡') && (
                            <button onClick={() => setReplyTo(item)} className="text-[10px] text-gray-400 mt-1 hover:text-blue-600 opacity-0 group-hover:opacity-100">Ответить</button>
                        )}
                    </div>
                </div>
            ))}
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
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
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

// --- КОМПОНЕНТ ЗАДАЧИ ДЛЯ ВЕРХНЕЙ ПАНЕЛИ ---
const TopPanelTask = ({ task, toggleTask, toggleSubtask, deleteTask }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;

    return (
        <div className={`bg-white border rounded-lg transition-all overflow-hidden group ${task.is_done ? 'border-gray-200 opacity-60' : 'border-blue-100 shadow-sm hover:border-blue-300'}`}>
            {/* Шапка */}
            <div className="flex items-center p-2 gap-3">
                <button onClick={() => toggleTask(task)} className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition ${task.is_done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-blue-500'}`}>
                    {task.is_done && <CheckSquare size={10}/>}
                </button>
                
                <div className="flex-1 cursor-pointer" onClick={() => hasSubtasks && setIsExpanded(!isExpanded)}>
                    <span className={`text-xs font-medium ${task.is_done ? 'text-gray-400 line-through' : 'text-slate-700'}`}>{task.text}</span>
                </div>

                {hasSubtasks && (
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-400 hover:text-blue-600 p-1">
                        {isExpanded ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                    </button>
                )}
                
                <button onClick={() => deleteTask(task.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1">
                    <Trash2 size={12}/>
                </button>
            </div>

            {/* Выпадающий список подзадач */}
            {hasSubtasks && isExpanded && (
                <div className="bg-gray-50 border-t border-gray-100 px-8 py-1 space-y-1">
                    {task.subtasks.map((sub, idx) => (
                        <div key={idx} className="flex items-center gap-2 py-1 cursor-pointer" onClick={() => toggleSubtask(task, idx)}>
                            <div className={`w-3 h-3 rounded border flex-shrink-0 flex items-center justify-center ${sub.is_done || task.is_done ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'}`}>
                                {(sub.is_done || task.is_done) && <CheckSquare size={8} className="text-white"/>}
                            </div>
                            <span className={`text-[10px] ${sub.is_done || task.is_done ? 'text-gray-400 line-through' : 'text-slate-600'}`}>{sub.text}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CrmChat;
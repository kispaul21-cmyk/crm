import React, { useRef, useEffect } from 'react';
import { Search, Briefcase, Building2, MoreVertical, Plus, Smile, Send, Paperclip, Download, FileText, ChevronRight, ChevronLeft, X } from 'lucide-react';

const CrmView = ({ 
  stages, deals, activeStageId, setActiveStageId, isStagesCollapsed, setIsStagesCollapsed, 
  selectedDeal, setSelectedDeal, messages, currentDeals, dealTasks, 
  addTask, toggleTask, quickTaskText, setQuickTaskText, 
  newMessage, setNewMessage, sendMessage, replyTo, setReplyTo, 
  openCompanyCard, updateStage, handleFileUpload 
}) => {
  
  const messagesEndRef = useRef(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <>
      {/* 2. ЭТАПЫ */}
      <div className={`${isStagesCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 flex-shrink-0 relative z-20`}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100">
            {!isStagesCollapsed && <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Воронка</span>}
            <button onClick={() => setIsStagesCollapsed(!isStagesCollapsed)} className="p-1 hover:bg-gray-100 rounded text-slate-400">{isStagesCollapsed ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}</button>
        </div>
        <div className="flex-1 overflow-y-auto py-2 flex flex-col justify-start space-y-1 px-2">
            {stages.map(stage => {
            const count = deals.filter(d => d.stage === stage.id).length;
            const isActive = activeStageId === stage.id;
            return (
                <button key={stage.id} onClick={() => { setActiveStageId(stage.id); setSelectedDeal(null); }} 
                className={`relative flex items-center justify-between p-3 transition-all rounded-l-lg ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'} border-r-4 ${stage.color}`}>
                {!isStagesCollapsed ? (
                    <><span className="font-medium text-sm">{stage.name}</span>{count > 0 && <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full shadow-sm">{count}</span>}</>
                ) : <div className="w-full flex justify-center text-xs font-bold">{count}</div>}
                </button>
            )
            })}
        </div>
      </div>

      {/* 3. СПИСОК СДЕЛОК */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="h-14 flex items-center px-4 border-b border-gray-100 gap-2"><Search size={18} className="text-gray-400"/><input type="text" placeholder="Поиск..." className="w-full outline-none text-sm"/></div>
        <div className="flex-1 overflow-y-auto bg-gray-50/50">
            {currentDeals.map(deal => (
                <div key={deal.id} onClick={() => setSelectedDeal(deal)} className={`group p-4 border-b cursor-pointer hover:bg-white transition-all ${selectedDeal?.id === deal.id ? 'bg-white border-l-4 border-l-blue-500 shadow-md' : 'border-l-4 border-l-transparent'}`}>
                <div className="font-bold text-sm text-slate-700 mb-1">{deal.title}</div>
                <div className="flex items-center gap-2 text-xs text-gray-500"><Briefcase size={12}/><span className="truncate">{deal.company_name}</span></div>
                </div>
            ))}
        </div>
      </div>

      {/* 4. ЧАТ */}
      <div className="flex-1 flex flex-col bg-[#eef1f5] min-w-[500px]">
        {selectedDeal ? (
            <>
            <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
                <div>
                <h2 className="font-bold text-slate-800 flex items-center gap-2">{selectedDeal.title}</h2>
                <p className="text-xs text-blue-600 cursor-pointer hover:underline flex items-center gap-1" onClick={() => openCompanyCard(selectedDeal.company_id)}><Building2 size={10}/> {selectedDeal.company_name}</p>
                </div>
                <MoreVertical size={20} className="text-gray-400 cursor-pointer"/>
            </div>
            {/* Быстрые задачи */}
            <div className="bg-white/80 border-b border-gray-200 px-6 py-3 backdrop-blur-sm">
                <div className="flex flex-wrap gap-2 mb-2">
                    {dealTasks.map(task => (
                    <div key={task.id} onClick={() => toggleTask(task)} className="flex items-center gap-2 bg-white border border-blue-100 text-xs px-3 py-1.5 rounded-full cursor-pointer hover:border-blue-400">
                        <div className="w-3 h-3 border border-blue-400 rounded-full"></div><span>{task.text}</span>
                    </div>
                    ))}
                </div>
                <div className="flex items-center gap-2"><Plus size={14} className="text-blue-500"/><input type="text" value={quickTaskText} onChange={(e) => setQuickTaskText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask(quickTaskText, selectedDeal.id)} placeholder="Добавить быструю задачу..." className="bg-transparent text-xs w-full outline-none"/></div>
            </div>
            {/* Сообщения */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map(msg => (
                <div key={msg.id} className={`flex gap-3 group ${msg.is_me ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${msg.is_me ? 'bg-blue-600' : 'bg-purple-600'}`}>{msg.is_me ? 'Я' : 'К'}</div>
                    <div className="max-w-[70%]">
                    {msg.reply_to_id && <div className="text-[10px] mb-1 p-1 border-l-2 border-gray-300">Ответ на сообщение</div>}
                    <div className={`p-3 rounded-2xl text-sm shadow-sm ${msg.is_me ? 'bg-white text-slate-800 rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none'}`}>
                        {msg.text}
                        <div className="text-[10px] text-gray-400 text-right mt-1">{new Date(msg.created_at).toLocaleTimeString().slice(0,5)}</div>
                    </div>
                    <button onClick={() => setReplyTo(msg)} className="text-[10px] text-gray-400 mt-1 hover:text-blue-600 opacity-0 group-hover:opacity-100">Ответить</button>
                    </div>
                </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-white border-t border-gray-200">
                {replyTo && <div className="flex justify-between bg-blue-50 p-2 text-xs text-blue-700 mb-2 rounded"><span>Ответ на: {replyTo.text}</span><X size={14} className="cursor-pointer" onClick={() => setReplyTo(null)}/></div>}
                <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-xl border border-transparent focus-within:bg-white focus-within:border-blue-200 transition-all">
                <button className="p-2 text-gray-400 hover:text-gray-600"><Smile size={20}/></button>
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Написать..." className="flex-1 bg-transparent outline-none text-sm"/>
                <button onClick={sendMessage} className="bg-blue-600 text-white p-2 rounded-lg"><Send size={18}/></button>
                </div>
            </div>
            </>
        ) : <div className="flex-1 flex items-center justify-center text-gray-400">Выберите сделку</div>}
      </div>

      {/* 5. ИНФО */}
      {selectedDeal && (
        <div className="w-72 bg-white border-l border-gray-200 flex flex-col flex-shrink-0 overflow-y-auto">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Этап</h3>
            <select className="w-full p-2 bg-white border border-gray-200 rounded text-sm outline-none" value={selectedDeal.stage} onChange={(e) => updateStage(e.target.value)}>
                {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            </div>
            <div className="p-5 border-b border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Компания</h3>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-2">
                <div className="font-bold text-sm text-slate-800">{selectedDeal.company_name}</div>
                <button onClick={() => openCompanyCard(selectedDeal.company_id)} className="text-xs text-blue-600 mt-1 hover:underline">Открыть карточку</button>
                </div>
            </div>
            <div className="p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex justify-between">Файлы <span className="text-gray-300">{(selectedDeal.files || []).length}/5</span></h3>
                <div className="space-y-2 mb-3">
                {(selectedDeal.files || []).map((f, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100 text-xs truncate">
                        <FileText size={14} className="text-blue-500 flex-shrink-0"/><span className="truncate flex-1">{f.name}</span>
                    </div>
                ))}
                </div>
                <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition">
                <input type="file" multiple onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer"/>
                <Download size={20} className="mx-auto text-gray-400 mb-1"/>
                <div className="text-xs text-gray-500">Перетащите файлы</div>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default CrmView;
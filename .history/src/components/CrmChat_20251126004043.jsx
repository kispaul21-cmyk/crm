import React, { useRef, useEffect } from 'react';
import { MoreVertical, Plus, Smile, Send, Paperclip, Building2, X } from 'lucide-react';

const CrmChat = ({ 
  selectedDeal, messages, dealTasks, 
  quickTaskText, setQuickTaskText, addTask, toggleTask,
  newMessage, setNewMessage, sendMessage, replyTo, setReplyTo,
  openCompanyCard 
}) => {
  
  const messagesEndRef = useRef(null);
  
  // Авто-скролл вниз при новом сообщении
  useEffect(() => { 
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages]);

  if (!selectedDeal) {
    return <div className="flex-1 flex items-center justify-center text-gray-400 bg-[#eef1f5]">Выберите сделку</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-[#eef1f5] min-w-[500px]">
        {/* Хедер чата */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
            <div>
              <h2 className="font-bold text-slate-800 flex items-center gap-2">{selectedDeal.title}</h2>
              <p className="text-xs text-blue-600 cursor-pointer hover:underline flex items-center gap-1" onClick={() => openCompanyCard(selectedDeal.company_id)}>
                <Building2 size={10}/> {selectedDeal.company_name}
              </p>
            </div>
            <MoreVertical size={20} className="text-gray-400 cursor-pointer"/>
        </div>

        {/* Быстрые задачи */}
        <div className="bg-white/80 border-b border-gray-200 px-6 py-3 backdrop-blur-sm">
            <div className="flex flex-wrap gap-2 mb-2">
                {dealTasks.map(task => (
                <div key={task.id} onClick={() => toggleTask(task)} className="flex items-center gap-2 bg-white border border-blue-100 text-xs px-3 py-1.5 rounded-full cursor-pointer hover:border-blue-400 group">
                    <div className="w-3 h-3 border border-blue-400 rounded-full group-hover:bg-blue-400"></div><span>{task.text}</span>
                </div>
                ))}
            </div>
            <div className="flex items-center gap-2">
                <Plus size={14} className="text-blue-500"/>
                <input type="text" value={quickTaskText} onChange={(e) => setQuickTaskText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask(quickTaskText, selectedDeal.id)} placeholder="Добавить быструю задачу..." className="bg-transparent text-xs w-full outline-none"/>
            </div>
        </div>

        {/* Список сообщений */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 group ${msg.is_me ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${msg.is_me ? 'bg-blue-600' : 'bg-purple-600'}`}>{msg.is_me ? 'Я' : 'К'}</div>
                <div className="max-w-[70%]">
                {msg.reply_to_id && <div className="text-[10px] mb-1 p-1 border-l-2 border-gray-300 text-gray-500">Ответ на сообщение</div>}
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

        {/* Ввод сообщения */}
        <div className="p-4 bg-white border-t border-gray-200">
            {replyTo && <div className="flex justify-between bg-blue-50 p-2 text-xs text-blue-700 mb-2 rounded"><span>Ответ на: {replyTo.text}</span><X size={14} className="cursor-pointer" onClick={() => setReplyTo(null)}/></div>}
            <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-xl border border-transparent focus-within:bg-white focus-within:border-blue-200 transition-all">
            <button className="p-2 text-gray-400 hover:text-gray-600"><Smile size={20}/></button>
            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Написать..." className="flex-1 bg-transparent outline-none text-sm"/>
            <button onClick={sendMessage} className="bg-blue-600 text-white p-2 rounded-lg"><Send size={18}/></button>
            </div>
        </div>
    </div>
  );
};

export default CrmChat;
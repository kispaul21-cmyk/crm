import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import {
  LayoutDashboard, CheckSquare, Building2, Search, Paperclip, Send, MoreVertical, ChevronLeft, ChevronRight, FileText
} from 'lucide-react';

const App = () => {
  // --- СОСТОЯНИЯ ---
  const [deals, setDeals] = useState([]);
  const [messages, setMessages] = useState([]); // Сообщения текущего чата
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isStagesCollapsed, setIsStagesCollapsed] = useState(false);
  const [activeStageId, setActiveStageId] = useState(1);
  const [activeMenu, setActiveMenu] = useState('crm');

  const stages = [
    { id: 5, name: 'Доставлено (Финал)', color: 'border-blue-600' },
    { id: 4, name: 'Продано', color: 'border-green-500' },
    { id: 3, name: 'Договор / Юристы', color: 'border-yellow-400' },
    { id: 2, name: 'Переговоры', color: 'border-orange-500' },
    { id: 1, name: 'Новая заявка', color: 'border-red-500' },
  ];

  // 1. Загрузка сделок при старте
  useEffect(() => { fetchDeals(); }, []);

  async function fetchDeals() {
    setIsLoading(true);
    const { data } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
    setDeals(data || []);
    setIsLoading(false);
  }

  // 2. Загрузка сообщений при выборе сделки
  useEffect(() => {
    if (selectedDeal) {
      fetchMessages(selectedDeal.id);
    }
  }, [selectedDeal]);

  async function fetchMessages(dealId) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('deal_id', dealId) // Фильтр: только для этой сделки
      .order('created_at', { ascending: true }); // Сортируем: старые сверху
    setMessages(data || []);
  }

  // 3. Отправка сообщения
  async function sendMessage() {
    if (!newMessage.trim() || !selectedDeal) return;

    // Сначала отправляем в базу
    const { error } = await supabase.from('messages').insert([
      { deal_id: selectedDeal.id, text: newMessage, is_me: true }
    ]);

    if (!error) {
      setNewMessage('');
      fetchMessages(selectedDeal.id); // Обновляем чат
    }
  }

  async function createDeal() {
    const title = prompt("Название сделки:");
    if (!title) return;
    const company = prompt("Компания:");
    if (!company) return;

    const { error } = await supabase.from('deals').insert([{ title, company, stage: 1 }]);
    if (!error) {
      fetchDeals();
      setActiveStageId(1);
    }
  }

  const currentDeals = deals.filter(deal => deal.stage === activeStageId);
  const getStageCount = (id) => deals.filter(d => d.stage === id).length;

  return (
    <div className="flex h-screen w-full bg-gray-100 text-slate-800 font-sans overflow-hidden">

      {/* МЕНЮ */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 z-20">
        <div className="h-16 flex items-center px-6 font-bold text-white text-xl border-b border-slate-800">MY<span className="text-blue-500">CRM</span></div>
        <nav className="flex-1 py-6 space-y-1">
          <MenuItem icon={<LayoutDashboard size={20} />} label="CRM" active={activeMenu === 'crm'} onClick={() => setActiveMenu('crm')} />
          <MenuItem icon={<CheckSquare size={20} />} label="Задачи" onClick={() => setActiveMenu('tasks')} />
        </nav>
      </div>

      {/* ЭТАПЫ */}
      {activeMenu === 'crm' && (
        <div className={`${isStagesCollapsed ? 'w-16' : 'w-60'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 flex-shrink-0 relative z-10`}>
          <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100">
            <button onClick={() => setIsStagesCollapsed(!isStagesCollapsed)} className="p-1 hover:bg-gray-100 rounded text-slate-400">{isStagesCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}</button>
          </div>
          <div className="flex-1 overflow-y-auto py-2 flex flex-col justify-end space-y-1 px-2">
            {stages.map(stage => (
              <button key={stage.id} onClick={() => { setActiveStageId(stage.id); setSelectedDeal(null); }} className={`relative flex items-center justify-between p-3 rounded-l-md transition-all ${activeStageId === stage.id ? 'bg-slate-50' : 'hover:bg-slate-50'} border-r-4 ${stage.color}`}>
                {!isStagesCollapsed ? <><span className="font-medium text-sm">{stage.name}</span><span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{getStageCount(stage.id)}</span></> : <div className="w-full text-center text-xs font-bold">{getStageCount(stage.id)}</div>}
              </button>
            ))}
          </div>
          <div className="p-3 border-t border-gray-100"><button onClick={createDeal} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center font-bold text-xl">+</button></div>
        </div>
      )}

      {/* СПИСОК СДЕЛОК */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="h-14 flex items-center px-4 border-b border-gray-100 gap-2"><Search size={18} className="text-gray-400" /><input type="text" placeholder="Поиск..." className="w-full outline-none text-sm" /></div>
        <div className="flex-1 overflow-y-auto">
          {currentDeals.map(deal => (
            <div key={deal.id} onClick={() => setSelectedDeal(deal)} className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${selectedDeal?.id === deal.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
              <div className="font-bold text-sm">{deal.title}</div>
              <div className="text-xs text-gray-500">{deal.company}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ЧАТ */}
      <div className="flex-1 flex flex-col bg-slate-50 min-w-[400px]">
        {selectedDeal ? (
          <>
            <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
              <div><h2 className="font-bold text-slate-800">{selectedDeal.title}</h2><p className="text-xs text-green-600">● В работе</p></div>
              <MoreVertical size={20} className="text-gray-400 cursor-pointer" />
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && <div className="text-center text-gray-400 mt-10">Нет сообщений</div>}
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-3 ${msg.is_me ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${msg.is_me ? 'bg-blue-600' : 'bg-purple-600'}`}>{msg.is_me ? 'Я' : 'К'}</div>
                  <div className={`max-w-[70%] p-3 rounded-lg text-sm shadow-sm ${msg.is_me ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-700 rounded-bl-none'}`}>
                    {msg.text}
                    <div className={`text-[10px] text-right mt-1 opacity-70`}>{new Date(msg.created_at).toLocaleTimeString().slice(0, 5)}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Написать..." className="flex-1 bg-transparent outline-none text-sm" />
                <button onClick={sendMessage} className="bg-blue-600 text-white p-2 rounded-md"><Send size={18} /></button>
              </div>
            </div>
          </>
        ) : <div className="flex-1 flex items-center justify-center text-gray-400">Выберите сделку</div>}
      </div>

      {/* ИНФО */}
      {selectedDeal && (
        <div className="w-72 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Компания</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-xl">🏢</div>
              <div><div className="font-bold text-sm">{selectedDeal.company}</div><div className="text-xs text-blue-600 cursor-pointer">Профиль</div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MenuItem = ({ icon, label, active, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-3 px-6 py-3 cursor-pointer border-l-4 ${active ? 'bg-slate-800 border-blue-600 text-white' : 'border-transparent text-slate-400 hover:bg-slate-800'}`}>{icon}<span className="text-sm font-medium">{label}</span></div>
);

export default App;
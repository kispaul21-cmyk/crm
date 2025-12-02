import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import {
  LayoutDashboard, CheckSquare, Building2, Users, BarChart3, Settings,
  Search, Paperclip, Send, MoreVertical, ChevronLeft, ChevronRight, UserPlus, FileText
} from 'lucide-react';

const App = () => {
  // --- СОСТОЯНИЯ (ПАМЯТЬ) ---
  const [deals, setDeals] = useState([]); // Список сделок из базы
  const [isLoading, setIsLoading] = useState(true);
  const [isStagesCollapsed, setIsStagesCollapsed] = useState(false);
  const [activeStageId, setActiveStageId] = useState(1); // Текущий этап
  const [activeMenu, setActiveMenu] = useState('crm');
  const [selectedDeal, setSelectedDeal] = useState(null); // Какую сделку мы выбрали (для чата)

  // Временное хранилище сообщений (пока не подключили таблицу messages)
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // --- ЭТАПЫ (Справочник) ---
  const stages = [
    { id: 5, name: 'Доставлено (Финал)', color: 'border-blue-600', textColor: 'text-blue-600' },
    { id: 4, name: 'Продано', color: 'border-green-500', textColor: 'text-green-600' },
    { id: 3, name: 'Договор / Юристы', color: 'border-yellow-400', textColor: 'text-yellow-600' },
    { id: 2, name: 'Переговоры', color: 'border-orange-500', textColor: 'text-orange-600' },
    { id: 1, name: 'Новая заявка', color: 'border-red-500', textColor: 'text-red-500' },
  ];

  // --- ЗАГРУЗКА ПРИ СТАРТЕ ---
  useEffect(() => { fetchDeals(); }, []);

  async function fetchDeals() {
    setIsLoading(true);
    // Скачиваем сделки из Supabase
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error("Ошибка загрузки:", error);
    else setDeals(data || []);

    setIsLoading(false);
  }

  // --- СОЗДАНИЕ СДЕЛКИ ---
  async function createDeal() {
    const title = prompt("Название новой сделки:");
    if (!title) return;

    const company = prompt("Название компании:");
    if (!company) return;

    const { error } = await supabase
      .from('deals')
      .insert([{ title, company, stage: 1 }]);

    if (error) {
      alert("Ошибка! Проверь RLS в Supabase.");
    } else {
      fetchDeals(); // Обновляем список
      setActiveStageId(1); // Идем на первый этап
    }
  }

  // --- ОТПРАВКА СООБЩЕНИЯ (Пока локально) ---
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedDeal) return;

    const msg = {
      id: Date.now(),
      deal_id: selectedDeal.id,
      text: newMessage,
      is_me: true,
      time: new Date().toLocaleTimeString().slice(0, 5)
    };

    setMessages([...messages, msg]);
    setNewMessage('');
  };

  // --- ФИЛЬТРЫ ---
  // Показываем сделки только текущего этапа
  const currentDeals = deals.filter(deal => deal.stage === activeStageId);
  // Считаем сколько сделок на каждом этапе
  const getStageCount = (id) => deals.filter(d => d.stage === id).length;
  // Фильтруем сообщения для выбранного чата
  const currentChatMessages = messages.filter(m => selectedDeal && m.deal_id === selectedDeal.id);

  return (
    <div className="flex h-screen w-full bg-gray-100 text-slate-800 font-sans overflow-hidden">

      {/* 1. ГЛОБАЛЬНОЕ МЕНЮ СЛЕВА */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 z-20">
        <div className="h-16 flex items-center px-6 font-bold text-white text-xl tracking-wider border-b border-slate-800">
          MY<span className="text-blue-500">CRM</span>
        </div>
        <nav className="flex-1 py-6 space-y-1">
          <MenuItem icon={<LayoutDashboard size={20} />} label="CRM" active={activeMenu === 'crm'} onClick={() => setActiveMenu('crm')} />
          <MenuItem icon={<CheckSquare size={20} />} label="Задачи" onClick={() => setActiveMenu('tasks')} />
          <MenuItem icon={<Building2 size={20} />} label="Компании" onClick={() => setActiveMenu('companies')} />
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">А</div><span className="text-sm">Админ</span></div>
        </div>
      </div>

      {/* 2. НАВИГАТОР ЭТАПОВ (ЛЕСТНИЦА) */}
      {activeMenu === 'crm' && (
        <div className={`${isStagesCollapsed ? 'w-16' : 'w-60'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 flex-shrink-0 relative z-10`}>
          <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100">
            <button onClick={() => setIsStagesCollapsed(!isStagesCollapsed)} className="p-1 hover:bg-gray-100 rounded text-slate-400">
              {isStagesCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-2 flex flex-col justify-end space-y-1 px-2">
            {stages.map(stage => (
              <button key={stage.id} onClick={() => { setActiveStageId(stage.id); setSelectedDeal(null); }}
                className={`relative flex items-center justify-between p-3 rounded-l-md transition-all ${activeStageId === stage.id ? 'bg-slate-50' : 'hover:bg-slate-50'} border-r-4 ${stage.color}`}>
                {!isStagesCollapsed ?
                  <><span className="font-medium text-sm">{stage.name}</span><span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{getStageCount(stage.id)}</span></>
                  : <div className="w-full text-center text-xs font-bold">{getStageCount(stage.id)}</div>}
              </button>
            ))}
          </div>
          <div className="p-3 border-t border-gray-100">
            <button onClick={createDeal} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center font-bold text-xl transition shadow-sm">+</button>
          </div>
        </div>
      )}

      {/* 3. СПИСОК СДЕЛОК (ЛЕНТА) */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="h-14 flex items-center px-4 border-b border-gray-100 gap-2">
          <Search size={18} className="text-gray-400" />
          <input type="text" placeholder="Поиск..." className="w-full outline-none text-sm" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? <div className="p-10 text-center text-sm text-gray-400">Загрузка...</div> :
            currentDeals.length === 0 ? <div className="p-10 text-center text-sm text-gray-400">На этапе «{stages.find(s => s.id === activeStageId)?.name}» пусто</div> :
              currentDeals.map(deal => (
                <div key={deal.id} onClick={() => setSelectedDeal(deal)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${selectedDeal?.id === deal.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
                  <div className="flex justify-between mb-1">
                    <span className="font-bold text-sm text-slate-800">{deal.title}</span>
                    <span className="text-xs text-gray-400">12:00</span>
                  </div>
                  <div className="text-xs text-gray-500 truncate">{deal.company}</div>
                </div>
              ))}
        </div>
      </div>

      {/* 4. ЧАТ (РАБОЧАЯ ОБЛАСТЬ) */}
      <div className="flex-1 flex flex-col bg-slate-50 min-w-[400px]">
        {selectedDeal ? (
          <>
            {/* Хедер чата */}
            <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
              <div>
                <h2 className="font-bold text-slate-800">{selectedDeal.title}</h2>
                <p className="text-xs text-green-600 flex items-center gap-1">● В работе</p>
              </div>
              <MoreVertical size={20} className="text-gray-400 cursor-pointer" />
            </div>

            {/* Сообщения */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="text-center text-xs text-gray-400 my-4">Начало переписки</div>
              {currentChatMessages.length === 0 && <div className="text-center text-sm text-gray-400 mt-10">Напишите первое сообщение...</div>}

              {currentChatMessages.map(msg => (
                <div key={msg.id} className={`flex gap-3 ${msg.is_me ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${msg.is_me ? 'bg-blue-600' : 'bg-purple-600'}`}>
                    {msg.is_me ? 'Я' : 'К'}
                  </div>
                  <div className={`max-w-[70%] p-3 rounded-lg text-sm shadow-sm ${msg.is_me ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-700 rounded-bl-none'}`}>
                    {msg.text}
                    <div className={`text-[10px] text-right mt-1 ${msg.is_me ? 'text-blue-200' : 'text-gray-400'}`}>{msg.time}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Ввод текста */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 focus-within:ring-2 ring-blue-100">
                <button className="text-gray-400 hover:text-gray-600 p-1"><Paperclip size={20} /></button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Написать сообщение..."
                  className="flex-1 bg-transparent outline-none text-sm"
                />
                <button onClick={sendMessage} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition"><Send size={18} /></button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Выберите сделку слева, чтобы начать чат
          </div>
        )}
      </div>

      {/* 5. ИНСПЕКТОР (ПРАВЫЙ САЙДБАР) */}
      {selectedDeal && (
        <div className="w-72 bg-white border-l border-gray-200 flex flex-col flex-shrink-0 overflow-y-auto">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Компания</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-xl">🏢</div>
              <div>
                <div className="font-bold text-sm">{selectedDeal.company}</div>
                <div className="text-xs text-blue-600 cursor-pointer">Открыть профиль</div>
              </div>
            </div>
          </div>
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Детали</h3>
            <div className="text-sm text-gray-600">ID сделки: {selectedDeal.id}</div>
            <div className="text-sm text-gray-600 mt-1">Создано: {new Date(selectedDeal.created_at).toLocaleDateString()}</div>
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
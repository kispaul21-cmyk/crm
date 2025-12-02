import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import {
  LayoutDashboard, CheckSquare, Building2, Users, BarChart3, Settings,
  Search, Paperclip, Send, MoreVertical, ChevronLeft, ChevronRight,
  Trash2, Plus, Smile, Reply, X, File, Calendar, User, Briefcase
} from 'lucide-react';

const App = () => {
  // --- ГЛОБАЛЬНЫЕ СОСТОЯНИЯ ---
  const [activeMenu, setActiveMenu] = useState('crm');
  const [isLoading, setIsLoading] = useState(false);

  // Данные
  const [deals, setDeals] = useState([]);
  const [tasks, setTasks] = useState([]); // Все задачи
  const [messages, setMessages] = useState([]);
  const [companies, setCompanies] = useState([]);

  // CRM Состояния
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [activeStageId, setActiveStageId] = useState(1);
  const [isStagesCollapsed, setIsStagesCollapsed] = useState(false);

  // Чат Состояния
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null); // На какое сообщение отвечаем
  const messagesEndRef = useRef(null);

  // Задачи Состояния
  const [quickTaskText, setQuickTaskText] = useState(''); // Для быстрой задачи в чате
  const [globalTaskText, setGlobalTaskText] = useState(''); // Для глобальной задачи
  const [taskFilter, setTaskFilter] = useState('all'); // all, my, assigned

  // Этапы (Сверху вниз, как просил)
  const stages = [
    { id: 1, name: 'Новая заявка', color: 'border-red-500', bg: 'bg-red-50' },
    { id: 2, name: 'Переговоры', color: 'border-orange-500', bg: 'bg-orange-50' },
    { id: 3, name: 'Договор / Юристы', color: 'border-yellow-400', bg: 'bg-yellow-50' },
    { id: 4, name: 'Продано', color: 'border-green-500', bg: 'bg-green-50' },
    { id: 5, name: 'Доставлено', color: 'border-blue-600', bg: 'bg-blue-50' },
  ];

  // --- ЗАГРУЗКА ДАННЫХ ---
  useEffect(() => {
    fetchDeals();
    fetchTasks();
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedDeal) {
      fetchMessages(selectedDeal.id);
      // Скролл вниз при открытии чата
      scrollToBottom();
    }
  }, [selectedDeal]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // --- API ФУНКЦИИ ---
  async function fetchDeals() {
    setIsLoading(true);
    const { data } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
    setDeals(data || []);
    setIsLoading(false);
  }

  async function fetchTasks() {
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    setTasks(data || []);
  }

  async function fetchCompanies() {
    const { data } = await supabase.from('companies').select('*');
    setCompanies(data || []);
  }

  async function fetchMessages(dealId) {
    const { data } = await supabase.from('messages').select('*').eq('deal_id', dealId).order('created_at', { ascending: true });
    setMessages(data || []);
    setTimeout(scrollToBottom, 100);
  }

  // --- ЛОГИКА СДЕЛОК ---
  async function createDeal() {
    const title = prompt("Название сделки:"); if (!title) return;
    const companyName = prompt("Компания:"); if (!companyName) return;

    // Создаем сделку
    const { error } = await supabase.from('deals').insert([{ title, stage: 1, company_name: companyName }]);
    if (!error) { fetchDeals(); setActiveStageId(1); }
  }

  async function updateStage(newStageId) {
    if (!selectedDeal) return;
    await supabase.from('deals').update({ stage: newStageId }).eq('id', selectedDeal.id);
    fetchDeals();
    setSelectedDeal(null);
    setActiveStageId(Number(newStageId));
  }

  // --- ЛОГИКА ЗАДАЧ (БЫСТРЫХ И ГЛОБАЛЬНЫХ) ---
  async function addTask(text, dealId = null, assignee = 'Я') {
    if (!text.trim()) return;
    await supabase.from('tasks').insert([{ text, deal_id: dealId, assignee }]);
    fetchTasks();
    if (dealId) setQuickTaskText('');
    else setGlobalTaskText('');
  }

  async function toggleTask(task) {
    await supabase.from('tasks').update({ is_done: !task.is_done }).eq('id', task.id);
    fetchTasks();
  }

  // --- ЛОГИКА ЧАТА ---
  async function sendMessage() {
    if (!newMessage.trim() || !selectedDeal) return;

    await supabase.from('messages').insert([
      {
        deal_id: selectedDeal.id,
        text: newMessage,
        is_me: true,
        reply_to_id: replyTo ? replyTo.id : null
      }
    ]);

    setNewMessage('');
    setReplyTo(null);
    fetchMessages(selectedDeal.id);
  }

  // --- ВСПОМОГАТЕЛЬНЫЕ ---
  const currentDeals = deals.filter(deal => deal.stage === activeStageId);
  // Задачи текущей сделки
  const dealTasks = tasks.filter(t => selectedDeal && t.deal_id === selectedDeal.id && !t.is_done);

  // Глобальные задачи (фильтрация)
  const filteredGlobalTasks = tasks.filter(t => {
    if (taskFilter === 'my') return t.assignee === 'Я';
    if (taskFilter === 'assigned') return t.assignee !== 'Я';
    return true;
  });

  return (
    <div className="flex h-screen w-full bg-gray-50 text-slate-800 font-sans overflow-hidden">

      {/* 1. ГЛОБАЛЬНОЕ МЕНЮ (ПОЛНЫЙ ФАРШ) */}
      <div className="w-64 bg-slate-900 text-slate-400 flex flex-col flex-shrink-0 z-30 shadow-xl">
        <div className="h-16 flex items-center px-6 font-bold text-white text-xl border-b border-slate-800 tracking-wide">
          MY<span className="text-blue-500">CRM</span>
        </div>

        <div className="p-4">
          <button onClick={createDeal} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-medium shadow-lg shadow-blue-900/50 transition mb-2 flex items-center justify-center gap-2">
            <Plus size={18} /> Создать сделку
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <MenuHeader title="Основное" />
          <MenuItem icon={<LayoutDashboard size={18} />} label="CRM" active={activeMenu === 'crm'} onClick={() => setActiveMenu('crm')} />
          <MenuItem icon={<CheckSquare size={18} />} label="Задачи" badge={tasks.filter(t => !t.is_done && !t.deal_id).length} active={activeMenu === 'tasks'} onClick={() => setActiveMenu('tasks')} />

          <MenuHeader title="База" />
          <MenuItem icon={<Building2 size={18} />} label="Компании" active={activeMenu === 'companies'} onClick={() => setActiveMenu('companies')} />
          <MenuItem icon={<Users size={18} />} label="Команда" onClick={() => { }} />

          <MenuHeader title="Система" />
          <MenuItem icon={<BarChart3 size={18} />} label="Аналитика" onClick={() => { }} />
          <MenuItem icon={<Settings size={18} />} label="Настройки" onClick={() => { }} />
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">A</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">Алексей</div>
              <div className="text-xs text-slate-500 truncate">Администратор</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- РАЗДЕЛ CRM --- */}
      {activeMenu === 'crm' && (
        <>
          {/* 2. НАВИГАТОР ЭТАПОВ (СВЕРХУ ВНИЗ) */}
          <div className={`${isStagesCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 flex-shrink-0 relative z-20`}>
            <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100">
              {!isStagesCollapsed && <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Воронка</span>}
              <button onClick={() => setIsStagesCollapsed(!isStagesCollapsed)} className="p-1 hover:bg-gray-100 rounded text-slate-400">{isStagesCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}</button>
            </div>

            {/* СПИСОК ЭТАПОВ СВЕРХУ ВНИЗ */}
            <div className="flex-1 overflow-y-auto py-2 flex flex-col justify-start space-y-1 px-2">
              {stages.map(stage => {
                const count = deals.filter(d => d.stage === stage.id).length;
                return (
                  <button
                    key={stage.id}
                    onClick={() => { setActiveStageId(stage.id); setSelectedDeal(null); }}
                    className={`
                      relative flex items-center justify-between p-3 rounded-lg transition-all 
                      ${activeStageId === stage.id ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-50'} 
                      border-r-4 ${activeStageId === stage.id ? stage.color : 'border-transparent'}
                    `}
                  >
                    {!isStagesCollapsed ? (
                      <>
                        <div className="flex items-center gap-2">
                          {/* Цветная точка для красоты */}
                          <div className={`w-2 h-2 rounded-full ${stage.color.replace('border', 'bg')}`}></div>
                          <span className="font-medium text-sm">{stage.name}</span>
                        </div>
                        {count > 0 && <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full shadow-sm">{count}</span>}
                      </>
                    ) : (
                      <div className="w-full flex justify-center text-xs font-bold">{count}</div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3. СПИСОК СДЕЛОК (Сверху вниз) */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
            <div className="h-14 flex items-center px-4 border-b border-gray-100 gap-2">
              <Search size={18} className="text-gray-400" />
              <input type="text" placeholder="Поиск..." className="w-full outline-none text-sm" />
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-50/50">
              {currentDeals.length === 0 && <div className="p-10 text-center text-sm text-gray-400">Пусто</div>}
              {currentDeals.map(deal => (
                <div key={deal.id} onClick={() => setSelectedDeal(deal)} className={`group p-4 border-b cursor-pointer hover:bg-white transition-all ${selectedDeal?.id === deal.id ? 'bg-white border-l-4 border-l-blue-500 shadow-md z-10' : 'border-l-4 border-l-transparent'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className={`font-bold text-sm ${selectedDeal?.id === deal.id ? 'text-blue-600' : 'text-slate-700'}`}>{deal.title}</span>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{new Date(deal.created_at).toLocaleTimeString().slice(0, 5)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Briefcase size={12} />
                    <span className="truncate">{deal.company_name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. ЧАТ (MAX FUNCTIONALITY) */}
          <div className="flex-1 flex flex-col bg-[#eef1f5] min-w-[500px] relative">
            {selectedDeal ? (
              <>
                {/* Хедер чата */}
                <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
                  <div>
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                      {selectedDeal.title}
                      <span className="px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700 font-normal">#{selectedDeal.id}</span>
                    </h2>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      {selectedDeal.company_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-400">Менеджер: <b>Алексей</b></div>
                    <MoreVertical size={20} className="text-gray-400 cursor-pointer hover:text-slate-600" />
                  </div>
                </div>

                {/* --- БЫСТРЫЕ ЗАДАЧИ В ЧАТЕ --- */}
                <div className="bg-white/80 border-b border-gray-200 px-6 py-3 backdrop-blur-sm">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {dealTasks.map(task => (
                      <div key={task.id} className="flex items-center gap-2 bg-white border border-blue-100 text-slate-700 text-xs px-3 py-1.5 rounded-full shadow-sm hover:border-blue-300 transition group cursor-pointer" onClick={() => toggleTask(task)}>
                        <div className="w-4 h-4 rounded-full border border-blue-400 flex items-center justify-center group-hover:bg-blue-500 group-hover:border-blue-500 transition">
                          <div className="w-2 h-2 bg-transparent group-hover:bg-white rounded-full"></div>
                        </div>
                        <span>{task.text}</span>
                        <img src={`https://ui-avatars.com/api/?name=${task.assignee}&background=random&size=24`} className="w-4 h-4 rounded-full ml-1" alt="avatar" />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Plus size={14} className="text-blue-500" />
                    <input
                      type="text"
                      value={quickTaskText}
                      onChange={(e) => setQuickTaskText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addTask(quickTaskText, selectedDeal.id)}
                      placeholder="Добавить быструю задачу..."
                      className="bg-transparent text-xs outline-none w-full text-slate-600 placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Сообщения */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 && <div className="text-center text-gray-400 mt-10 text-sm">История переписки пуста</div>}
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex gap-3 group ${msg.is_me ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${msg.is_me ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-purple-500 to-purple-600'}`}>
                        {msg.is_me ? 'Я' : 'К'}
                      </div>
                      <div className="max-w-[70%]">
                        {/* Цитата (если есть) */}
                        {msg.reply_to_id && (
                          <div className={`text-[10px] mb-1 p-1 border-l-2 ${msg.is_me ? 'border-blue-200 text-right' : 'border-purple-200 text-left'}`}>
                            Ответ на сообщение
                          </div>
                        )}
                        <div className={`p-3 rounded-2xl text-sm shadow-sm relative ${msg.is_me ? 'bg-white text-slate-800 rounded-tr-none border border-blue-100' : 'bg-white text-slate-800 rounded-tl-none border border-gray-100'}`}>
                          {msg.text}
                          <div className="text-[10px] text-gray-400 text-right mt-1">{new Date(msg.created_at).toLocaleTimeString().slice(0, 5)}</div>
                        </div>
                        {/* Кнопка ответа (появляется при наведении) */}
                        <button onClick={() => setReplyTo(msg)} className={`opacity-0 group-hover:opacity-100 transition text-[10px] text-gray-400 mt-1 hover:text-blue-600 ${msg.is_me ? 'text-right' : 'text-left'}`}>
                          Ответить
                        </button>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Ввод текста */}
                <div className="p-4 bg-white border-t border-gray-200">
                  {/* Плашка ответа */}
                  {replyTo && (
                    <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-t-lg border-b border-blue-100 text-xs text-blue-700 mb-2">
                      <span>Ответ на: <b>{replyTo.text.slice(0, 30)}...</b></span>
                      <X size={14} className="cursor-pointer hover:text-red-500" onClick={() => setReplyTo(null)} />
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-xl border border-transparent focus-within:bg-white focus-within:border-blue-200 focus-within:shadow-md transition-all">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition"><Paperclip size={20} /></button>
                    <button className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-gray-200 rounded-full transition"><Smile size={20} /></button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Написать сообщение..."
                      className="flex-1 bg-transparent outline-none text-sm"
                    />
                    <button onClick={sendMessage} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition shadow-md shadow-blue-200"><Send size={18} /></button>
                  </div>
                </div>
              </>
            ) : <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50">Выберите сделку слева</div>}
          </div>

          {/* 5. ИНФО (САЙДБАР) */}
          {selectedDeal && (
            <div className="w-72 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Этап</h3>
                <select className="w-full p-2 bg-white border border-gray-200 rounded-md text-sm outline-none focus:ring-2 ring-blue-100" value={selectedDeal.stage} onChange={(e) => updateStage(e.target.value)}>
                  {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Детали</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-lg shadow-sm">🏢</div>
                    <div><div className="font-bold text-sm text-slate-800">{selectedDeal.company_name}</div><div className="text-xs text-blue-600 cursor-pointer">Карточка клиента</div></div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-lg shadow-sm">💰</div>
                    <div><div className="font-bold text-sm text-slate-800">1 200 000 ₽</div><div className="text-xs text-gray-500">Бюджет</div></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* --- РАЗДЕЛ ЗАДАЧИ --- */}
      {activeMenu === 'tasks' && (
        <div className="flex-1 bg-gray-50 flex flex-col p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-slate-800">Задачи</h1>
              <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                <button onClick={() => setTaskFilter('all')} className={`px-4 py-1.5 text-sm rounded-md transition ${taskFilter === 'all' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>Все</button>
                <button onClick={() => setTaskFilter('my')} className={`px-4 py-1.5 text-sm rounded-md transition ${taskFilter === 'my' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>Мои</button>
                <button onClick={() => setTaskFilter('assigned')} className={`px-4 py-1.5 text-sm rounded-md transition ${taskFilter === 'assigned' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>Поручил</button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="p-4 flex gap-3 border-b border-gray-100">
                <input
                  type="text"
                  value={globalTaskText}
                  onChange={(e) => setGlobalTaskText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTask(globalTaskText)}
                  placeholder="Новая задача..."
                  className="flex-1 outline-none text-sm"
                />
                <div className="h-6 w-px bg-gray-200"></div>
                <select className="text-sm text-gray-500 outline-none bg-transparent cursor-pointer hover:text-blue-600">
                  <option>Исполнитель: Я</option>
                  <option>Исполнитель: Петя</option>
                </select>
                <button onClick={() => addTask(globalTaskText)} className="text-blue-600 font-medium text-sm hover:underline">Добавить</button>
              </div>

              <div className="divide-y divide-gray-100">
                {filteredGlobalTasks.map(task => (
                  <div key={task.id} className="group flex items-center p-4 hover:bg-gray-50 transition">
                    <button onClick={() => toggleTask(task)} className={`w-5 h-5 rounded border mr-4 flex items-center justify-center transition ${task.is_done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-blue-500'}`}>
                      {task.is_done && <CheckSquare size={12} />}
                    </button>
                    <div className="flex-1">
                      <div className={`text-sm ${task.is_done ? 'text-gray-400 line-through' : 'text-slate-800'}`}>{task.text}</div>
                      <div className="flex gap-2 text-[10px] text-gray-400 mt-1">
                        <span className="flex items-center gap-1"><User size={10} /> {task.assignee}</span>
                        {task.deal_id && <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-1.5 rounded">Сделка #{task.deal_id}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- РАЗДЕЛ КОМПАНИИ --- */}
      {activeMenu === 'companies' && (
        <div className="flex-1 bg-gray-50 p-8">
          <h1 className="text-2xl font-bold mb-6 text-slate-800">Компании</h1>
          <div className="grid grid-cols-3 gap-4">
            {companies.map(c => (
              <div key={c.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer">
                <div className="font-bold text-lg mb-1">{c.name}</div>
                <div className="text-sm text-gray-500 mb-4">ИНН: {c.inn}</div>
                <button className="w-full py-2 border border-gray-200 rounded text-sm hover:bg-gray-50 text-gray-600">Открыть карточку</button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

// --- КОМПОНЕНТЫ МЕНЮ ---
const MenuHeader = ({ title }) => (
  <div className="px-6 mt-6 mb-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider">{title}</div>
);

const MenuItem = ({ icon, label, badge, active, onClick }) => (
  <div onClick={onClick} className={`group flex items-center gap-3 px-6 py-2.5 cursor-pointer rounded-lg mx-2 transition-all ${active ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    {icon}
    <span className="text-sm font-medium flex-1">{label}</span>
    {badge ? <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">{badge}</span> : null}
  </div>
);

export default App;
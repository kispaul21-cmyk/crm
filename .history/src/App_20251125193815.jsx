import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import {
  LayoutDashboard, CheckSquare, Building2, Users, BarChart3, Settings,
  Search, Paperclip, Send, MoreVertical, ChevronLeft, ChevronRight,
  Trash2, Plus, Smile, X, FileText, Download, Briefcase, Globe, Phone, Mail, User
} from 'lucide-react';

const App = () => {
  // --- ГЛОБАЛЬНЫЕ СОСТОЯНИЯ ---
  const [activeMenu, setActiveMenu] = useState('crm');
  const [isLoading, setIsLoading] = useState(false);

  // Данные
  const [deals, setDeals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [companies, setCompanies] = useState([]);

  // CRM Состояния
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [activeStageId, setActiveStageId] = useState(1);
  const [isStagesCollapsed, setIsStagesCollapsed] = useState(false);

  // Чат
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const messagesEndRef = useRef(null);

  // Задачи
  const [quickTaskText, setQuickTaskText] = useState('');
  const [globalTaskText, setGlobalTaskText] = useState('');
  const [taskFilter, setTaskFilter] = useState('all');

  // МОДАЛЬНЫЕ ОКНА
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null); // Какую компанию редактируем

  // Этапы
  const stages = [
    { id: 1, name: 'Новая заявка', color: 'border-red-500', bg: 'bg-red-50', text: 'text-red-600' },
    { id: 2, name: 'Переговоры', color: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-600' },
    { id: 3, name: 'Договор / Юристы', color: 'border-yellow-400', bg: 'bg-yellow-50', text: 'text-yellow-600' },
    { id: 4, name: 'Продано', color: 'border-green-500', bg: 'bg-green-50', text: 'text-green-600' },
    { id: 5, name: 'Доставлено', color: 'border-blue-600', bg: 'bg-blue-50', text: 'text-blue-600' },
  ];

  // --- ЗАГРУЗКА ---
  useEffect(() => {
    fetchDeals();
    fetchTasks();
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedDeal) {
      fetchMessages(selectedDeal.id);
      setTimeout(scrollToBottom, 100);
    }
  }, [selectedDeal]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // --- API ---
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
    const { data } = await supabase.from('companies').select('*').order('name');
    setCompanies(data || []);
  }
  async function fetchMessages(dealId) {
    const { data } = await supabase.from('messages').select('*').eq('deal_id', dealId).order('created_at', { ascending: true });
    setMessages(data || []);
  }

  // --- ЛОГИКА КОМПАНИЙ (КАРТОЧКА) ---
  const openCompanyCard = async (companyId, companyNameIfNew = '') => {
    if (companyId) {
      // Открываем существующую
      const company = companies.find(c => c.id === companyId);
      setEditingCompany(company || { name: 'Ошибка', inn: '' });
    } else {
      // Создаем новую (пустышку для формы)
      setEditingCompany({ id: null, name: companyNameIfNew, inn: '', phone: '', email: '', website: '', director: '', description: '' });
    }
    setIsCompanyModalOpen(true);
  };

  const saveCompany = async () => {
    if (!editingCompany.name) return alert('Введите название компании');

    const companyData = {
      name: editingCompany.name,
      inn: editingCompany.inn,
      phone: editingCompany.phone,
      email: editingCompany.email,
      website: editingCompany.website,
      director: editingCompany.director,
      description: editingCompany.description
    };

    let savedId = editingCompany.id;

    if (editingCompany.id) {
      // Обновляем
      await supabase.from('companies').update(companyData).eq('id', editingCompany.id);
    } else {
      // Создаем новую
      const { data } = await supabase.from('companies').insert([companyData]).select();
      if (data) savedId = data[0].id;
    }

    await fetchCompanies();
    setIsCompanyModalOpen(false);
    return savedId;
  };

  // --- ЛОГИКА СДЕЛОК ---
  async function createDeal() {
    const title = prompt("Название сделки:"); if (!title) return;
    const companyName = prompt("Компания (или ID существующей):"); if (!companyName) return;

    // Ищем компанию по имени, если нет - создаем простую
    let companyId = companies.find(c => c.name.toLowerCase() === companyName.toLowerCase())?.id;

    if (!companyId) {
      const { data } = await supabase.from('companies').insert([{ name: companyName }]).select();
      if (data) companyId = data[0].id;
      fetchCompanies();
    }

    const { error } = await supabase.from('deals').insert([{ title, stage: 1, company_id: companyId, company_name: companyName }]);
    if (!error) { fetchDeals(); setActiveStageId(1); }
  }

  async function updateStage(newStageId) {
    if (!selectedDeal) return;
    await supabase.from('deals').update({ stage: newStageId }).eq('id', selectedDeal.id);
    fetchDeals();
    setSelectedDeal(null);
    setActiveStageId(Number(newStageId));
  }

  // --- ЛОГИКА ФАЙЛОВ ---
  async function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    if (files.length > 5) return alert("Максимум 5 файлов!");

    // Симуляция загрузки (так как нужен Storage бакет).
    // Мы сохраняем метаданные файлов в JSON поле сделки.
    const newFilesData = files.map(f => ({
      name: f.name,
      size: (f.size / 1024 / 1024).toFixed(2) + ' MB',
      type: f.type,
      url: '#' // Тут была бы ссылка на Supabase Storage
    }));

    // Проверяем размер
    if (files.some(f => f.size > 20 * 1024 * 1024)) return alert("Файл не может быть больше 20MB!");

    const currentFiles = selectedDeal.files || [];
    const updatedFiles = [...currentFiles, ...newFilesData].slice(0, 5); // Лимит 5

    await supabase.from('deals').update({ files: updatedFiles }).eq('id', selectedDeal.id);

    // Обновляем локально
    const updatedDeal = { ...selectedDeal, files: updatedFiles };
    setSelectedDeal(updatedDeal);
    // Обновляем в общем списке
    setDeals(deals.map(d => d.id === updatedDeal.id ? updatedDeal : d));
  }

  // --- ЛОГИКА ЗАДАЧ ---
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
    await supabase.from('messages').insert([{ deal_id: selectedDeal.id, text: newMessage, is_me: true, reply_to_id: replyTo ? replyTo.id : null }]);
    setNewMessage(''); setReplyTo(null); fetchMessages(selectedDeal.id);
  }

  // --- ВСПОМОГАТЕЛЬНЫЕ ---
  const currentDeals = deals.filter(deal => deal.stage === activeStageId);
  const dealTasks = tasks.filter(t => selectedDeal && t.deal_id === selectedDeal.id && !t.is_done);

  const filteredGlobalTasks = tasks.filter(t => {
    if (taskFilter === 'my') return t.assignee === 'Я';
    if (taskFilter === 'assigned') return t.assignee !== 'Я';
    return true;
  });

  return (
    <div className="flex h-screen w-full bg-gray-50 text-slate-800 font-sans overflow-hidden">

      {/* 1. ЛЕВОЕ МЕНЮ */}
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
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">A</div>
            <div><div className="text-sm font-medium text-white">Алексей</div><div className="text-xs text-slate-500">Администратор</div></div>
          </div>
        </div>
      </div>

      {/* --- РАЗДЕЛ CRM --- */}
      {activeMenu === 'crm' && (
        <>
          {/* 2. ЭТАПЫ (ЦВЕТНЫЕ ВСЕГДА) */}
          <div className={`${isStagesCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 flex-shrink-0 relative z-20`}>
            <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100">
              {!isStagesCollapsed && <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Воронка</span>}
              <button onClick={() => setIsStagesCollapsed(!isStagesCollapsed)} className="p-1 hover:bg-gray-100 rounded text-slate-400">{isStagesCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}</button>
            </div>

            <div className="flex-1 overflow-y-auto py-2 flex flex-col justify-start space-y-1 px-2">
              {stages.map(stage => {
                const count = deals.filter(d => d.stage === stage.id).length;
                const isActive = activeStageId === stage.id;
                return (
                  <button key={stage.id} onClick={() => { setActiveStageId(stage.id); setSelectedDeal(null); }}
                    className={`
                      relative flex items-center justify-between p-3 rounded-lg transition-all border-l-4 
                      ${stage.color} /* Цветная полоска всегда */
                      ${isActive ? 'bg-slate-100 shadow-sm' : 'hover:bg-slate-50'}
                    `}
                  >
                    {!isStagesCollapsed ? (
                      <>
                        <span className={`font-medium text-sm ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>{stage.name}</span>
                        {count > 0 && <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full shadow-sm">{count}</span>}
                      </>
                    ) : <div className="w-full flex justify-center text-xs font-bold">{count}</div>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3. СПИСОК СДЕЛОК */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
            <div className="h-14 flex items-center px-4 border-b border-gray-100 gap-2">
              <Search size={18} className="text-gray-400" /><input type="text" placeholder="Поиск..." className="w-full outline-none text-sm" />
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-50/50">
              {currentDeals.map(deal => (
                <div key={deal.id} onClick={() => setSelectedDeal(deal)} className={`p-4 border-b cursor-pointer hover:bg-white transition-all ${selectedDeal?.id === deal.id ? 'bg-white border-l-4 border-l-blue-500 shadow-md' : 'border-l-4 border-l-transparent'}`}>
                  <div className="font-bold text-sm text-slate-700 mb-1">{deal.title}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500"><Briefcase size={12} /><span className="truncate">{deal.company_name}</span></div>
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
                    <p className="text-xs text-blue-600 cursor-pointer hover:underline flex items-center gap-1" onClick={() => openCompanyCard(selectedDeal.company_id)}>
                      <Building2 size={10} /> {selectedDeal.company_name} (Открыть карточку)
                    </p>
                  </div>
                  <MoreVertical size={20} className="text-gray-400 cursor-pointer" />
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
                  <div className="flex items-center gap-2"><Plus size={14} className="text-blue-500" /><input type="text" value={quickTaskText} onChange={(e) => setQuickTaskText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask(quickTaskText, selectedDeal.id)} placeholder="Добавить быструю задачу..." className="bg-transparent text-xs w-full outline-none" /></div>
                </div>

                {/* Сообщения */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex gap-3 ${msg.is_me ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${msg.is_me ? 'bg-blue-600' : 'bg-purple-600'}`}>{msg.is_me ? 'Я' : 'К'}</div>
                      <div className="max-w-[70%]">
                        {msg.reply_to_id && <div className="text-[10px] mb-1 p-1 border-l-2 border-gray-300">Ответ на сообщение</div>}
                        <div className={`p-3 rounded-2xl text-sm shadow-sm ${msg.is_me ? 'bg-white text-slate-800 rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none'}`}>
                          {msg.text}
                          <div className="text-[10px] text-gray-400 text-right mt-1">{new Date(msg.created_at).toLocaleTimeString().slice(0, 5)}</div>
                        </div>
                        <button onClick={() => setReplyTo(msg)} className="text-[10px] text-gray-400 mt-1 hover:text-blue-600 opacity-0 group-hover:opacity-100">Ответить</button>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Ввод */}
                <div className="p-4 bg-white border-t border-gray-200">
                  {replyTo && <div className="flex justify-between bg-blue-50 p-2 text-xs text-blue-700 mb-2 rounded"><span>Ответ на: {replyTo.text}</span><X size={14} className="cursor-pointer" onClick={() => setReplyTo(null)} /></div>}
                  <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-xl border border-transparent focus-within:bg-white focus-within:border-blue-200 transition-all">
                    <button className="p-2 text-gray-400 hover:text-gray-600"><Smile size={20} /></button>
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Написать..." className="flex-1 bg-transparent outline-none text-sm" />
                    <button onClick={sendMessage} className="bg-blue-600 text-white p-2 rounded-lg"><Send size={18} /></button>
                  </div>
                </div>
              </>
            ) : <div className="flex-1 flex items-center justify-center text-gray-400">Выберите сделку</div>}
          </div>

          {/* 5. ИНФО (ПРАВЫЙ САЙДБАР) */}
          {selectedDeal && (
            <div className="w-72 bg-white border-l border-gray-200 flex flex-col flex-shrink-0 overflow-y-auto">
              {/* Этап */}
              <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Этап</h3>
                <select className="w-full p-2 bg-white border border-gray-200 rounded text-sm outline-none" value={selectedDeal.stage} onChange={(e) => updateStage(e.target.value)}>
                  {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {/* Компания */}
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Компания</h3>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-2">
                  <div className="font-bold text-sm text-slate-800">{selectedDeal.company_name}</div>
                  <button onClick={() => openCompanyCard(selectedDeal.company_id)} className="text-xs text-blue-600 mt-1 hover:underline">Открыть карточку</button>
                </div>
              </div>

              {/* Файлы (Drag & Drop) */}
              <div className="p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex justify-between">
                  Файлы <span className="text-gray-300">{(selectedDeal.files || []).length}/5</span>
                </h3>
                <div className="space-y-2 mb-3">
                  {(selectedDeal.files || []).map((f, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100 text-xs truncate group">
                      <FileText size={14} className="text-blue-500 flex-shrink-0" />
                      <span className="truncate flex-1">{f.name}</span>
                      <span className="text-gray-400 text-[10px]">{f.size}</span>
                    </div>
                  ))}
                </div>

                {/* Зона загрузки */}
                <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition">
                  <input type="file" multiple onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" title="Перетащите файлы сюда" />
                  <Download size={20} className="mx-auto text-gray-400 mb-1" />
                  <div className="text-xs text-gray-500">Перетащите файлы</div>
                  <div className="text-[10px] text-gray-400">до 5 шт, макс 20MB</div>
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
              <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                <button onClick={() => setTaskFilter('all')} className={`px-4 py-1.5 text-sm rounded ${taskFilter === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-500'}`}>Все</button>
                <button onClick={() => setTaskFilter('my')} className={`px-4 py-1.5 text-sm rounded ${taskFilter === 'my' ? 'bg-blue-50 text-blue-700' : 'text-gray-500'}`}>Мои</button>
              </div>
            </div>

            {/* Добавление задачи */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-3 mb-6">
              <input type="text" value={globalTaskText} onChange={(e) => setGlobalTaskText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask(globalTaskText)} placeholder="Новая задача..." className="flex-1 outline-none text-sm" />
              <button onClick={() => addTask(globalTaskText)} className="text-blue-600 font-medium text-sm">Добавить</button>
            </div>

            <div className="space-y-2">
              {filteredGlobalTasks.map(task => (
                <div key={task.id} className="flex items-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition">
                  <button onClick={() => toggleTask(task)} className={`w-5 h-5 rounded border mr-4 flex items-center justify-center ${task.is_done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>{task.is_done && <CheckSquare size={12} />}</button>
                  <span className={`flex-1 text-sm ${task.is_done ? 'text-gray-400 line-through' : ''}`}>{task.text}</span>
                  {task.deal_id && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded">Из сделки</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- РАЗДЕЛ КОМПАНИИ --- */}
      {activeMenu === 'companies' && (
        <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Компании</h1>
            <button onClick={() => openCompanyCard(null)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"><Plus size={16} /> Добавить компанию</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map(c => (
              <div key={c.id} onClick={() => openCompanyCard(c.id)} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div className="font-bold text-lg text-slate-800 mb-1">{c.name}</div>
                  <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition"><Building2 size={16} className="text-gray-400 group-hover:text-blue-600" /></div>
                </div>
                <div className="text-sm text-gray-500 mb-4">{c.inn ? `ИНН: ${c.inn}` : 'ИНН не указан'}</div>
                <div className="text-xs text-blue-600 font-medium">Открыть карточку →</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- МОДАЛЬНОЕ ОКНО КОМПАНИИ --- */}
      {isCompanyModalOpen && editingCompany && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-slate-800">Карточка компании</h2>
              <button onClick={() => setIsCompanyModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={20} className="text-gray-500" /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Название компании</label>
                <input type="text" value={editingCompany.name} onChange={e => setEditingCompany({ ...editingCompany, name: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 font-medium text-lg" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ИНН (DaData)</label>
                <input type="text" value={editingCompany.inn || ''} onChange={e => setEditingCompany({ ...editingCompany, inn: e.target.value })} placeholder="Введите ИНН..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Генеральный директор</label>
                <input type="text" value={editingCompany.director || ''} onChange={e => setEditingCompany({ ...editingCompany, director: e.target.value })} placeholder="ФИО" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
              </div>

              <div className="col-span-2 grid grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase mb-1"><Phone size={12} /> Телефон</label>
                  <input type="text" value={editingCompany.phone || ''} onChange={e => setEditingCompany({ ...editingCompany, phone: e.target.value })} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase mb-1"><Mail size={12} /> Email</label>
                  <input type="text" value={editingCompany.email || ''} onChange={e => setEditingCompany({ ...editingCompany, email: e.target.value })} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase mb-1"><Globe size={12} /> Сайт</label>
                  <input type="text" value={editingCompany.website || ''} onChange={e => setEditingCompany({ ...editingCompany, website: e.target.value })} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Заметки / Описание</label>
                <textarea rows="3" value={editingCompany.description || ''} onChange={e => setEditingCompany({ ...editingCompany, description: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-sm"></textarea>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsCompanyModalOpen(false)} className="px-5 py-2 text-gray-500 font-medium hover:bg-gray-200 rounded-lg transition">Отмена</button>
              <button onClick={saveCompany} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition">Сохранить</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Компоненты меню
const MenuHeader = ({ title }) => (<div className="px-6 mt-6 mb-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider">{title}</div>);
const MenuItem = ({ icon, label, badge, active, onClick }) => (
  <div onClick={onClick} className={`group flex items-center gap-3 px-6 py-2.5 cursor-pointer rounded-lg mx-2 transition-all ${active ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    {icon}<span className="text-sm font-medium flex-1">{label}</span>
    {badge ? <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">{badge}</span> : null}
  </div>
);

export default App;
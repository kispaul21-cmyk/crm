import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import {
  LayoutDashboard, CheckSquare, Building2, Users, BarChart3, Settings,
  Search, Paperclip, Send, MoreVertical, ChevronLeft, ChevronRight,
  Trash2, Plus, Smile, X, FileText, Download, Briefcase, Globe, Phone, Mail
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
  const [stages, setStages] = useState([]); // ТЕПЕРЬ ГРУЗИМ ИЗ БАЗЫ

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
  const [editingCompany, setEditingCompany] = useState(null);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [newDealData, setNewDealData] = useState({ title: '', company: '', stage: 1 });

  // Настройки этапов
  const [newStageName, setNewStageName] = useState('');
  const [newStageColor, setNewStageColor] = useState('border-gray-500');

  // --- ЗАГРУЗКА ---
  useEffect(() => {
    fetchStages(); // Грузим этапы первыми!
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
  async function fetchStages() {
    const { data } = await supabase.from('stages').select('*').order('position', { ascending: true });
    if (data && data.length > 0) {
      setStages(data);
      // Если активного этапа нет в списке (например, удалили), ставим первый
      if (!data.find(s => s.id === activeStageId)) {
        setActiveStageId(data[0].id);
      }
    }
  }

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

  // --- ЛОГИКА ЭТАПОВ (НАСТРОЙКИ) ---
  async function addStage() {
    if (!newStageName) return;
    const nextPosition = stages.length + 1;
    await supabase.from('stages').insert([{ name: newStageName, color: newStageColor, position: nextPosition }]);
    setNewStageName('');
    fetchStages();
  }

  async function deleteStage(id) {
    if (!confirm('Удалить этап? Сделки на этом этапе могут потеряться (визуально).')) return;
    await supabase.from('stages').delete().eq('id', id);
    fetchStages();
  }

  // --- ЛОГИКА СДЕЛОК ---
  const saveNewDeal = async () => {
    if (!newDealData.title || !newDealData.company) return alert("Заполните поля");
    let companyId = companies.find(c => c.name.toLowerCase() === newDealData.company.toLowerCase())?.id;
    if (!companyId) {
      const { data } = await supabase.from('companies').insert([{ name: newDealData.company }]).select();
      if (data) companyId = data[0].id;
      fetchCompanies();
    }
    const { error } = await supabase.from('deals').insert([{
      title: newDealData.title, stage: newDealData.stage, company_id: companyId, company_name: newDealData.company
    }]);
    if (!error) { fetchDeals(); setActiveStageId(Number(newDealData.stage)); setIsDealModalOpen(false); setNewDealData({ title: '', company: '', stage: stages[0]?.id }); }
  };

  async function updateStage(newStageId) {
    if (!selectedDeal) return;
    await supabase.from('deals').update({ stage: newStageId }).eq('id', selectedDeal.id);
    fetchDeals(); setSelectedDeal(null); setActiveStageId(Number(newStageId));
  }

  // --- ЛОГИКА КОМПАНИЙ ---
  const openCompanyCard = async (companyId, companyNameIfNew = '') => {
    if (companyId) {
      const company = companies.find(c => c.id === companyId);
      setEditingCompany(company || { name: 'Ошибка', inn: '' });
    } else {
      setEditingCompany({ id: null, name: companyNameIfNew, inn: '', phone: '', email: '', website: '', director: '', description: '' });
    }
    setIsCompanyModalOpen(true);
  };
  const saveCompany = async () => {
    if (!editingCompany.name) return alert('Введите название');
    const companyData = {
      name: editingCompany.name, inn: editingCompany.inn, phone: editingCompany.phone,
      email: editingCompany.email, website: editingCompany.website, director: editingCompany.director, description: editingCompany.description
    };
    if (editingCompany.id) await supabase.from('companies').update(companyData).eq('id', editingCompany.id);
    else await supabase.from('companies').insert([companyData]);
    await fetchCompanies(); setIsCompanyModalOpen(false);
  };

  // --- ЛОГИКА ФАЙЛОВ ---
  async function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    if (files.length > 5) return alert("Максимум 5 файлов!");
    const newFilesData = files.map(f => ({ name: f.name, size: (f.size / 1024 / 1024).toFixed(2) + ' MB', type: f.type, url: '#' }));
    const currentFiles = selectedDeal.files || [];
    const updatedFiles = [...currentFiles, ...newFilesData].slice(0, 5);
    await supabase.from('deals').update({ files: updatedFiles }).eq('id', selectedDeal.id);
    const updatedDeal = { ...selectedDeal, files: updatedFiles };
    setSelectedDeal(updatedDeal); setDeals(deals.map(d => d.id === updatedDeal.id ? updatedDeal : d));
  }

  // --- ЗАДАЧИ И ЧАТ ---
  async function addTask(text, dealId = null, assignee = 'Я') {
    if (!text.trim()) return;
    await supabase.from('tasks').insert([{ text, deal_id: dealId, assignee }]);
    fetchTasks();
    if (dealId) setQuickTaskText(''); else setGlobalTaskText('');
  }
  async function toggleTask(task) { await supabase.from('tasks').update({ is_done: !task.is_done }).eq('id', task.id); fetchTasks(); }
  async function sendMessage() {
    if (!newMessage.trim() || !selectedDeal) return;
    await supabase.from('messages').insert([{ deal_id: selectedDeal.id, text: newMessage, is_me: true, reply_to_id: replyTo ? replyTo.id : null }]);
    setNewMessage(''); setReplyTo(null); fetchMessages(selectedDeal.id);
  }

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
          <button onClick={() => setIsDealModalOpen(true)} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-medium shadow-lg shadow-blue-900/50 transition mb-2 flex items-center justify-center gap-2">
            <Plus size={18} /> Создать сделку
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <MenuHeader title="Основное" />
          <MenuItem icon={<LayoutDashboard size={18} />} label="CRM" active={activeMenu === 'crm'} onClick={() => setActiveMenu('crm')} />
          <MenuItem icon={<CheckSquare size={18} />} label="Задачи" badge={tasks.filter(t => !t.is_done && !t.deal_id).length} active={activeMenu === 'tasks'} onClick={() => setActiveMenu('tasks')} />

          <MenuHeader title="База" />
          <MenuItem icon={<Building2 size={18} />} label="Компании" active={activeMenu === 'companies'} onClick={() => setActiveMenu('companies')} />
          <MenuItem icon={<Users size={18} />} label="Сотрудники" onClick={() => { }} />

          <MenuHeader title="Система" />
          <MenuItem icon={<BarChart3 size={18} />} label="Аналитика" onClick={() => { }} />
          <MenuItem icon={<Settings size={18} />} label="Настройки" active={activeMenu === 'settings'} onClick={() => setActiveMenu('settings')} />
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
          {/* 2. ЭТАПЫ (ИЗ БАЗЫ) */}
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
            <div className="h-14 flex items-center px-4 border-b border-gray-100 gap-2"><Search size={18} className="text-gray-400" /><input type="text" placeholder="Поиск..." className="w-full outline-none text-sm" /></div>
            <div className="flex-1 overflow-y-auto bg-gray-50/50">
              {currentDeals.map(deal => (
                <div key={deal.id} onClick={() => setSelectedDeal(deal)} className={`group p-4 border-b cursor-pointer hover:bg-white transition-all ${selectedDeal?.id === deal.id ? 'bg-white border-l-4 border-l-blue-500 shadow-md' : 'border-l-4 border-l-transparent'}`}>
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
                    <p className="text-xs text-blue-600 cursor-pointer hover:underline flex items-center gap-1" onClick={() => openCompanyCard(selectedDeal.company_id)}><Building2 size={10} /> {selectedDeal.company_name}</p>
                  </div>
                  <MoreVertical size={20} className="text-gray-400 cursor-pointer" />
                </div>
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
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex gap-3 group ${msg.is_me ? 'flex-row-reverse' : ''}`}>
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
                      <FileText size={14} className="text-blue-500 flex-shrink-0" /><span className="truncate flex-1">{f.name}</span>
                    </div>
                  ))}
                </div>
                <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition">
                  <input type="file" multiple onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <Download size={20} className="mx-auto text-gray-400 mb-1" />
                  <div className="text-xs text-gray-500">Перетащите файлы</div>
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
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-3 mb-6">
              <input type="text" value={globalTaskText} onChange={(e) => setGlobalTaskText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask(globalTaskText)} placeholder="Новая задача..." className="flex-1 outline-none text-sm" />
              <button onClick={() => addTask(globalTaskText)} className="text-blue-600 font-medium text-sm">Добавить</button>
            </div>
            <div className="space-y-2">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition">
                  <button onClick={() => toggleTask(task)} className={`w-5 h-5 rounded border mr-4 flex items-center justify-center ${task.is_done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>{task.is_done && <CheckSquare size={12} />}</button>
                  <span className={`flex-1 text-sm ${task.is_done ? 'text-gray-400 line-through' : ''}`}>{task.text}</span>
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
          <div className="grid grid-cols-3 gap-4">
            {companies.map(c => (
              <div key={c.id} onClick={() => openCompanyCard(c.id)} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer">
                <div className="font-bold text-lg text-slate-800 mb-1">{c.name}</div>
                <div className="text-sm text-gray-500">ИНН: {c.inn || '-'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- РАЗДЕЛ НАСТРОЙКИ --- */}
      {activeMenu === 'settings' && (
        <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-6">Настройки воронки</h1>
          <div className="bg-white p-6 rounded-xl border border-gray-200 max-w-2xl">
            <div className="flex gap-4 mb-6">
              <input type="text" value={newStageName} onChange={e => setNewStageName(e.target.value)} placeholder="Название этапа" className="flex-1 p-2 border rounded" />
              <select value={newStageColor} onChange={e => setNewStageColor(e.target.value)} className="p-2 border rounded">
                <option value="border-red-500">Красный</option>
                <option value="border-orange-500">Оранжевый</option>
                <option value="border-yellow-400">Желтый</option>
                <option value="border-green-500">Зеленый</option>
                <option value="border-blue-600">Синий</option>
                <option value="border-purple-600">Фиолетовый</option>
              </select>
              <button onClick={addStage} className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700">Добавить</button>
            </div>
            <div className="space-y-2">
              {stages.map(s => (
                <div key={s.id} className={`flex justify-between items-center p-3 border rounded border-l-4 ${s.color}`}>
                  <span>{s.name}</span>
                  <button onClick={() => deleteStage(s.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- МОДАЛКА: СОЗДАНИЕ СДЕЛКИ --- */}
      {isDealModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold">Новая сделка</h2><button onClick={() => setIsDealModalOpen(false)}><X size={20} /></button></div>
            <div className="space-y-4">
              <div><label className="block text-xs font-bold text-gray-500 mb-1">Название</label><input type="text" value={newDealData.title} onChange={e => setNewDealData({ ...newDealData, title: e.target.value })} className="w-full p-2 border rounded" /></div>
              <div><label className="block text-xs font-bold text-gray-500 mb-1">Компания</label><input type="text" value={newDealData.company} onChange={e => setNewDealData({ ...newDealData, company: e.target.value })} className="w-full p-2 border rounded" /></div>
              <div><label className="block text-xs font-bold text-gray-500 mb-1">Этап</label>
                <select value={newDealData.stage} onChange={e => setNewDealData({ ...newDealData, stage: e.target.value })} className="w-full p-2 border rounded">
                  {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <button onClick={saveNewDeal} className="w-full bg-blue-600 text-white py-2 rounded font-bold mt-2">Создать</button>
            </div>
          </div>
        </div>
      )}

      {/* --- МОДАЛКА: КОМПАНИЯ --- */}
      {isCompanyModalOpen && editingCompany && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold">Карточка компании</h2><button onClick={() => setIsCompanyModalOpen(false)}><X size={20} /></button></div>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="col-span-2"><input type="text" value={editingCompany.name} onChange={e => setEditingCompany({ ...editingCompany, name: e.target.value })} className="w-full p-3 bg-gray-50 border rounded text-lg font-medium" placeholder="Название" /></div>
              <div><input type="text" value={editingCompany.inn || ''} onChange={e => setEditingCompany({ ...editingCompany, inn: e.target.value })} className="w-full p-3 bg-gray-50 border rounded" placeholder="ИНН" /></div>
              <div><input type="text" value={editingCompany.director || ''} onChange={e => setEditingCompany({ ...editingCompany, director: e.target.value })} className="w-full p-3 bg-gray-50 border rounded" placeholder="Директор" /></div>
            </div>
            <div className="flex justify-end gap-3"><button onClick={() => setIsCompanyModalOpen(false)} className="px-4 py-2 text-gray-500">Отмена</button><button onClick={saveCompany} className="px-6 py-2 bg-blue-600 text-white rounded font-bold">Сохранить</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Компоненты меню
const MenuHeader = ({ title }) => (<div className="px-6 mt-6 mb-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider">{title}</div>);
const MenuItem = ({ icon, label, badge, active, onClick }) => (
  <div onClick={onClick} className={`group flex items-center gap-3 px-6 py-2.5 cursor-pointer rounded-lg mx-2 transition-all ${active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    {icon}<span className="text-sm font-medium flex-1">{label}</span>
    {badge ? <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">{badge}</span> : null}
  </div>
);

export default App;
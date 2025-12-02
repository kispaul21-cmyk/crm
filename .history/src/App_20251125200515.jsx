import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Sidebar from './components/Sidebar';
import CrmView from './components/CrmView';
import { TasksView, CompaniesView,  } from './components/OtherViews';
import { DealModal, CompanyModal } from './components/Modals';

const App = () => {
  // --- ГЛОБАЛЬНЫЕ ---
  const [activeMenu, setActiveMenu] = useState('crm');

  // Данные
  const [deals, setDeals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [stages, setStages] = useState([]);

  // CRM
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [activeStageId, setActiveStageId] = useState(1);
  const [isStagesCollapsed, setIsStagesCollapsed] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);

  // Доп
  const [quickTaskText, setQuickTaskText] = useState('');
  const [globalTaskText, setGlobalTaskText] = useState('');
  const [taskFilter, setTaskFilter] = useState('all');

  // Модалки
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [newDealData, setNewDealData] = useState({ title: '', company: '', stage: 1 });

  // Настройки
  const [newStageName, setNewStageName] = useState('');
  const [newStageColor, setNewStageColor] = useState('border-gray-500');

  // --- ЗАГРУЗКА ---
  useEffect(() => { fetchStages(); fetchDeals(); fetchTasks(); fetchCompanies(); }, []);

  // --- API ---
  const fetchStages = async () => {
    const { data } = await supabase.from('stages').select('*').order('position');
    if (data && data.length) { setStages(data); if (!data.find(s => s.id === activeStageId)) setActiveStageId(data[0].id); }
  };
  const fetchDeals = async () => { const { data } = await supabase.from('deals').select('*').order('created_at', { ascending: false }); setDeals(data || []); };
  const fetchTasks = async () => { const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false }); setTasks(data || []); };
  const fetchCompanies = async () => { const { data } = await supabase.from('companies').select('*').order('name'); setCompanies(data || []); };
  const fetchMessages = async (dealId) => { const { data } = await supabase.from('messages').select('*').eq('deal_id', dealId).order('created_at'); setMessages(data || []); };

  // --- ДЕЙСТВИЯ ---
  const saveNewDeal = async () => {
    if (!newDealData.title) return;
    let companyId = companies.find(c => c.name.toLowerCase() === newDealData.company.toLowerCase())?.id;
    if (!companyId) { const { data } = await supabase.from('companies').insert([{ name: newDealData.company }]).select(); if (data) companyId = data[0].id; fetchCompanies(); }
    const { error } = await supabase.from('deals').insert([{ title: newDealData.title, stage: newDealData.stage, company_id: companyId, company_name: newDealData.company }]);
    if (!error) { fetchDeals(); setActiveStageId(Number(newDealData.stage)); setIsDealModalOpen(false); setNewDealData({ title: '', company: '', stage: stages[0]?.id }); }
  };

  const openCompanyCard = async (id, name = '') => {
    if (id) setEditingCompany(companies.find(c => c.id === id)); else setEditingCompany({ id: null, name, inn: '', director: '', phone: '', email: '', description: '' });
    setIsCompanyModalOpen(true);
  };

  const saveCompany = async () => {
    if (!editingCompany.name) return;
    const d = { name: editingCompany.name, inn: editingCompany.inn, director: editingCompany.director, phone: editingCompany.phone, email: editingCompany.email, website: editingCompany.website, description: editingCompany.description };
    if (editingCompany.id) await supabase.from('companies').update(d).eq('id', editingCompany.id); else await supabase.from('companies').insert([d]);
    fetchCompanies(); setIsCompanyModalOpen(false);
  };

  const addTask = async (text, dealId = null, assignee = 'Я') => { if (!text) return; await supabase.from('tasks').insert([{ text, deal_id: dealId, assignee }]); fetchTasks(); if (dealId) setQuickTaskText(''); else setGlobalTaskText(''); };
  const toggleTask = async (task) => { await supabase.from('tasks').update({ is_done: !task.is_done }).eq('id', task.id); fetchTasks(); };
  const sendMessage = async () => { if (!newMessage || !selectedDeal) return; await supabase.from('messages').insert([{ deal_id: selectedDeal.id, text: newMessage, is_me: true, reply_to_id: replyTo?.id }]); setNewMessage(''); setReplyTo(null); fetchMessages(selectedDeal.id); };

  const updateStage = async (sid) => { await supabase.from('deals').update({ stage: sid }).eq('id', selectedDeal.id); fetchDeals(); setSelectedDeal(null); setActiveStageId(Number(sid)); };
  const handleFileUpload = async (e) => {
    // Упрощенная логика без Storage
    alert("Загрузка файлов требует настройки Supabase Storage. Пока сохраняем только название.");
  };

  // Настройки этапов
  const addStage = async () => { if (!newStageName) return; await supabase.from('stages').insert([{ name: newStageName, color: newStageColor, position: stages.length + 1 }]); setNewStageName(''); fetchStages(); };
  const deleteStage = async (id) => { if (confirm('Удалить?')) await supabase.from('stages').delete().eq('id', id); fetchStages(); };

  return (
    <div className="flex h-screen w-full bg-gray-50 text-slate-800 font-sans overflow-hidden">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} tasksCount={tasks.filter(t => !t.is_done).length} onOpenDealModal={() => setIsDealModalOpen(true)} />

      {activeMenu === 'crm' && <CrmView
        stages={stages} deals={deals} activeStageId={activeStageId} setActiveStageId={setActiveStageId}
        isStagesCollapsed={isStagesCollapsed} setIsStagesCollapsed={setIsStagesCollapsed}
        selectedDeal={selectedDeal} setSelectedDeal={setSelectedDeal}
        messages={messages} currentDeals={deals.filter(d => d.stage === activeStageId)} dealTasks={tasks.filter(t => selectedDeal && t.deal_id === selectedDeal.id && !t.is_done)}
        addTask={addTask} toggleTask={toggleTask} quickTaskText={quickTaskText} setQuickTaskText={setQuickTaskText}
        newMessage={newMessage} setNewMessage={setNewMessage} sendMessage={sendMessage} replyTo={replyTo} setReplyTo={setReplyTo}
        openCompanyCard={openCompanyCard} updateStage={updateStage} handleFileUpload={handleFileUpload}
      />}

      {activeMenu === 'tasks' && <TasksView tasks={tasks} filter={taskFilter} setFilter={setTaskFilter} newTaskText={globalTaskText} setNewTaskText={setGlobalTaskText} addTask={addTask} toggleTask={toggleTask} />}
      {activeMenu === 'companies' && <CompaniesView companies={companies} onOpenCard={openCompanyCard} />}
      {activeMenu === 'settings' && <SettingsView stages={stages} newStageName={newStageName} setNewStageName={setNewStageName} newStageColor={newStageColor} setNewStageColor={setNewStageColor} addStage={addStage} deleteStage={deleteStage} />}

      <DealModal isOpen={isDealModalOpen} onClose={() => setIsDealModalOpen(false)} data={newDealData} onChange={setNewDealData} onSave={saveNewDeal} stages={stages} />
      <CompanyModal isOpen={isCompanyModalOpen} onClose={() => setIsCompanyModalOpen(false)} company={editingCompany} onChange={setEditingCompany} onSave={saveCompany} />
    </div>
  );
};

export default App;
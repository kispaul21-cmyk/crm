import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase'; 
import Sidebar from './components/Sidebar';
import CrmView from './components/CrmView';
import SettingsView from './components/SettingsView'; 
import TasksView from './components/TasksView';
import CompaniesView from './components/CompaniesView';
import AnalyticsView from './components/AnalyticsView';
import TeamView from './components/TeamView';
import { DealModal, CompanyModal } from './components/Modals';

const App = () => {
  const [activeMenu, setActiveMenu] = useState('crm');
  const [isLoading, setIsLoading] = useState(false);

  // --- ДАННЫЕ ---
  const [deals, setDeals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [stages, setStages] = useState([]); 
  
  // --- СОСТОЯНИЯ ---
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [activeStageId, setActiveStageId] = useState(1);
  const [isStagesCollapsed, setIsStagesCollapsed] = useState(false);
  
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [quickTaskText, setQuickTaskText] = useState('');
  const [globalTaskText, setGlobalTaskText] = useState('');
  const [taskFilter, setTaskFilter] = useState('all');

  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [newDealData, setNewDealData] = useState({ title: '', company: '', stage: 1 });

  // --- ЗАГРУЗКА ---
  useEffect(() => {
    fetchStages(); fetchDeals(); fetchTasks(); fetchCompanies();
  }, []);

  // --- API ФУНКЦИИ (МОЗГ) ---
  const fetchStages = async () => {
    const { data } = await supabase.from('stages').select('*').order('position', { ascending: true });
    if (data && data.length > 0) { setStages(data); if (!data.find(s => s.id === activeStageId)) setActiveStageId(data[0].id); }
  };
  const fetchDeals = async () => { const { data } = await supabase.from('deals').select('*').order('created_at', { ascending: false }); setDeals(data || []); };
  const fetchTasks = async () => { const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false }); setTasks(data || []); };
  const fetchCompanies = async () => { const { data } = await supabase.from('companies').select('*').order('name'); setCompanies(data || []); };
  const fetchMessages = async (dealId) => { const { data } = await supabase.from('messages').select('*').eq('deal_id', dealId).order('created_at', { ascending: true }); setMessages(data || []); };

  // --- ЛОГИКА СООБЩЕНИЙ И ЗАДАЧ ---
  async function sendMessage() {
    if (!newMessage.trim() || !selectedDeal) return;

    if (newMessage.startsWith('#')) {
        const lines = newMessage.split('\n').filter(line => line.trim() !== '');
        const title = lines[0].replace('#', '').trim();
        const subtasks = lines.slice(1).map(line => ({ text: line, is_done: false }));

        await supabase.from('tasks').insert([{ 
            text: title, deal_id: selectedDeal.id, assignee: 'Я', subtasks: subtasks 
        }]);
        await supabase.from('messages').insert([{ 
            deal_id: selectedDeal.id, text: `⚡ Поставлена задача: ${title}` + (subtasks.length > 0 ? ` (+${subtasks.length} подзадач)` : ''), is_me: true 
        }]);
        setNewMessage(''); fetchTasks(); fetchMessages(selectedDeal.id);
    } else {
        await supabase.from('messages').insert([{ 
            deal_id: selectedDeal.id, text: newMessage, is_me: true, reply_to_id: replyTo?.id 
        }]);
        setNewMessage(''); setReplyTo(null); fetchMessages(selectedDeal.id);
    }
  }

  const addTask = async (text, dealId = null, assignee = 'Я') => { 
      if (!text) return; 
      await supabase.from('tasks').insert([{ text, deal_id, assignee }]); 
      if (dealId) { await supabase.from('messages').insert([{ deal_id, text: `⚡ Быстрая задача: ${text}`, is_me: true }]); fetchMessages(dealId); }
      fetchTasks(); 
      if (dealId) setQuickTaskText(''); else setGlobalTaskText(''); 
  };
  
  const toggleTask = async (task) => { await supabase.from('tasks').update({ is_done: !task.is_done }).eq('id', task.id); fetchTasks(); };
  const toggleSubtask = async (task, subtaskIndex) => {
      const newSubtasks = [...(task.subtasks || [])];
      newSubtasks[subtaskIndex].is_done = !newSubtasks[subtaskIndex].is_done;
      await supabase.from('tasks').update({ subtasks: newSubtasks }).eq('id', task.id);
      fetchTasks();
  };
  const deleteTask = async (id) => { if(confirm('Удалить?')) await supabase.from('tasks').delete().eq('id', id); fetchTasks(); };

  // --- ЛОГИКА СДЕЛОК И КОМПАНИЙ ---
  const saveNewDeal = async () => {
    if (!newDealData.title) return;
    let companyId = companies.find(c => c.name.toLowerCase() === newDealData.company.toLowerCase())?.id;
    if (!companyId) { const { data } = await supabase.from('companies').insert([{ name: newDealData.company }]).select(); if (data) companyId = data[0].id; fetchCompanies(); }
    const { error } = await supabase.from('deals').insert([{ title: newDealData.title, stage: newDealData.stage, company_id: companyId, company_name: newDealData.company }]);
    if (!error) { fetchDeals(); setActiveStageId(Number(newDealData.stage)); setIsDealModalOpen(false); setNewDealData({ title: '', company: '', stage: stages[0]?.id || 1 }); }
  };

  const updateStage = async (sid) => { await supabase.from('deals').update({ stage: sid }).eq('id', selectedDeal.id); fetchDeals(); setSelectedDeal(null); setActiveStageId(Number(sid)); };
  const openCompanyCard = (id, name='') => { if (id) setEditingCompany(companies.find(c => c.id === id)); else setEditingCompany({ id: null, name, inn: '', director: '', phone: '', email: '', description: '' }); setIsCompanyModalOpen(true); };
  const saveCompany = async () => { if (!editingCompany.name) return; const d = { ...editingCompany }; delete d.id; if (editingCompany.id) await supabase.from('companies').update(d).eq('id', editingCompany.id); else await supabase.from('companies').insert([d]); fetchCompanies(); setIsCompanyModalOpen(false); };
  const handleFileUpload = () => alert("Нужен Storage");

  // Фильтры для отображения
  const currentDeals = deals.filter(deal => deal.stage === activeStageId);
  const dealTasks = tasks.filter(t => selectedDeal && t.deal_id === selectedDeal.id);
  const chatStream = [...messages.map(m => ({ ...m, type: 'message' }))].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  // --- ОТРИСОВКА (Связываем всё вместе) ---
  return (
    <div className="flex h-screen w-full bg-gray-50 text-slate-800 font-sans overflow-hidden">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} tasksCount={tasks.filter(t => !t.is_done && !t.deal_id).length} onOpenDealModal={() => setIsDealModalOpen(true)} />
      
      {activeMenu === 'crm' && <CrmView 
        stages={stages} deals={deals} activeStageId={activeStageId} setActiveStageId={setActiveStageId}
        isStagesCollapsed={isStagesCollapsed} setIsStagesCollapsed={setIsStagesCollapsed}
        selectedDeal={selectedDeal} setSelectedDeal={setSelectedDeal}
        
        // Передаем данные в CRM
        chatStream={chatStream} dealTasks={dealTasks} currentDeals={currentDeals}
        
        // Передаем функции в CRM
        addTask={addTask} toggleTask={toggleTask} toggleSubtask={toggleSubtask} deleteTask={deleteTask}
        quickTaskText={quickTaskText} setQuickTaskText={setQuickTaskText}
        newMessage={newMessage} setNewMessage={setNewMessage} sendMessage={sendMessage} replyTo={replyTo} setReplyTo={setReplyTo}
        openCompanyCard={(id) => openCompanyCard(id)} updateStage={updateStage} handleFileUpload={handleFileUpload}
      />}

      {activeMenu === 'tasks' && <TasksView tasks={tasks} filter={taskFilter} setFilter={setTaskFilter} newTaskText={globalTaskText} setNewTaskText={setGlobalTaskText} addTask={addTask} toggleTask={toggleTask} toggleSubtask={toggleSubtask} deleteTask={deleteTask} />}
      {activeMenu === 'companies' && <CompaniesView companies={companies} onOpenCard={(id) => openCompanyCard(id)} />}
      {activeMenu === 'settings' && <SettingsView stages={stages} onStagesChange={fetchStages} />}
      {activeMenu === 'analytics' && <AnalyticsView />}
      {activeMenu === 'team' && <TeamView />}

      <DealModal isOpen={isDealModalOpen} onClose={() => setIsDealModalOpen(false)} data={newDealData} onChange={setNewDealData} onSave={saveNewDeal} stages={stages} />
      <CompanyModal isOpen={isCompanyModalOpen} onClose={() => setIsCompanyModalOpen(false)} company={editingCompany} onChange={setEditingCompany} onSave={saveCompany} />
    </div>
  );
};

export default App;
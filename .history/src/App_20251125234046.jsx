import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase'; 
import Sidebar from './components/Sidebar';
import CrmView from './components/CrmView';
// Важно: SettingsView теперь импортируется из своего отдельного файла
import SettingsView from './components/SettingsView'; 
import { TasksView, CompaniesView } from './components/OtherViews';
import { DealModal, CompanyModal } from './components/Modals';

const App = () => {
  // --- ГЛОБАЛЬНЫЕ СОСТОЯНИЯ ---
  const [activeMenu, setActiveMenu] = useState('crm');
  const [isLoading, setIsLoading] = useState(false);

  // Данные
  const [deals, setDeals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [stages, setStages] = useState([]); 
  
  // CRM Состояния
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [activeStageId, setActiveStageId] = useState(1);
  const [isStagesCollapsed, setIsStagesCollapsed] = useState(false);
  
  // Чат
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);

  // Задачи
  const [quickTaskText, setQuickTaskText] = useState('');
  const [globalTaskText, setGlobalTaskText] = useState('');
  const [taskFilter, setTaskFilter] = useState('all');

  // Модалки
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [newDealData, setNewDealData] = useState({ title: '', company: '', stage: 1 });

  // --- ЗАГРУЗКА ---
  useEffect(() => {
    fetchStages();
    fetchDeals();
    fetchTasks();
    fetchCompanies();
  }, []);

  // --- API ФУНКЦИИ ---
  const fetchStages = async () => {
    // Загружаем этапы и сортируем по позиции
    const { data } = await supabase.from('stages').select('*').order('position', { ascending: true });
    if (data && data.length > 0) {
      setStages(data);
      // Если текущий выбранный этап удален, переключаемся на первый доступный
      if (!data.find(s => s.id === activeStageId)) {
        setActiveStageId(data[0].id);
      }
    }
  };

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

  // --- ЛОГИКА СДЕЛОК ---
  const saveNewDeal = async () => {
    if (!newDealData.title || !newDealData.company) return alert("Заполните название и компанию");

    let companyId = companies.find(c => c.name.toLowerCase() === newDealData.company.toLowerCase())?.id;
    if (!companyId) {
      const { data } = await supabase.from('companies').insert([{ name: newDealData.company }]).select();
      if (data) companyId = data[0].id;
      fetchCompanies();
    }

    const { error } = await supabase.from('deals').insert([{ 
      title: newDealData.title, 
      stage: newDealData.stage, 
      company_id: companyId, 
      company_name: newDealData.company 
    }]);

    if (!error) { 
      fetchDeals(); 
      setActiveStageId(Number(newDealData.stage)); 
      setIsDealModalOpen(false); 
      setNewDealData({ title: '', company: '', stage: stages[0]?.id || 1 }); 
    }
  };

  async function updateStage(newStageId) {
    if (!selectedDeal) return;
    await supabase.from('deals').update({ stage: newStageId }).eq('id', selectedDeal.id);
    fetchDeals();
    setSelectedDeal(null);
    setActiveStageId(Number(newStageId));
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
    await fetchCompanies();
    setIsCompanyModalOpen(false);
  };

  // --- ЛОГИКА ФАЙЛОВ ---
  async function handleFileUpload(e) {
    alert("Для загрузки файлов нужно настроить Supabase Storage. Это следующий шаг развития системы.");
  }

  // --- ЗАДАЧИ И ЧАТ ---
  async function addTask(text, dealId = null, assignee = 'Я') {
    if (!text.trim()) return;
    await supabase.from('tasks').insert([{ text, deal_id: dealId, assignee }]);
    fetchTasks();
    if (dealId) setQuickTaskText(''); else setGlobalTaskText('');
  }
  async function toggleTask(task) {
    await supabase.from('tasks').update({ is_done: !task.is_done }).eq('id', task.id);
    fetchTasks();
  }
  async function sendMessage() {
    if (!newMessage.trim() || !selectedDeal) return;
    await supabase.from('messages').insert([{ deal_id: selectedDeal.id, text: newMessage, is_me: true, reply_to_id: replyTo ? replyTo.id : null }]);
    setNewMessage(''); setReplyTo(null); fetchMessages(selectedDeal.id);
  }

  // Фильтры
  const currentDeals = deals.filter(deal => deal.stage === activeStageId);
  const dealTasks = tasks.filter(t => selectedDeal && t.deal_id === selectedDeal.id && !t.is_done);

  return (
    <div className="flex h-screen w-full bg-gray-50 text-slate-800 font-sans overflow-hidden">
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
        tasksCount={tasks.filter(t => !t.is_done && !t.deal_id).length} 
        onOpenDealModal={() => setIsDealModalOpen(true)} 
      />
      
      {activeMenu === 'crm' && <CrmView 
        stages={stages} deals={deals} activeStageId={activeStageId} setActiveStageId={setActiveStageId}
        isStagesCollapsed={isStagesCollapsed} setIsStagesCollapsed={setIsStagesCollapsed}
        selectedDeal={selectedDeal} setSelectedDeal={setSelectedDeal}
        messages={messages} currentDeals={currentDeals} dealTasks={dealTasks}
        addTask={addTask} toggleTask={toggleTask} quickTaskText={quickTaskText} setQuickTaskText={setQuickTaskText}
        newMessage={newMessage} setNewMessage={setNewMessage} sendMessage={sendMessage} replyTo={replyTo} setReplyTo={setReplyTo}
        openCompanyCard={(id) => openCompanyCard(id)} updateStage={updateStage} handleFileUpload={handleFileUpload}
      />}

      {activeMenu === 'tasks' && <TasksView tasks={tasks} filter={taskFilter} setFilter={setTaskFilter} newTaskText={globalTaskText} setNewTaskText={setGlobalTaskText} addTask={addTask} toggleTask={toggleTask} />}
      
      {activeMenu === 'companies' && <CompaniesView companies={companies} onOpenCard={(id) => openCompanyCard(id)} />}
      
      {/* Вот здесь теперь правильно передаются параметры */}
      {activeMenu === 'settings' && <SettingsView stages={stages} onStagesChange={fetchStages} />}

      <DealModal isOpen={isDealModalOpen} onClose={() => setIsDealModalOpen(false)} data={newDealData} onChange={setNewDealData} onSave={saveNewDeal} stages={stages} />
      <CompanyModal isOpen={isCompanyModalOpen} onClose={() => setIsCompanyModalOpen(false)} company={editingCompany} onChange={setEditingCompany} onSave={saveCompany} />
    </div>
  );
};

export default App;
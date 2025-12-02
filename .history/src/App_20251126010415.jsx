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

  // Чат и Задачи
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);
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
    const { data } = await supabase.from('stages').select('*').order('position', { ascending: true });
    if (data && data.length > 0) {
      setStages(data);
      if (!data.find(s => s.id === activeStageId)) setActiveStageId(data[0].id);
    }
  };

  async function fetchDeals() {
    const { data } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
    setDeals(data || []);
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

  // --- ЛОГИКА ОТПРАВКИ (УМНЫЙ ЧАТ) ---
  async function sendMessage() {
    if (!newMessage.trim() || !selectedDeal) return;

    // ПРОВЕРКА НА ЗАДАЧУ (#)
    if (newMessage.startsWith('#')) {
      // Разбиваем текст на строки
      const lines = newMessage.split('\n').filter(line => line.trim() !== '');
      // Первая строка (без #) - это заголовок
      const title = lines[0].replace('#', '').trim();
      // Остальные строки - это подзадачи
      const subtasks = lines.slice(1).map(line => ({ text: line, is_done: false }));

      // Сохраняем как ЗАДАЧУ, а не сообщение
      const { error } = await supabase.from('tasks').insert([{
        text: title,
        deal_id: selectedDeal.id,
        assignee: 'Я',
        subtasks: subtasks
      }]);

      if (!error) {
        setNewMessage('');
        fetchTasks(); // Обновляем список задач, она появится в чате
      }
    } else {
      // ОБЫЧНОЕ СООБЩЕНИЕ
      await supabase.from('messages').insert([{
        deal_id: selectedDeal.id,
        text: newMessage,
        is_me: true,
        reply_to_id: replyTo?.id
      }]);
      setNewMessage('');
      setReplyTo(null);
      fetchMessages(selectedDeal.id);
    }
  }

  // --- УПРАВЛЕНИЕ ЗАДАЧАМИ ---
  const addTask = async (text, dealId = null, assignee = 'Я') => {
    if (!text) return;
    await supabase.from('tasks').insert([{ text, deal_id, assignee }]);
    fetchTasks();
    if (dealId) setQuickTaskText(''); else setGlobalTaskText('');
  };

  const toggleTask = async (task) => {
    await supabase.from('tasks').update({ is_done: !task.is_done }).eq('id', task.id);
    fetchTasks();
  };

  // Новая функция: обновление подзадачи
  const toggleSubtask = async (task, subtaskIndex) => {
    const newSubtasks = [...(task.subtasks || [])];
    newSubtasks[subtaskIndex].is_done = !newSubtasks[subtaskIndex].is_done;

    // Если все подзадачи выполнены -> выполняем главную? (Пока нет, решай сам)
    await supabase.from('tasks').update({ subtasks: newSubtasks }).eq('id', task.id);
    fetchTasks();
  };

  const deleteTask = async (id) => { if (confirm('Удалить задачу?')) await supabase.from('tasks').delete().eq('id', id); fetchTasks(); };

  // --- ЛОГИКА СДЕЛОК ---
  const saveNewDeal = async () => {
    if (!newDealData.title) return;
    let companyId = companies.find(c => c.name.toLowerCase() === newDealData.company.toLowerCase())?.id;
    if (!companyId) { const { data } = await supabase.from('companies').insert([{ name: newDealData.company }]).select(); if (data) companyId = data[0].id; fetchCompanies(); }
    const { error } = await supabase.from('deals').insert([{ title: newDealData.title, stage: newDealData.stage, company_id: companyId, company_name: newDealData.company }]);
    if (!error) { fetchDeals(); setActiveStageId(Number(newDealData.stage)); setIsDealModalOpen(false); setNewDealData({ title: '', company: '', stage: stages[0]?.id || 1 }); }
  };

  const updateStage = async (newStageId) => {
    if (!selectedDeal) return;
    await supabase.from('deals').update({ stage: newStageId }).eq('id', selectedDeal.id);
    fetchDeals(); setSelectedDeal(null); setActiveStageId(Number(newStageId));
  };

  const openCompanyCard = (id, name = '') => {
    if (id) setEditingCompany(companies.find(c => c.id === id));
    else setEditingCompany({ id: null, name, inn: '', director: '', phone: '', email: '', description: '' });
    setIsCompanyModalOpen(true);
  };

  const saveCompany = async () => {
    if (!editingCompany.name) return;
    const d = { name: editingCompany.name, inn: editingCompany.inn, director: editingCompany.director, phone: editingCompany.phone, email: editingCompany.email, website: editingCompany.website, description: editingCompany.description };
    if (editingCompany.id) await supabase.from('companies').update(d).eq('id', editingCompany.id);
    else await supabase.from('companies').insert([d]);
    fetchCompanies(); setIsCompanyModalOpen(false);
  };

  const handleFileUpload = () => alert("Требуется настройка Storage");

  // --- СБОРКА ЕДИНОЙ ЛЕНТЫ ЧАТА ---
  const currentDeals = deals.filter(deal => deal.stage === activeStageId);
  const dealTasks = tasks.filter(t => selectedDeal && t.deal_id === selectedDeal.id); // Берем ВСЕ задачи (и выполненные)

  // Создаем единый поток для чата (Сообщения + Задачи)
  const chatStream = [
    ...messages.map(m => ({ ...m, type: 'message' })),
    ...dealTasks.map(t => ({ ...t, type: 'task' }))
  ].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  return (
    <div className="flex h-screen w-full bg-gray-50 text-slate-800 font-sans overflow-hidden">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} tasksCount={tasks.filter(t => !t.is_done && !t.deal_id).length} onOpenDealModal={() => setIsDealModalOpen(true)} />

      {activeMenu === 'crm' && <CrmView
        stages={stages} deals={deals} activeStageId={activeStageId} setActiveStageId={setActiveStageId}
        isStagesCollapsed={isStagesCollapsed} setIsStagesCollapsed={setIsStagesCollapsed}
        selectedDeal={selectedDeal} setSelectedDeal={setSelectedDeal}

        // 👇 ВОТ ЭТОЙ СТРОЧКИ НЕ ХВАТАЛО
        currentDeals={currentDeals}

        chatStream={chatStream} dealTasks={dealTasks}
        addTask={addTask} toggleTask={toggleTask} toggleSubtask={toggleSubtask} deleteTask={deleteTask}
        quickTaskText={quickTaskText} setQuickTaskText={setQuickTaskText}
        newMessage={newMessage} setNewMessage={setNewMessage} sendMessage={sendMessage} replyTo={replyTo} setReplyTo={setReplyTo}
        openCompanyCard={(id) => openCompanyCard(id)} updateStage={updateStage} handleFileUpload={handleFileUpload}
      />}

      {activeMenu === 'tasks' && <TasksView tasks={tasks} filter={taskFilter} setFilter={setTaskFilter} newTaskText={globalTaskText} setNewTaskText={setGlobalTaskText} addTask={addTask} toggleTask={toggleTask} toggleSubtask={toggleSubtask} deleteTask={deleteTask} />}
      {activeMenu === 'companies' && <CompaniesView companies={companies} onOpenCard={(id) => openCompanyCard(id)} />}
      {activeMenu === 'analytics' && <AnalyticsView />}
      {activeMenu === 'team' && <TeamView />}
      {activeMenu === 'settings' && <SettingsView stages={stages} onStagesChange={fetchStages} />}

      <DealModal isOpen={isDealModalOpen} onClose={() => setIsDealModalOpen(false)} data={newDealData} onChange={setNewDealData} onSave={saveNewDeal} stages={stages} />
      <CompanyModal isOpen={isCompanyModalOpen} onClose={() => setIsCompanyModalOpen(false)} company={editingCompany} onChange={setEditingCompany} onSave={saveCompany} />
    </div>
  );
};

export default App;
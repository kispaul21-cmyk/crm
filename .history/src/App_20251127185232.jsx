import React, { useState, useEffect } from 'react';
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
  // ============================================================================ 
  // STATE: UI
  // ============================================================================ 
  const [activeMenu, setActiveMenu] = useState('crm');
  const [isLoading, setIsLoading] = useState(false);

  // ============================================================================ 
  // STATE: Data from Supabase
  // ============================================================================ 
  const [deals, setDeals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [stages, setStages] = useState([]);

  // ============================================================================ 
  // STATE: CRM View
  // ============================================================================ 
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [activeStageId, setActiveStageId] = useState(1);
  const [isStagesCollapsed, setIsStagesCollapsed] = useState(false);

  // ============================================================================ 
  // STATE: Chat & Tasks
  // ============================================================================ 
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [quickTaskText, setQuickTaskText] = useState('');
  const [globalTaskText, setGlobalTaskText] = useState('');
  const [taskFilter, setTaskFilter] = useState('all');

  // ============================================================================ 
  // STATE: Modals
  // ============================================================================ 
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [newDealData, setNewDealData] = useState({ title: '', company: '', stage: 1 });

  // ============================================================================ 
  // EFFECTS
  // ============================================================================ 

  // Initial data fetch
  useEffect(() => {
    fetchStages();
    fetchDeals();
    fetchTasks();
    fetchCompanies();
  }, []);

  // Fetch messages when deal is selected
  useEffect(() => {
    if (selectedDeal) {
      fetchMessages(selectedDeal.id);
    }
  }, [selectedDeal]);

  // Listen for deal edit event from CrmInfo
  useEffect(() => {
    const handleDealEdit = (event) => {
      const deal = event.detail;
      setNewDealData({
        title: deal.title,
        company: deal.company_name || '',
        stage: deal.stage,
        selectedCompanyId: deal.company_id,
        dealId: deal.id // Для определения что это редактирование
      });
      setIsDealModalOpen(true);
    };

    window.addEventListener('openDealEdit', handleDealEdit);
    return () => window.removeEventListener('openDealEdit', handleDealEdit);
  }, []);

  // ============================================================================ 
  // DATA FETCHING
  // ============================================================================ 

  const fetchStages = async () => {
    const { data } = await supabase
      .from('stages')
      .select('*')
      .order('position', { ascending: true });

    if (data && data.length > 0) {
      setStages(data);
      if (!data.find(s => s.id === activeStageId)) {
        setActiveStageId(data[0].id);
      }
    }
  };

  const fetchDeals = async () => {
    const { data } = await supabase
      .from('deals')
      .select(`
        *,
        companies (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });
    
    // Преобразуем данные: добавляем company_name
    const dealsWithCompanyName = (data || []).map(deal => ({
      ...deal,
      company_name: deal.companies?.name || null
    }));
    
    setDeals(dealsWithCompanyName);
  };

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    setTasks(data || []);
  };

  const fetchCompanies = async () => {
    const { data } = await supabase
      .from('companies')
      .select('*')
      .order('name');
    setCompanies(data || []);
  };

  const fetchMessages = async (dealId) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  // ============================================================================ 
  // MESSAGE & TASK HANDLERS
  // ============================================================================ 

  /**
   * Smart message sending: creates task if message starts with #
   */
  async function sendMessage() {
    if (!newMessage.trim() || !selectedDeal) return;

    if (newMessage.startsWith('#')) {
      // Parse task from message
      const lines = newMessage.split('\n').filter(line => line.trim() !== '');
      const title = lines[0].replace('#', '').trim();
      const subtasks = lines.slice(1).map(line => ({ text: line, is_done: false }));

      // Create task
      await supabase.from('tasks').insert([
        {
          text: title,
          deal_id: selectedDeal.id,
          assignee: 'Я',
          subtasks: subtasks
        }
      ]);

      // Add notification to chat - показываем всю задачу целиком
      const fullTaskText = subtasks.length > 0 
        ? `${title}\n${subtasks.map(st => st.text).join('\n')}`
        : title;
      
      await supabase.from('messages').insert([
        {
          deal_id: selectedDeal.id,
          text: `⚡ Задача: ${fullTaskText}`,
          is_me: true,
          reply_to_id: null
        }
      ]);

      setNewMessage('');
      fetchTasks();
      fetchMessages(selectedDeal.id);
    } else {
      // Regular message
      await supabase.from('messages').insert([
        {
          deal_id: selectedDeal.id,
          text: newMessage,
          is_me: true,
          reply_to_id: replyTo?.id
        }
      ]);

      setNewMessage('');
      setReplyTo(null);
      fetchMessages(selectedDeal.id);
    }
  }

  /**
   * Edit message
   */
  const editMessage = async (messageId, newText) => {
    if (!newText.trim() || !selectedDeal) return;

    await supabase
      .from('messages')
      .update({ 
        text: newText,
        edited_at: new Date().toISOString()
      })
      .eq('id', messageId);

    fetchMessages(selectedDeal.id);
  };

  /**
   * Delete message
   */
  const deleteMessage = async (messageId) => {
    if (!confirm('Удалить сообщение?')) return;
    
    await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    fetchMessages(selectedDeal.id);
  };

  /**
   * Forward message to another deal
   */
  const forwardMessage = async (messageText, toDealId) => {
    await supabase.from('messages').insert([
      {
        deal_id: toDealId,
        text: `📤 Переслано: ${messageText}`,
        is_me: true
      }
    ]);
  };

  /**
   * Add task (from quick input or global tasks view)
   */
  const addTask = async (text, dealId = null, assignee = 'Я') => {
    if (!text) return;

    await supabase.from('tasks').insert([
      {
        text,
        deal_id: dealId,
        assignee
      }
    ]);

    // Add notification to chat if task is deal-specific
    if (dealId) {
      await supabase.from('messages').insert([
        {
          deal_id: dealId,
          text: `⚡ Задача: ${text}`,
          is_me: true
        }
      ]);
      fetchMessages(dealId);
    }

    fetchTasks();
    if (dealId) setQuickTaskText('');
    else setGlobalTaskText('');
  };

  const toggleTask = async (task) => {
    await supabase
      .from('tasks')
      .update({ is_done: !task.is_done })
      .eq('id', task.id);
    fetchTasks();
  };

  const editTask = async (taskId, newText) => {
    if (!newText.trim()) return;
    
    await supabase
      .from('tasks')
      .update({ text: newText })
      .eq('id', taskId);
    fetchTasks();
  };

  const toggleSubtask = async (task, subtaskIndex) => {
    const newSubtasks = [...(task.subtasks || [])];
    newSubtasks[subtaskIndex].is_done = !newSubtasks[subtaskIndex].is_done;

    await supabase
      .from('tasks')
      .update({ subtasks: newSubtasks })
      .eq('id', task.id);
    fetchTasks();
  };

  const deleteTask = async (id) => {
    if (confirm('Удалить?')) {
      await supabase.from('tasks').delete().eq('id', id);
      fetchTasks();
    }
  };

  const updateTaskDueDate = async (taskId, dueDate) => {
    await supabase
      .from('tasks')
      .update({ due_date: dueDate })
      .eq('id', taskId);
    fetchTasks();
  };

  // ============================================================================ 
  // DEAL HANDLERS
  // ============================================================================ 

  const saveNewDeal = async () => {
    if (!newDealData.title) return;

    let companyId = null;

    // Если выбрана существующая компания из автокомплита
    if (newDealData.selectedCompanyId) {
        companyId = newDealData.selectedCompanyId;
    }
    // Если есть данные из DaData (новая компания)
    else if (newDealData.dadataCompany) {
        const dadataData = newDealData.dadataCompany;
        
        // Создаём компанию со всеми полями из DaData
        const { data, error } = await supabase
            .from('companies')
            .insert([{
                name: dadataData.name,
                inn: dadataData.inn,
                kpp: dadataData.kpp,
                ogrn: dadataData.ogrn,
                okpo: dadataData.okpo,
                okved: dadataData.okved,
                legal_address: dadataData.legal_address,
                postal_code: dadataData.postal_code,
                director: dadataData.director,
                director_post: dadataData.director_post,
                phone: dadataData.phone,
                email: dadataData.email,
                website: dadataData.website,
                status: dadataData.status,
                registration_date: dadataData.registration_date,
                capital: dadataData.capital,
                employee_count: dadataData.employee_count,
                full_name: dadataData.full_name,
                short_name: dadataData.short_name,
                opf: dadataData.opf,
                bank_bik: dadataData.bank_bik,
                bank_name: dadataData.bank_name,
            }])
            .select();

        if (data && !error) {
            companyId = data[0].id;
        }
        fetchCompanies();
    }
    // Если просто введено название (без ИНН)
    else if (newDealData.company) {
        // Проверяем существующие компании
        const existing = companies.find(
            c => c.name.toLowerCase() === newDealData.company.toLowerCase()
        );

        if (existing) {
            companyId = existing.id;
        } else {
            // Создаём новую компанию только с названием
            const { data } = await supabase
                .from('companies')
                .insert([{ name: newDealData.company }])
                .select();

            if (data) companyId = data[0].id;
            fetchCompanies();
        }
    }

    // Создаём или обновляем сделку
    if (newDealData.dealId) {
        // Редактирование существующей сделки
        const { error } = await supabase
            .from('deals')
            .update({
                title: newDealData.title,
                stage: newDealData.stage,
                company_id: companyId
            })
            .eq('id', newDealData.dealId);

        if (!error) {
            fetchDeals();
            setIsDealModalOpen(false);
            setNewDealData({ title: '', company: '', stage: stages[0]?.id || 1 });
        }
    } else {
        // Создание новой сделки
        const { error } = await supabase.from('deals').insert([
            {
                title: newDealData.title,
                stage: newDealData.stage,
                company_id: companyId
            }
        ]);

        if (!error) {
            fetchDeals();
            setActiveStageId(Number(newDealData.stage));
            setIsDealModalOpen(false);
            setNewDealData({ title: '', company: '', stage: stages[0]?.id || 1 });
        }
    }
  };

  const updateStage = async (sid) => {
    await supabase
      .from('deals')
      .update({ stage: sid })
      .eq('id', selectedDeal.id);

    fetchDeals();
    setSelectedDeal(null);
    setActiveStageId(Number(sid));
  };

  // ============================================================================ 
  // COMPANY HANDLERS
  // ============================================================================ 

  const openCompanyCard = (id, name = '') => {
    if (id) {
      setEditingCompany(companies.find(c => c.id === id));
    } else {
      setEditingCompany({
        id: null,
        name,
        inn: '',
        director: '',
        phone: '',
        email: '',
        description: ''
      });
    }
    setIsCompanyModalOpen(true);
  };

  const saveCompany = async () => {
    if (!editingCompany.name) return;

    const data = { ...editingCompany };
    delete data.id;

    if (editingCompany.id) {
      await supabase
        .from('companies')
        .update(data)
        .eq('id', editingCompany.id);
    } else {
      await supabase.from('companies').insert([data]);
    }

    fetchCompanies();
    setIsCompanyModalOpen(false);
  };

  // ============================================================================ 
  // OTHER HANDLERS
  // ============================================================================ 

  const handleFileUpload = () => alert("Нужен Storage");

  // ============================================================================ 
  // COMPUTED VALUES
  // ============================================================================ 

  const currentDeals = deals.filter(deal => deal.stage === activeStageId);
  const dealTasks = tasks.filter(t => selectedDeal && t.deal_id === selectedDeal.id);
  const globalTasksCount = tasks.filter(t => !t.is_done && !t.deal_id).length;

  // ============================================================================ 
  // RENDER
  // ============================================================================ 

  return (
    <div className="flex h-screen w-full bg-gray-50 text-slate-800 font-sans overflow-hidden">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        tasksCount={globalTasksCount}
        onOpenDealModal={() => setIsDealModalOpen(true)}
      />

      {activeMenu === 'crm' && (
        <CrmView
          stages={stages}
          deals={deals}
          activeStageId={activeStageId}
          setActiveStageId={setActiveStageId}
          isStagesCollapsed={isStagesCollapsed}
          setIsStagesCollapsed={setIsStagesCollapsed}
          selectedDeal={selectedDeal}
          setSelectedDeal={setSelectedDeal}
          chatStream={messages}
          currentDeals={currentDeals}
          dealTasks={dealTasks}
          addTask={addTask}
          toggleTask={toggleTask}
          editTask={editTask}
          toggleSubtask={toggleSubtask}
          deleteTask={deleteTask}
          quickTaskText={quickTaskText}
          setQuickTaskText={setQuickTaskText}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessage={sendMessage}
          replyTo={replyTo}
          setReplyTo={setReplyTo}
          openCompanyCard={openCompanyCard}
          updateStage={updateStage}
          handleFileUpload={handleFileUpload}
          editMessage={editMessage}
          deleteMessage={deleteMessage}
          forwardMessage={forwardMessage}
        />
      )}

      {activeMenu === 'tasks' && (
        <TasksView
          tasks={tasks}
          deals={deals}
          filter={taskFilter}
          setFilter={setTaskFilter}
          newTaskText={globalTaskText}
          setNewTaskText={setGlobalTaskText}
          addTask={addTask}
          toggleTask={toggleTask}
          toggleSubtask={toggleSubtask}
          deleteTask={deleteTask}
          updateTaskDueDate={updateTaskDueDate}
        />
      )}

      {activeMenu === 'companies' && (
        <CompaniesView
          companies={companies}
          onOpenCard={openCompanyCard}
        />
      )}

      {activeMenu === 'settings' && (
        <SettingsView
          stages={stages}
          onStagesChange={fetchStages}
        />
      )}

      {activeMenu === 'analytics' && <AnalyticsView />}
      {activeMenu === 'team' && <TeamView />}

      <DealModal
        isOpen={isDealModalOpen}
        onClose={() => setIsDealModalOpen(false)}
        data={newDealData}
        onChange={setNewDealData}
        onSave={saveNewDeal}
        stages={stages}
        companies={companies}
      />

      <CompanyModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        company={editingCompany}
        onChange={setEditingCompany}
        onSave={saveCompany}
      />
    </div>
  );
};

export default App;
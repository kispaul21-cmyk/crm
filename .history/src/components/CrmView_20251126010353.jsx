import React from 'react';
import CrmStages from './CrmStages';
import CrmList from './CrmList';
import CrmChat from './CrmChat';
import CrmInfo from './CrmInfo';

const CrmView = ({ 
  stages, deals, activeStageId, setActiveStageId, isStagesCollapsed, setIsStagesCollapsed, 
  selectedDeal, setSelectedDeal, 
  
  // 👇 ДОБАВИЛИ ЭТОТ ПРОП (РАНЬШЕ ЕГО ТУТ НЕ БЫЛО)
  currentDeals, 

  chatStream, dealTasks, 
  addTask, toggleTask, toggleSubtask, deleteTask,
  quickTaskText, setQuickTaskText, 
  newMessage, setNewMessage, sendMessage, replyTo, setReplyTo, 
  openCompanyCard, updateStage, handleFileUpload 
}) => {
  
  return (
    <>
      {/* 1. ЛЕВАЯ КОЛОНКА: ЭТАПЫ */}
      <CrmStages 
        stages={stages} deals={deals} activeStageId={activeStageId} setActiveStageId={setActiveStageId}
        isCollapsed={isStagesCollapsed} setIsCollapsed={setIsStagesCollapsed} setSelectedDeal={setSelectedDeal}
      />

      {/* 2. ЛЕНТА: СПИСОК СДЕЛОК */}
      <CrmList 
        // Теперь мы передаем реальные данные, а не пустоту
        currentDeals={currentDeals || []} 
        selectedDeal={selectedDeal} setSelectedDeal={setSelectedDeal}
      />

      {/* 3. ЦЕНТР: ЧАТ */}
      <CrmChat 
        selectedDeal={selectedDeal} 
        chatStream={chatStream} 
        dealTasks={dealTasks}
        addTask={addTask} 
        toggleTask={toggleTask} 
        toggleSubtask={toggleSubtask} 
        deleteTask={deleteTask}
        quickTaskText={quickTaskText} setQuickTaskText={setQuickTaskText}
        newMessage={newMessage} setNewMessage={setNewMessage} sendMessage={sendMessage}
        replyTo={replyTo} setReplyTo={setReplyTo} openCompanyCard={openCompanyCard}
      />

      {/* 4. ПРАВАЯ КОЛОНКА: ИНФО */}
      <CrmInfo 
        selectedDeal={selectedDeal} stages={stages} updateStage={updateStage}
        openCompanyCard={openCompanyCard} handleFileUpload={handleFileUpload}
      />
    </>
  );
};

export default CrmView;
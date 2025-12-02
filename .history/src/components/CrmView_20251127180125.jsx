import React, { useState } from 'react';
import CrmStages from './CrmStages';
import CrmList from './CrmList';
import CrmChat from './CrmChat';
import CrmInfo from './CrmInfo';
import FilterPanel from './FilterPanel';

const CrmView = ({
    stages, deals, activeStageId, setActiveStageId, isStagesCollapsed, setIsStagesCollapsed,
    selectedDeal, setSelectedDeal,

    // 👇 ВАЖНО: Принимаем новые данные от App.jsx
    chatStream,
    dealTasks,
    currentDeals,

    addTask, toggleTask, editTask, toggleSubtask, deleteTask,
    quickTaskText, setQuickTaskText,
    newMessage, setNewMessage, sendMessage, replyTo, setReplyTo,
    openCompanyCard, updateStage, handleFileUpload,
    editMessage, deleteMessage, forwardMessage
}) => {
    // Search states
    const [stagesSearchQuery, setStagesSearchQuery] = useState('');
    const [dealsSearchQuery, setDealsSearchQuery] = useState('');

    // Filter panel state
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Filter currentDeals by date if filters are applied
    const filteredCurrentDeals = currentDeals.filter(deal => {
        if (!dateFrom && !dateTo) return true;

        const dealDate = new Date(deal.created_at);
        const matchesDateFrom = !dateFrom || dealDate >= new Date(dateFrom);
        const matchesDateTo = !dateTo || dealDate <= new Date(dateTo);

        return matchesDateFrom && matchesDateTo;
    });

    const handleClearFilters = () => {
        setDateFrom('');
        setDateTo('');
        setStagesSearchQuery('');
        setDealsSearchQuery('');
    };

    return (
        <>
            {/* 1. ЛЕВАЯ КОЛОНКА: ЭТАПЫ */}
            <CrmStages
                stages={stages} deals={deals} activeStageId={activeStageId} setActiveStageId={setActiveStageId}
                isCollapsed={isStagesCollapsed} setIsCollapsed={setIsStagesCollapsed} setSelectedDeal={setSelectedDeal}
                stagesSearchQuery={stagesSearchQuery}
                setStagesSearchQuery={setStagesSearchQuery}
                onFilterClick={() => setIsFilterPanelOpen(true)}
            />

            {/* 2. ЛЕНТА: СПИСОК СДЕЛОК */}
            <CrmList
                currentDeals={filteredCurrentDeals}
                selectedDeal={selectedDeal} setSelectedDeal={setSelectedDeal}
                dealsSearchQuery={dealsSearchQuery}
                setDealsSearchQuery={setDealsSearchQuery}
                onFilterClick={() => setIsFilterPanelOpen(true)}
            />

            {/* 3. ЦЕНТР: ЧАТ */}
            <CrmChat
                selectedDeal={selectedDeal}
                // 👇 ВАЖНО: Передаем данные дальше в Чат
                chatStream={chatStream || []}
                dealTasks={dealTasks || []}

                addTask={addTask}
                toggleTask={toggleTask}
                editTask={editTask}
                toggleSubtask={toggleSubtask}
                deleteTask={deleteTask}
                quickTaskText={quickTaskText} setQuickTaskText={setQuickTaskText}
                newMessage={newMessage} setNewMessage={setNewMessage} sendMessage={sendMessage}
                replyTo={replyTo} setReplyTo={setReplyTo} openCompanyCard={openCompanyCard}
                editMessage={editMessage}
                deleteMessage={deleteMessage}
                forwardMessage={forwardMessage}
            />

            {/* 4. ПРАВАЯ КОЛОНКА: ИНФО */}
            <CrmInfo
                selectedDeal={selectedDeal} stages={stages} updateStage={updateStage}
                openCompanyCard={openCompanyCard} handleFileUpload={handleFileUpload}
            />

            {/* 5. ПАНЕЛЬ ФИЛЬТРОВ */}
            <FilterPanel
                isOpen={isFilterPanelOpen}
                onClose={() => setIsFilterPanelOpen(false)}
                dateFrom={dateFrom}
                setDateFrom={setDateFrom}
                dateTo={dateTo}
                setDateTo={setDateTo}
                onClear={handleClearFilters}
            />
        </>
    );
};

export default CrmView;
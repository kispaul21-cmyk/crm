import React, { useState } from 'react';
import CrmStages from './CrmStages';
import CrmList from './CrmList';
import CrmChat from './CrmChat';
import CrmInfo from './CrmInfo';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';

const CrmView = ({
    stages, deals, activeStageId, setActiveStageId,
    selectedDeal, setSelectedDeal,

    // 👇 ВАЖНО: Принимаем новые данные от App.jsx
    chatStream,
    dealTasks,
    currentDeals,

    addTask, toggleTask, toggleSubtask, deleteTask,
    quickTaskText, setQuickTaskText,
    newMessage, setNewMessage, sendMessage, replyTo, setReplyTo,
    openCompanyCard, updateStage, handleFileUpload
}) => {
    // Local state for search and filters
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Filter deals based on search query and date range
    const filteredDeals = currentDeals.filter(deal => {
        // Search filter
        const matchesSearch = !searchQuery ||
            deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            deal.company_name.toLowerCase().includes(searchQuery.toLowerCase());

        // Date filter
        const dealDate = new Date(deal.created_at);
        const matchesDateFrom = !dateFrom || dealDate >= new Date(dateFrom);
        const matchesDateTo = !dateTo || dealDate <= new Date(dateTo);

        return matchesSearch && matchesDateFrom && matchesDateTo;
    });

    const handleClearFilters = () => {
        setSearchQuery('');
        setDateFrom('');
        setDateTo('');
    };

    return (
        <>
            {/* Wrapper for Stages + SearchBar + List */}
            <div className="flex flex-shrink-0">
                {/* 1. ЛЕВАЯ КОЛОНКА: ЭТАПЫ */}
                <CrmStages
                    stages={stages} deals={deals} activeStageId={activeStageId} setActiveStageId={setActiveStageId}
                    setSelectedDeal={setSelectedDeal}
                />

                {/* Wrapper for SearchBar + List */}
                <div className="flex flex-col">
                    {/* 2. ПОИСК (между воронкой и списком) */}
                    <SearchBar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        onFilterClick={() => setIsFilterPanelOpen(true)}
                    />

                    {/* 3. ЛЕНТА: СПИСОК СДЕЛОК */}
                    <CrmList
                        currentDeals={filteredDeals}
                        selectedDeal={selectedDeal} setSelectedDeal={setSelectedDeal}
                    />
                </div>
            </div>

            {/* 4. ЦЕНТР: ЧАТ */}
            <CrmChat
                selectedDeal={selectedDeal}
                // 👇 ВАЖНО: Передаем данные дальше в Чат
                chatStream={chatStream || []}
                dealTasks={dealTasks || []}

                addTask={addTask}
                toggleTask={toggleTask}
                toggleSubtask={toggleSubtask}
                deleteTask={deleteTask}
                quickTaskText={quickTaskText} setQuickTaskText={setQuickTaskText}
                newMessage={newMessage} setNewMessage={setNewMessage} sendMessage={sendMessage}
                replyTo={replyTo} setReplyTo={setReplyTo} openCompanyCard={openCompanyCard}
            />

            {/* 5. ПРАВАЯ КОЛОНКА: ИНФО */}
            <CrmInfo
                selectedDeal={selectedDeal} stages={stages} updateStage={updateStage}
                openCompanyCard={openCompanyCard} handleFileUpload={handleFileUpload}
            />

            {/* 6. ПАНЕЛЬ ФИЛЬТРОВ */}
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
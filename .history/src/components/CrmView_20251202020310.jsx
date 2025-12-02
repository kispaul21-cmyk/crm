import React, { useState, useEffect } from 'react';
import CrmStages from './CrmStages';
import CrmList from './CrmList';
import CrmChat from './CrmChat';
import CrmInfo from './CrmInfo';
import FilterPanel from './FilterPanel';
import ResizablePanel from './ResizablePanel';

const CrmView = ({
    stages, deals, activeStageId, setActiveStageId, isStagesCollapsed, setIsStagesCollapsed,
    selectedDeal, setSelectedDeal,

    // 👇 ВАЖНО: Принимаем новые данные от App.jsx
    chatStream,
    dealTasks,
    currentDeals,

    addTask, toggleTask, setTaskInProgress, editTask, deleteTask,
    deleteDeal,
    quickTaskText, setQuickTaskText,
    newMessage, setNewMessage, sendMessage, replyTo, setReplyTo,
    openCompanyCard, updateStage, handleFileUpload,
    editMessage, deleteMessage, forwardMessage
}) => {
    // Search states
    const [stagesSearchQuery, setStagesSearchQuery] = useState('');
    const [dealsSearchQuery, setDealsSearchQuery] = useState('');

    // Panels order for drag & drop: 'stages' | 'deals' | 'info'
    const [panelsOrder, setPanelsOrder] = useState(() => {
        try {
            const raw = localStorage.getItem('crm.panelsOrder');
            return raw ? JSON.parse(raw) : ['stages', 'deals', 'info'];
        } catch (e) {
            return ['stages', 'deals', 'info'];
        }
    });

    useEffect(() => {
        try { localStorage.setItem('crm.panelsOrder', JSON.stringify(panelsOrder)); } catch (e) { }
    }, [panelsOrder]);

    const onDragStart = (e, panel) => {
        e.dataTransfer.setData('text/plain', panel);
        e.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = (e) => {
        e.preventDefault();
    };

    const onDrop = (e, targetPanel) => {
        e.preventDefault();
        const source = e.dataTransfer.getData('text/plain');
        if (!source || source === targetPanel) return;
        const next = [...panelsOrder];
        const srcIdx = next.indexOf(source);
        const tgtIdx = next.indexOf(targetPanel);
        if (srcIdx === -1 || tgtIdx === -1) return;
        // remove source
        next.splice(srcIdx, 1);
        // insert before target index
        next.splice(tgtIdx, 0, source);
        setPanelsOrder(next);
    };

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
        <div className="flex flex-1 overflow-hidden">
            {/* 1. ЛЕВАЯ КОЛОНКА: ЭТАПЫ (resizable) */}
            <ResizablePanel
                defaultWidth={256}
                minWidth={200}
                maxWidth={400}
                side="left"
                isCollapsed={isStagesCollapsed}
                collapsedWidth={64}
            >
                <CrmStages
                    stages={stages} deals={deals} activeStageId={activeStageId} setActiveStageId={setActiveStageId}
                    isCollapsed={isStagesCollapsed} setIsCollapsed={setIsStagesCollapsed} setSelectedDeal={setSelectedDeal}
                    stagesSearchQuery={stagesSearchQuery}
                    setStagesSearchQuery={setStagesSearchQuery}
                    onFilterClick={() => setIsFilterPanelOpen(true)}
                />
            </ResizablePanel>

            {/* 2. ЛЕНТА: СПИСОК СДЕЛОК (resizable) */}
            <ResizablePanel
                defaultWidth={320}
                minWidth={200}
                maxWidth={500}
                side="left"
            >
                <CrmList
                    currentDeals={filteredCurrentDeals}
                    selectedDeal={selectedDeal} setSelectedDeal={setSelectedDeal}
                    dealsSearchQuery={dealsSearchQuery}
                    setDealsSearchQuery={setDealsSearchQuery}
                    onFilterClick={() => setIsFilterPanelOpen(true)}
                    onDeleteDeal={deleteDeal}
                />
            </ResizablePanel>

            {/* 3. ЦЕНТР: ЧАТ (растягивается) */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                <CrmChat
                    selectedDeal={selectedDeal}
                    // 👇 ВАЖНО: Передаем данные дальше в Чат
                    chatStream={chatStream || []}
                    dealTasks={dealTasks || []}

                    addTask={addTask}
                    toggleTask={toggleTask}
                    setTaskInProgress={setTaskInProgress}
                    editTask={editTask}
                    deleteTask={deleteTask}
                    quickTaskText={quickTaskText} setQuickTaskText={setQuickTaskText}
                    newMessage={newMessage} setNewMessage={setNewMessage} sendMessage={sendMessage}
                    replyTo={replyTo} setReplyTo={setReplyTo} openCompanyCard={openCompanyCard}
                    editMessage={editMessage}
                    deleteMessage={deleteMessage}
                    forwardMessage={forwardMessage}
                />
            </div>

            {/* 4. ПРАВАЯ КОЛОНКА: ИНФО (resizable) */}
            <ResizablePanel
                defaultWidth={288}
                minWidth={250}
                maxWidth={450}
                side="right"
            >
                <CrmInfo
                    selectedDeal={selectedDeal}
                    stages={stages}
                    updateStage={updateStage}
                    openCompanyCard={openCompanyCard}
                    handleFileUpload={handleFileUpload}
                />
            </ResizablePanel>

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
        </div>
    );
};

export default CrmView;

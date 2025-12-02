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

    // Panels order state: controls which panel is left/center/right
    const [panelsOrder, setPanelsOrder] = useState(() => {
        try {
            const raw = localStorage.getItem('crm.panelsOrder');
            if (raw) return JSON.parse(raw);
        } catch (e) {
            // ignore
        }
        return ['stages', 'deals', 'info'];
    });

    useEffect(() => {
        try {
            localStorage.setItem('crm.panelsOrder', JSON.stringify(panelsOrder));
        } catch (e) {
            // ignore
        }
    }, [panelsOrder]);

    const [dragging, setDragging] = useState(null);

    const onDragStart = (e, panelKey) => {
        e.dataTransfer.setData('text/plain', panelKey);
        setDragging(panelKey);
        // set allowed effect
        try { e.dataTransfer.effectAllowed = 'move'; } catch (err) {}
    };

    const onDragOver = (e) => {
        e.preventDefault();
        try { e.dataTransfer.dropEffect = 'move'; } catch (err) {}
    };

    const onDrop = (e, targetKey) => {
        e.preventDefault();
        const sourceKey = e.dataTransfer.getData('text/plain');
        setDragging(null);
        if (!sourceKey || sourceKey === targetKey) return;

        setPanelsOrder((prev) => {
            const next = prev.filter(k => k !== sourceKey);
            const targetIndex = next.indexOf(targetKey);
            // insert source before targetIndex (so it takes the target position)
            next.splice(targetIndex, 0, sourceKey);
            // ensure length 3
            return next.slice(0, 3);
        });
    };

    return (
        <div className="flex flex-1 overflow-hidden">
            {/* Left side: render first two panels from panelsOrder */}
            {panelsOrder.slice(0, 2).map((panelKey) => (
                <div
                    key={panelKey}
                    className="flex-shrink-0"
                    draggable
                    onDragStart={(e) => onDragStart(e, panelKey)}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, panelKey)}
                    style={{ opacity: dragging === panelKey ? 0.6 : 1 }}
                >
                    {panelKey === 'stages' && (
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
                    )}

                    {panelKey === 'deals' && (
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
                    )}
                </div>
            ))}

            {/* Center chat */}
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

            {/* Right: render third panel in order */}
            {panelsOrder[2] && (
                <div
                    className="flex-shrink-0"
                    draggable
                    onDragStart={(e) => onDragStart(e, panelsOrder[2])}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, panelsOrder[2])}
                    style={{ opacity: dragging === panelsOrder[2] ? 0.6 : 1 }}
                >
                    {panelsOrder[2] === 'info' && (
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
                    )}

                    {panelsOrder[2] === 'stages' && (
                        <ResizablePanel
                            defaultWidth={256}
                            minWidth={200}
                            maxWidth={400}
                            side="right"
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
                    )}

                    {panelsOrder[2] === 'deals' && (
                        <ResizablePanel
                            defaultWidth={320}
                            minWidth={200}
                            maxWidth={500}
                            side="right"
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
                    )}
                </div>
            )}

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

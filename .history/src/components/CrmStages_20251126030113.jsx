import React from 'react';
import { ChevronRight, ChevronLeft, Filter, Search } from 'lucide-react';

const CrmStages = ({
  stages, deals, activeStageId, setActiveStageId, isCollapsed, setIsCollapsed, setSelectedDeal,
  stagesSearchQuery, setStagesSearchQuery, onFilterClick
}) => {
  // Filter stages by search query
  const filteredStages = stages.filter(stage =>
    !stagesSearchQuery || stage.name.toLowerCase().includes(stagesSearchQuery.toLowerCase())
  );

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 flex-shrink-0 relative z-20`}>
      {/* Header with title and buttons */}
      <div className="border-b border-gray-100">
        <div className="h-10 flex items-center justify-between px-4">
          {!isCollapsed && <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Воронка</span>}
          <div className="flex items-center gap-1">
            {!isCollapsed && (
              <button
                onClick={onFilterClick}
                className="p-1 hover:bg-gray-100 rounded text-slate-400"
                title="Фильтры"
              >
                <Filter size={16} />
              </button>
            )}
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 hover:bg-gray-100 rounded text-slate-400">
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </div>
        {/* Search field */}
        {!isCollapsed && (
          <div className="h-10 flex items-center px-4 gap-2">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Поиск..."
              value={stagesSearchQuery}
              onChange={(e) => setStagesSearchQuery(e.target.value)}
              className="w-full outline-none text-sm"
            />
          </div>
        )}
      </div>

      {/* Stages list */}
      <div className="flex-1 overflow-y-auto py-2 flex flex-col justify-start space-y-1 px-2">
        {filteredStages.map(stage => {
          const count = deals.filter(d => d.stage === stage.id).length;
          const isActive = activeStageId === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => { setActiveStageId(stage.id); setSelectedDeal(null); }}
              className={`relative flex items-center justify-between p-3 transition-all rounded-l-lg ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'} border-r-4 ${stage.color}`}
            >
              {!isCollapsed ? (
                <>
                  <span className="font-medium text-sm">{stage.name}</span>
                  {count > 0 && <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full shadow-sm">{count}</span>}
                </>
              ) : <div className="w-full flex justify-center text-xs font-bold">{count}</div>}
            </button>
          )
        })}
        {filteredStages.length === 0 && !isCollapsed && (
          <div className="p-4 text-center text-sm text-gray-400">Ничего не найдено</div>
        )}
      </div>
    </div>
  );
};

export default CrmStages;
import React from 'react';

const CrmStages = ({ stages, deals, activeStageId, setActiveStageId, setSelectedDeal }) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 relative z-20">
      <div className="h-14 flex items-center px-4 border-b border-gray-100">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Воронка</span>
      </div>

      <div className="flex-1 overflow-y-auto py-2 flex flex-col justify-start space-y-1 px-2">
        {stages.map(stage => {
          const count = deals.filter(d => d.stage === stage.id).length;
          const isActive = activeStageId === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => { setActiveStageId(stage.id); setSelectedDeal(null); }}
              className={`relative flex items-center justify-between p-3 transition-all rounded-l-lg ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'} border-r-4 ${stage.color}`}
            >
              <span className="font-medium text-sm">{stage.name}</span>
              {count > 0 && <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full shadow-sm">{count}</span>}
            </button>
          )
        })}
      </div>
    </div>
  );
};

export default CrmStages;
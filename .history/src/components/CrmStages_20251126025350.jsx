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
      </div >
    </div >
  );
};

export default CrmStages;
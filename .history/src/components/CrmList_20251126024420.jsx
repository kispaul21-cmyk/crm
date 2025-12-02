import React from 'react';
import { Briefcase } from 'lucide-react';

const CrmList = ({ currentDeals, selectedDeal, setSelectedDeal }) => {
  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      <div className="h-14 flex items-center px-4 border-b border-gray-100">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Сделки</span>
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-50/50">
        {currentDeals.length === 0 && <div className="p-10 text-center text-sm text-gray-400">Нет сделок</div>}
        {currentDeals.map(deal => (
          <div
            key={deal.id}
            onClick={() => setSelectedDeal(deal)}
            className={`group p-4 border-b cursor-pointer hover:bg-white transition-all ${selectedDeal?.id === deal.id ? 'bg-white border-l-4 border-l-blue-500 shadow-md' : 'border-l-4 border-l-transparent'}`}
          >
            <div className="font-bold text-sm text-slate-700 mb-1">{deal.title}</div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Briefcase size={12} />
              <span className="truncate">{deal.company_name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CrmList;
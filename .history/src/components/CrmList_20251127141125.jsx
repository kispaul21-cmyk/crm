import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { getFontSizeClass } from '../constants/fontSizes';

const CrmList = ({
  currentDeals, selectedDeal, setSelectedDeal,
  dealsSearchQuery, setDealsSearchQuery, onFilterClick
}) => {
  // Filter deals by search query
  const CrmList = ({
  currentDeals, selectedDeal, setSelectedDeal,
  dealsSearchQuery, setDealsSearchQuery, onFilterClick
}) => {
  // Filter deals by search query
  
  // Font size settings
  const [fontSize, setFontSize] = useState(
      localStorage.getItem('crmGlobalFontSize') || 'm'
  );
  const [applyPipeline, setApplyPipeline] = useState(
      localStorage.getItem('crmApplyPipeline') !== 'false'
  );

  useEffect(() => {
      const handleFontChange = () => {
          setFontSize(localStorage.getItem('crmGlobalFontSize') || 'm');
          setApplyPipeline(localStorage.getItem('crmApplyPipeline') !== 'false');
      };
      
      window.addEventListener('fontSizeChanged', handleFontChange);
      return () => window.removeEventListener('fontSizeChanged', handleFontChange);
  }, []);

  const fontClass = applyPipeline ? getFontSizeClass(fontSize) : 'text-sm';
  const filteredDeals = currentDeals.filter(deal =>
    !dealsSearchQuery ||
    deal.title.toLowerCase().includes(dealsSearchQuery.toLowerCase()) ||
    deal.company_name.toLowerCase().includes(dealsSearchQuery.toLowerCase())
  );

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      <div className="border-b border-gray-100">
        <div className="h-10 flex items-center justify-between px-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Сделки</span>
          <button
            onClick={onFilterClick}
            className="p-1 hover:bg-gray-100 rounded text-slate-400"
            title="Фильтры"
          >
            <Filter size={16} />
          </button>
        </div>
        <div className="h-10 flex items-center px-4 gap-2">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Поиск..."
            value={dealsSearchQuery}
            onChange={(e) => setDealsSearchQuery(e.target.value)}
            className="w-full outline-none text-sm"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-50/50">
        {filteredDeals.length === 0 && <div className="p-10 text-center text-sm text-gray-400">Нет сделок</div>}
        {filteredDeals.map(deal => (
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
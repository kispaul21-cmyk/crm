import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { getFontSizeClass } from '../constants/fontSizes';

const CrmList = ({
  currentDeals, selectedDeal, setSelectedDeal,
  dealsSearchQuery, setDealsSearchQuery, onFilterClick
}) => {
  // Filter deals by search query
  const filteredDeals = currentDeals.filter(deal =>
    !dealsSearchQuery ||
    deal.title.toLowerCase().includes(dealsSearchQuery.toLowerCase()) ||
    deal.company_name.toLowerCase().includes(dealsSearchQuery.toLowerCase())
  );

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

  return (
    <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-gray-100">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Сделки</span>
      </div>
      
      {/* Search bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={dealsSearchQuery}
            onChange={(e) => setDealsSearchQuery(e.target.value)}
            placeholder="Поиск..."
            className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {dealsSearchQuery && (
            <button
              onClick={() => setDealsSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Deals list */}
      <div className="flex-1 overflow-y-auto">
        {filteredDeals.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            Сделок не найдено
          </div>
        ) : (
          filteredDeals.map(deal => (
            <div
              key={deal.id}
              onClick={() => setSelectedDeal(deal)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${selectedDeal?.id === deal.id
                  ? 'bg-blue-50 border-l-4 border-l-blue-500'
                  : 'hover:bg-gray-50'
                }`}
            >
              <div className={`font-bold ${fontClass} text-slate-700 mb-1`}>{deal.title}</div>
              <div className="text-xs text-gray-500 mb-2">{deal.company_name || 'Без компании'}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {new Date(deal.created_at).toLocaleDateString('ru-RU')}
                </span>
                {deal.budget && (
                  <span className="text-xs font-bold text-green-600">
                    {deal.budget.toLocaleString('ru-RU')} ₽
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CrmList;
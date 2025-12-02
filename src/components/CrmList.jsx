import React, { useState, useEffect } from 'react';
import { Search, X, Trash } from 'lucide-react';
import { getFontSizeClass } from '../constants/fontSizes';

const CrmList = ({
  currentDeals, selectedDeal, setSelectedDeal,
  dealsSearchQuery, setDealsSearchQuery, onFilterClick
  , onDeleteDeal
}) => {
  // Filter deals by search query
  const filteredDeals = (currentDeals || []).filter(deal =>
    !dealsSearchQuery ||
    deal.title.toLowerCase().includes(dealsSearchQuery.toLowerCase()) ||
    (deal.company_name && deal.company_name.toLowerCase().includes(dealsSearchQuery.toLowerCase()))
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
    <div className="w-full h-full border-r border-gray-200 flex flex-col bg-white">
      {/* Header + Search */}
      <div className="border-b border-gray-100">
        <div className="h-16 flex items-center px-4 gap-2">
          <div className="relative w-full">
            <Search size={16} className="text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={dealsSearchQuery}
              onChange={(e) => setDealsSearchQuery(e.target.value)}
              placeholder="Поиск..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 transition"
            />
          </div>
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
              className={`h-[98px] p-4 border-b border-gray-100 cursor-pointer transition-colors ${selectedDeal?.id === deal.id ? 'bg-blue-50 border-l-4 border-l-blue-500'
                : 'hover:bg-gray-50'
                }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className={`font-bold ${fontClass} text-slate-700 mb-1`}>{deal.title}</div>
                  <div className="text-xs text-gray-500 mb-2">{deal.company_name || 'Без компании'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); if (typeof onDeleteDeal === 'function') onDeleteDeal(deal.id); }}
                    className="text-red-400 hover:text-red-600 p-1 rounded"
                    title="Удалить сделку"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
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
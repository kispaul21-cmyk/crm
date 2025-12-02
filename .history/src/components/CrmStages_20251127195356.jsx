import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Filter, Search } from 'lucide-react';
import { getFontSizeClass } from '../constants/fontSizes';

// Отдельный компонент для кнопки этапа воронки для чистоты кода
const StageButton = ({ stage, dealCount, isActive, onClick, fontClass }) => {
  const buttonClasses = `relative flex items-center justify-between w-full p-3 transition-all rounded-l-lg text-left ${isActive
    ? 'bg-slate-100 text-slate-900'
    : 'text-slate-500 hover:bg-slate-50'
    }`;

  // Стили для цветной полоски справа
  // Если цвет не задан, используется серый по умолчанию (#E5E7EB - gray-200)
  const borderStyle = {
    borderRight: `4px solid ${stage.color || '#E5E7EB'}`
  };

  return (
    <button
      onClick={onClick}
      className={buttonClasses}
      style={borderStyle}
    >
      <span className={`font-medium ${fontClass}`}>{stage.name}</span>
      {dealCount > 0 && (
        <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full shadow-sm">
          {dealCount}
        </span>
      )}
    </button>
  );
};

// Компонент для свернутого состояния
const CollapsedStageButton = ({ dealCount }) => {
  // В свернутом состоянии цветная полоска не нужна
  return (
    <div className="w-full h-[48px] flex items-center justify-center text-xs font-bold bg-white p-3 rounded-l-lg">
      {dealCount}
    </div>
  );
};

const CrmStages = ({
  stages, deals, activeStageId, setActiveStageId, isCollapsed, setIsCollapsed, setSelectedDeal,
  stagesSearchQuery, setStagesSearchQuery, onFilterClick
}) => {
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

  const filteredStages = (stages || []).filter(stage =>
    !stagesSearchQuery || stage.name.toLowerCase().includes(stagesSearchQuery.toLowerCase())
  );

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 flex-shrink-0 relative z-20`}>
      {/* Шапка */}
      <div className="border-b border-gray-100">
        <div className="h-14 flex items-center justify-between px-4">
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

      {/* Список этапов */}
      <div className="flex-1 overflow-y-auto flex flex-col justify-start space-y-1 px-2">
        {filteredStages.map(stage => {
          const dealCount = (deals || []).filter(d => d.stage === stage.id).length;
          const isActive = activeStageId === stage.id;

          return (
            <div key={stage.id}>
              {!isCollapsed ? (
                <StageButton
                  stage={stage}
                  dealCount={dealCount}
                  isActive={isActive}
                  onClick={() => { setActiveStageId(stage.id); setSelectedDeal(null); }}
                  fontClass={fontClass}
                />
              ) : (
                <CollapsedStageButton dealCount={dealCount} />
              )}
            </div>
          );
        })}

        {filteredStages.length === 0 && !isCollapsed && (
          <div className="p-4 text-center text-sm text-gray-400">Ничего не найдено</div>
        )}
      </div>
    </div>
  );
};

export default CrmStages;
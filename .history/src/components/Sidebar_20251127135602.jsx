import React, { useState, useEffect } from 'react';
import { Settings, ListChecks, Users, TrendingUp, Building2, Plus, LayoutDashboard, BarChart3, CheckSquare } from 'lucide-react';
import { getFontSizeClass } from '../constants/fontSizes';

const Sidebar = ({ activeMenu, setActiveMenu, tasksCount, onOpenDealModal }) => {
  // Font size settings
  const [fontSize, setFontSize] = useState(
    localStorage.getItem('crmGlobalFontSize') || 'm'
  );
  const [applySidebar, setApplySidebar] = useState(
    localStorage.getItem('crmApplySidebar') !== 'false'
  );

  useEffect(() => {
    const handleFontChange = () => {
      setFontSize(localStorage.getItem('crmGlobalFontSize') || 'm');
      setApplySidebar(localStorage.getItem('crmApplySidebar') !== 'false');
    };

    window.addEventListener('fontSizeChanged', handleFontChange);
    return () => window.removeEventListener('fontSizeChanged', handleFontChange);
  }, []);

  const fontClass = applySidebar ? getFontSizeClass(fontSize) : 'text-sm';

  return (
    <div className="w-64 bg-slate-900 flex flex-col h-screen">
        {/* 1. ЛОГОТИП */}
        <div className="h-16 flex items-center px-6 font-bold text-white text-xl border-b border-slate-800 tracking-wide">
            CRM
        </div>

        {/* 2. КНОПКА "Новая сделка" - СЮДА! */}
        <div className="p-3 border-t border-slate-800">
            <button onClick={onOpenDealModal} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2">
                <Plus size={18} />
                Новая сделка
            </button>
        </div>

        {/* 3. МЕНЮ НАВИГАЦИИ */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            <MenuHeader title="Основное" />
            <MenuItem ... />
            ...
        </nav>

        {/* 4. ПРОФИЛЬ "Алексей" - ВНИЗУ */}
        <div className="p-4 flex items-center gap-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">A</div>
            <div>
                <div className={`${fontClass} font-medium text-white`}>Алексей</div>
                <div className="text-xs text-slate-500">Администратор</div>
            </div>
        </div>
    </div>
);

export default Sidebar;
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
      {/* ЛОГОТИП */}
      <div className="h-14 flex items-center px-6 font-bold text-white text-xl border-b border-slate-800 tracking-wide">
        CRM
      </div>

      {/* КНОПКА "Новая сделка" */}
      <div className="h-10 flex items-center px-4 border-b border-slate-800">
        <button onClick={onOpenDealModal} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2">
          <Plus size={18} />
          Новая сделка
        </button>
      </div>

      {/* МЕНЮ НАВИГАЦИИ */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <MenuHeader title="Основное" />
        <MenuItem icon={<LayoutDashboard size={18} />} label="CRM" active={activeMenu === 'crm'} onClick={() => setActiveMenu('crm')} fontClass={fontClass} />
        <MenuItem icon={<CheckSquare size={18} />} label="Задачи" badge={tasksCount} active={activeMenu === 'tasks'} onClick={() => setActiveMenu('tasks')} fontClass={fontClass} />

        <MenuHeader title="База" />
        <MenuItem icon={<Building2 size={18} />} label="Компании" active={activeMenu === 'companies'} onClick={() => setActiveMenu('companies')} fontClass={fontClass} />
        <MenuItem icon={<Users size={18} />} label="Сотрудники" onClick={() => { }} fontClass={fontClass} />

        <MenuHeader title="Система" />
        <MenuItem icon={<BarChart3 size={18} />} label="Аналитика" onClick={() => { }} fontClass={fontClass} />
        <MenuItem icon={<Settings size={18} />} label="Настройки" active={activeMenu === 'settings'} onClick={() => setActiveMenu('settings')} fontClass={fontClass} />
      </nav>

      {/* ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ */}
      <div className="p-4 flex items-center gap-3 border-t border-slate-800">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">A</div>
        <div>
          <div className={`${fontClass} font-medium text-white`}>Алексей</div>
          <div className="text-xs text-slate-500">Администратор</div>
        </div>
      </div>
    </div>
  );
};

const MenuHeader = ({ title }) => (
  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 pt-4 pb-2">{title}</div>
);

const MenuItem = ({ icon, label, badge, active, onClick, fontClass = 'text-sm' }) => (
  <div onClick={onClick} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    {icon}
    <span className={`${fontClass} font-medium flex-1`}>{label}</span>
    {badge > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>}
  </div>
);

export default Sidebar;
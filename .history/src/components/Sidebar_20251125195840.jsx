import React from 'react';
import { LayoutDashboard, CheckSquare, Building2, Users, BarChart3, Settings, Plus } from 'lucide-react';

const Sidebar = ({ activeMenu, setActiveMenu, tasksCount, onOpenDealModal }) => {
  return (
    <div className="w-64 bg-slate-900 text-slate-400 flex flex-col flex-shrink-0 z-30 shadow-xl">
      <div className="h-16 flex items-center px-6 font-bold text-white text-xl border-b border-slate-800 tracking-wide">
        MY<span className="text-blue-500">CRM</span>
      </div>
      
      <div className="p-4">
        <button onClick={onOpenDealModal} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-medium shadow-lg shadow-blue-900/50 transition mb-2 flex items-center justify-center gap-2">
            <Plus size={18}/> Создать сделку
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <MenuHeader title="Основное" />
        <MenuItem icon={<LayoutDashboard size={18}/>} label="CRM" active={activeMenu === 'crm'} onClick={() => setActiveMenu('crm')} />
        <MenuItem icon={<CheckSquare size={18}/>} label="Задачи" badge={tasksCount} active={activeMenu === 'tasks'} onClick={() => setActiveMenu('tasks')} />
        
        <MenuHeader title="База" />
        <MenuItem icon={<Building2 size={18}/>} label="Компании" active={activeMenu === 'companies'} onClick={() => setActiveMenu('companies')} />
        <MenuItem icon={<Users size={18}/>} label="Сотрудники" onClick={() => {}} />
        
        <MenuHeader title="Система" />
        <MenuItem icon={<BarChart3 size={18}/>} label="Аналитика" onClick={() => {}} />
        <MenuItem icon={<Settings size={18}/>} label="Настройки" active={activeMenu === 'settings'} onClick={() => setActiveMenu('settings')} />
      </nav>
      
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">A</div>
            <div><div className="text-sm font-medium text-white">Алексей</div><div className="text-xs text-slate-500">Администратор</div></div>
          </div>
      </div>
    </div>
  );
};

const MenuHeader = ({ title }) => (<div className="px-6 mt-6 mb-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider">{title}</div>);
const MenuItem = ({ icon, label, badge, active, onClick }) => (
  <div onClick={onClick} className={`group flex items-center gap-3 px-6 py-2.5 cursor-pointer rounded-lg mx-2 transition-all ${active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    {icon}<span className="text-sm font-medium flex-1">{label}</span>
    {badge ? <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">{badge}</span> : null}
  </div>
);

export default Sidebar;
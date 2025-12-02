import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import {
  LayoutDashboard, CheckSquare, Building2, Users, BarChart3, Settings,
  Search, Paperclip, Send, MoreVertical, ChevronLeft, ChevronRight, UserPlus, FileText
} from 'lucide-react';

const App = () => {
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStagesCollapsed, setIsStagesCollapsed] = useState(false);
  const [activeStageId, setActiveStageId] = useState(1);
  const [activeMenu, setActiveMenu] = useState('crm');

  const stages = [
    { id: 5, name: 'Доставлено (Финал)', color: 'border-blue-600', textColor: 'text-blue-600' },
    { id: 4, name: 'Продано', color: 'border-green-500', textColor: 'text-green-600' },
    { id: 3, name: 'Договор / Юристы', color: 'border-yellow-400', textColor: 'text-yellow-600' },
    { id: 2, name: 'Переговоры', color: 'border-orange-500', textColor: 'text-orange-600' },
    { id: 1, name: 'Новая заявка', color: 'border-red-500', textColor: 'text-red-500' },
  ];

  useEffect(() => { fetchDeals(); }, []);

  async function fetchDeals() {
    setIsLoading(true);
    const { data, error } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
    if (!error) setDeals(data || []);
    setIsLoading(false);
  }

  async function createDeal() {
    const title = prompt("Название новой сделки:");
    if (!title) return;
    const { error } = await supabase.from('deals').insert([{ title, company: 'Новый клиент', stage: 1 }]);
    if (!error) fetchDeals();
  }

  const currentDeals = deals.filter(deal => deal.stage === activeStageId);
  const getStageCount = (id) => deals.filter(d => d.stage === id).length;

  return (
    <div className="flex h-screen w-full bg-gray-100 text-slate-800 font-sans overflow-hidden">
      {/* ЛЕВОЕ МЕНЮ */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 z-20">
        <div className="h-16 flex items-center px-6 font-bold text-white text-xl tracking-wider border-b border-slate-800">MY<span className="text-blue-500">CRM</span></div>
        <nav className="flex-1 py-6 space-y-1">
          <MenuItem icon={<LayoutDashboard size={20} />} label="CRM" active={activeMenu === 'crm'} onClick={() => setActiveMenu('crm')} />
          <MenuItem icon={<CheckSquare size={20} />} label="Задачи" onClick={() => setActiveMenu('tasks')} />
        </nav>
      </div>

      {/* ВОРОНКА */}
      {activeMenu === 'crm' && (
        <div className={`${isStagesCollapsed ? 'w-16' : 'w-60'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 flex-shrink-0 relative z-10`}>
          <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100">
            <button onClick={() => setIsStagesCollapsed(!isStagesCollapsed)} className="p-1 hover:bg-gray-100 rounded text-slate-400">{isStagesCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}</button>
          </div>
          <div className="flex-1 overflow-y-auto py-2 flex flex-col justify-end space-y-1 px-2">
            {stages.map(stage => (
              <button key={stage.id} onClick={() => setActiveStageId(stage.id)} className={`relative flex items-center justify-between p-3 rounded-l-md transition-all ${activeStageId === stage.id ? 'bg-slate-50' : 'hover:bg-slate-50'} border-r-4 ${stage.color}`}>
                {!isStagesCollapsed ? <><span className="font-medium text-sm">{stage.name}</span><span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{getStageCount(stage.id)}</span></> : <div className="w-full text-center text-xs font-bold">{getStageCount(stage.id)}</div>}
              </button>
            ))}
          </div>
          <div className="p-3 border-t border-gray-100"><button onClick={createDeal} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center font-bold text-xl">+</button></div>
        </div>
      )}

      {/* СПИСОК СДЕЛОК */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="h-14 flex items-center px-4 border-b border-gray-100"><span className="font-bold text-slate-700">Сделки</span></div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? <div className="p-10 text-center text-sm text-gray-400">Загрузка...</div> :
            currentDeals.length === 0 ? <div className="p-10 text-center text-sm text-gray-400">Пусто</div> :
              currentDeals.map(deal => (
                <div key={deal.id} className="p-4 border-b hover:bg-gray-50 cursor-pointer">
                  <div className="font-bold text-sm">{deal.title}</div>
                  <div className="text-xs text-gray-500">{deal.company}</div>
                </div>
              ))}
        </div>
      </div>

      {/* ЧАТ (ЦЕНТР) */}
      <div className="flex-1 bg-slate-50 flex items-center justify-center text-gray-400">
        Выберите сделку, чтобы начать чат
      </div>
    </div>
  );
};

const MenuItem = ({ icon, label, active, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-3 px-6 py-3 cursor-pointer border-l-4 ${active ? 'bg-slate-800 border-blue-600 text-white' : 'border-transparent text-slate-400 hover:bg-slate-800'}`}>{icon}<span className="text-sm font-medium">{label}</span></div>
);

export default App;

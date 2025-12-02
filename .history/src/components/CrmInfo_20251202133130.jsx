import React, { useState, useEffect } from 'react';
import { FileText, Download, Phone, Mail, X, History, CheckSquare } from 'lucide-react';
import { getFontSizeClass } from '../constants/fontSizes';

const CrmInfo = ({ selectedDeal, stages, updateStage, openCompanyCard, handleFileUpload, dealTasks = [] }) => {
  const [fontSize, setFontSize] = useState(localStorage.getItem('crmGlobalFontSize') || 'm');
  const [applyRightPanel, setApplyRightPanel] = useState(localStorage.getItem('crmApplyRightPanel') !== 'false');
  const [activeTab, setActiveTab] = useState('tasks');

  useEffect(() => {
    const handleFontChange = () => {
      setFontSize(localStorage.getItem('crmGlobalFontSize') || 'm');
      setApplyRightPanel(localStorage.getItem('crmApplyRightPanel') !== 'false');
    };
    window.addEventListener('fontSizeChanged', handleFontChange);
    return () => window.removeEventListener('fontSizeChanged', handleFontChange);
  }, []);

  const fontClass = applyRightPanel ? getFontSizeClass(fontSize) : 'text-sm';
  if (!selectedDeal) return null;

  // Фильтрация задач для текущей сделки
  const currentDealTasks = dealTasks.filter(task => task.deal_id === selectedDeal.id);

  return (
    <div className="w-full h-full bg-white border-l border-gray-200 flex flex-col">
      {/* HEADER */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Информация о сделке</h2>
        <button className="p-1 hover:bg-gray-100 rounded text-gray-400">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex px-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`tab-btn flex-1 py-2 text-xs font-bold transition text-center border-b-2 ${activeTab === 'tasks'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`}
        >
          Задачи
        </button>
        <button
          onClick={() => setActiveTab('info')}
          className={`tab-btn flex-1 py-2 text-xs font-bold transition text-center border-b-2 ${activeTab === 'info'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`}
        >
          Инфо
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`tab-btn flex-1 py-2 text-xs font-bold transition text-center border-b-2 ${activeTab === 'history'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`}
        >
          История
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="flex-1 overflow-y-auto">
        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <div className="p-4 animate-fadeIn">
            {currentDealTasks.length === 0 ? (
              <div className="text-center text-gray-400 py-8 text-sm">
                <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                Нет задач
              </div>
            ) : (
              <div className="space-y-2">
                {currentDealTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border text-sm ${task.is_done
                        ? 'bg-green-50 border-green-200'
                        : task.in_progress
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-gray-200'
                      }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${task.is_done ? 'bg-green-500 border-green-500' : 'border-gray-300'
                        }`}>
                        {task.is_done && <span className="text-white text-[10px]">✓</span>}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${task.is_done ? 'line-through text-gray-500' : 'text-slate-800'}`}>
                          {task.text}
                        </div>
                        {task.due_date && (
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(task.due_date).toLocaleDateString('ru-RU')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* INFO TAB */}
        {activeTab === 'info' && (
          <div className="p-4 space-y-4 animate-fadeIn">
            <div>
              <div className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Название</div>
              <div className={`font-semibold ${fontClass} text-slate-800`}>{selectedDeal.title}</div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Компания</div>
              <div className={`${fontClass} font-semibold text-slate-800`}>{selectedDeal.company_name || 'Без компании'}</div>
              {selectedDeal.company_inn && (
                <div className="text-xs text-slate-500 font-mono">ИНН: {selectedDeal.company_inn}</div>
              )}
            </div>

            {selectedDeal.value && (
              <div>
                <div className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Бюджет</div>
                <div className="text-lg font-bold text-slate-800">
                  {new Intl.NumberFormat('ru-RU').format(selectedDeal.value)} ₽
                </div>
              </div>
            )}

            <div>
              <div className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Этап сделки</div>
              <select
                className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 text-sm outline-none focus:border-blue-500"
                value={selectedDeal.stage}
                onChange={(e) => updateStage(e.target.value)}
              >
                {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {(selectedDeal.contact_name || selectedDeal.contact_email || selectedDeal.contact_phone) && (
              <>
                <div className="border-t border-gray-100 my-4"></div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">Контактное лицо</div>

                  {/* Аватар и основная информация */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                      {selectedDeal.contact_name ? selectedDeal.contact_name.charAt(0).toUpperCase() : 'К'}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{selectedDeal.contact_name || 'Контакт'}</div>
                      {selectedDeal.contact_email && (
                        <a href={`mailto:${selectedDeal.contact_email}`} className="text-xs text-slate-500 hover:text-blue-600 transition truncate block">
                          {selectedDeal.contact_email}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Кнопки "Позвонить" и "Написать" */}
                  <div className="flex gap-2">
                    {selectedDeal.contact_phone && (
                      <a
                        href={`tel:${selectedDeal.contact_phone}`}
                        className="flex-1 bg-white border border-gray-200 text-slate-700 h-9 rounded-lg flex items-center justify-center gap-2 text-xs font-bold hover:bg-gray-50 transition no-underline shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5" /> Позвонить
                      </a>
                    )}
                    {selectedDeal.contact_email && (
                      <a
                        href={`mailto:${selectedDeal.contact_email}`}
                        className="flex-1 bg-white border border-gray-200 text-slate-700 h-9 rounded-lg flex items-center justify-center gap-2 text-xs font-bold hover:bg-gray-50 transition no-underline shadow-sm"
                      >
                        <Mail className="w-3.5 h-3.5" /> Написать
                      </a>
                    )}
                  </div>

                  {/* Детальная информация о контакте */}
                  <div className="border-t border-gray-100 my-4"></div>
                  <div className="space-y-3">
                    {selectedDeal.contact_phone && (
                      <div>
                        <div className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Телефон</div>
                        <a href={`tel:${selectedDeal.contact_phone}`} className="text-sm font-semibold text-slate-800 hover:text-blue-600 transition truncate block">
                          {selectedDeal.contact_phone}
                        </a>
                      </div>
                    )}
                    {selectedDeal.contact_email && (
                      <div>
                        <div className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Email</div>
                        <a href={`mailto:${selectedDeal.contact_email}`} className="text-sm font-semibold text-slate-800 hover:text-blue-600 transition truncate block">
                          {selectedDeal.contact_email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {selectedDeal.comment && (
              <div className="pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Комментарий</div>
                <div className={`${fontClass} text-slate-600 bg-gray-50 p-2 rounded border border-gray-100`}>
                  {selectedDeal.comment}
                </div>
              </div>
            )}

            <div className="border-t border-gray-100 my-4"></div>

            <div>
              <div className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Дата создания</div>
              <div className={`${fontClass} font-semibold text-slate-800`}>{new Date(selectedDeal.created_at).toLocaleDateString('ru-RU')}</div>
            </div>

            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openDealEdit', { detail: selectedDeal }))}
              className="w-full h-10 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              ✏️ Редактировать сделку
            </button>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="p-4 animate-fadeIn">
            <div className="text-center text-gray-400 py-8 text-sm">
              <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
              История пуста
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrmInfo;
import React, { useState, useEffect } from 'react';
import { FileText, Download, Phone, Mail } from 'lucide-react';
import { getFontSizeClass } from '../constants/fontSizes';

const CrmInfo = ({ selectedDeal, stages, updateStage, openCompanyCard, handleFileUpload }) => {
  const [fontSize, setFontSize] = useState(localStorage.getItem('crmGlobalFontSize') || 'm');
  const [applyRightPanel, setApplyRightPanel] = useState(localStorage.getItem('crmApplyRightPanel') !== 'false');

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

  return (
    <div className="w-full h-full bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
      {/* ИНФОРМАЦИЯ О СДЕЛКЕ */}
      <div className="border-b border-gray-100">
        <div className="h-14 flex items-center px-6">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Информация о сделке</span>
        </div>
        <div className="px-6 pb-5 space-y-4">
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
      </div>

      {/* ФАЙЛЫ */}
      <div className="border-b border-gray-100">
        <div className="h-14 flex items-center justify-between px-6">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Файлы</span>
          <span className="text-xs text-gray-300">{(selectedDeal.files || []).length}/5</span>
        </div>
        <div className="px-6 pb-5">
          <div className="space-y-2 mb-3">{(selectedDeal.files || []).map((f, i) => <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100 text-xs truncate"><FileText size={14} className="text-blue-500 flex-shrink-0" /><span className="truncate flex-1">{f.name}</span></div>)}</div>
          <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition">
            <input type="file" multiple onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            <Download size={20} className="mx-auto text-gray-400 mb-1" />
            <div className="text-xs text-gray-500">Перетащите файлы</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrmInfo;
import React, { useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';
import { getFontSizeClass } from '../constants/fontSizes';

/**
 * CrmInfo Component
 * 
 * Right sidebar showing deal information:
 * - Stage selector
 * - Company card
 * - File attachments
 */
const CrmInfo = ({ selectedDeal, stages, updateStage, openCompanyCard, handleFileUpload }) => {
  // Font size settings
  const [fontSize, setFontSize] = useState(
    localStorage.getItem('crmGlobalFontSize') || 'm'
  );
  const [applyRightPanel, setApplyRightPanel] = useState(
    localStorage.getItem('crmApplyRightPanel') !== 'false'
  );

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
    <div className="w-72 bg-white border-l border-gray-200 flex flex-col flex-shrink-0 overflow-y-auto">

      {/* ========================================================================
          STAGE SELECTOR
      ======================================================================== */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Этап</h3>
        <select
          className={`w-full p-2 bg-white border border-gray-200 rounded ${fontClass} outline-none`}
          value={selectedDeal.stage}
          onChange={(e) => updateStage(e.target.value)}
        >
          {stages.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* ========================================================================
          COMPANY CARD
      ======================================================================== */}
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Компания</h3>
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-2">
          <div className={`font-bold ${fontClass} text-slate-800`}>{selectedDeal.company_name}</div>
          <button
            onClick={() => openCompanyCard(selectedDeal.company_id)}
            className="text-xs text-blue-600 mt-1 hover:underline"
          >
            Открыть карточку
          </button>
        </div>
      </div>

      {/* ========================================================================
          FILE ATTACHMENTS
      ======================================================================== */}
      <div className="p-5">
        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex justify-between">
          Файлы
          <span className="text-gray-300">{(selectedDeal.files || []).length}/5</span>
        </h3>

        {/* Existing files */}
        <div className="space-y-2 mb-3">
          {(selectedDeal.files || []).map((f, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100 text-xs truncate">
              <FileText size={14} className="text-blue-500 flex-shrink-0" />
              <span className="truncate flex-1">{f.name}</span>
            </div>
          ))}
        </div>

        {/* Upload area */}
        <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Download size={20} className="mx-auto text-gray-400 mb-1" />
          <div className="text-xs text-gray-500">Перетащите файлы</div>
        </div>
      </div>
    </div>
  );
};

export default CrmInfo;
import React from 'react';
import { X, Phone, Mail, Globe } from 'lucide-react';

// Модалка создания сделки
export const DealModal = ({ isOpen, onClose, data, onChange, onSave, stages }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold">Новая сделка</h2><button onClick={onClose}><X size={20}/></button></div>
          <div className="space-y-4">
            <div><label className="block text-xs font-bold text-gray-500 mb-1">Название</label><input type="text" value={data.title} onChange={e => onChange({...data, title: e.target.value})} className="w-full p-2 border rounded"/></div>
            <div><label className="block text-xs font-bold text-gray-500 mb-1">Компания</label><input type="text" value={data.company} onChange={e => onChange({...data, company: e.target.value})} className="w-full p-2 border rounded"/></div>
            <div><label className="block text-xs font-bold text-gray-500 mb-1">Этап</label>
                <select value={data.stage} onChange={e => onChange({...data, stage: e.target.value})} className="w-full p-2 border rounded">
                  {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
            <button onClick={onSave} className="w-full bg-blue-600 text-white py-2 rounded font-bold mt-2">Создать</button>
          </div>
      </div>
    </div>
  );
};

// Модалка компании
export const CompanyModal = ({ isOpen, onClose, company, onChange, onSave }) => {
  if (!isOpen || !company) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-slate-800">Карточка компании</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} className="text-gray-500"/></button>
          </div>
          <div className="p-6 grid grid-cols-2 gap-6">
              <div className="col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Название</label><input type="text" value={company.name} onChange={e => onChange({...company, name: e.target.value})} className="w-full p-3 bg-gray-50 border rounded text-lg font-medium"/></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">ИНН</label><input type="text" value={company.inn || ''} onChange={e => onChange({...company, inn: e.target.value})} className="w-full p-3 bg-gray-50 border rounded"/></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Директор</label><input type="text" value={company.director || ''} onChange={e => onChange({...company, director: e.target.value})} className="w-full p-3 bg-gray-50 border rounded"/></div>
              <div className="col-span-2 grid grid-cols-3 gap-4">
                <div><label className="flex gap-1 text-xs font-bold text-gray-500 uppercase mb-1"><Phone size={12}/> Телефон</label><input type="text" value={company.phone || ''} onChange={e => onChange({...company, phone: e.target.value})} className="w-full p-2 bg-gray-50 border rounded"/></div>
                <div><label className="flex gap-1 text-xs font-bold text-gray-500 uppercase mb-1"><Mail size={12}/> Email</label><input type="text" value={company.email || ''} onChange={e => onChange({...company, email: e.target.value})} className="w-full p-2 bg-gray-50 border rounded"/></div>
                <div><label className="flex gap-1 text-xs font-bold text-gray-500 uppercase mb-1"><Globe size={12}/> Сайт</label><input type="text" value={company.website || ''} onChange={e => onChange({...company, website: e.target.value})} className="w-full p-2 bg-gray-50 border rounded"/></div>
              </div>
              <div className="col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Описание</label><textarea rows="3" value={company.description || ''} onChange={e => onChange({...company, description: e.target.value})} className="w-full p-3 bg-gray-50 border rounded"></textarea></div>
          </div>
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={onClose} className="px-5 py-2 text-gray-500 font-medium hover:bg-gray-200 rounded-lg">Отмена</button>
              <button onClick={onSave} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Сохранить</button>
          </div>
        </div>
    </div>
  );
};
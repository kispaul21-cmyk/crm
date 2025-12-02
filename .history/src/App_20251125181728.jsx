import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import {
  LayoutDashboard, CheckSquare, Building2, Users, BarChart3, Settings,
  Search, Paperclip, Send, MoreVertical, ChevronLeft, ChevronRight, UserPlus, FileText
} from 'lucide-react';

const App = () => {
  // --- СОСТОЯНИЯ (ПАМЯТЬ) ---
  const [deals, setDeals] = useState([]); // Список сделок из базы
  const [isLoading, setIsLoading] = useState(true);
  const [isStagesCollapsed, setIsStagesCollapsed] = useState(false);
  const [activeStageId, setActiveStageId] = useState(1); // Текущий этап
  const [activeMenu, setActiveMenu] = useState('crm');
  const [selectedDeal, setSelectedDeal] = useState(null); // Какую сделку мы выбрали (для чата)

  // Временное хранилище сообщений (пока не подключили таблицу messages)
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // --- ЭТАПЫ (Справочник) ---
  const stages = [
    { id: 5, name: 'Доставлено (Финал)', color: 'border-blue-600', textColor: 'text-blue-600' },
    { id: 4, name: 'Продано', color: 'border-green-500', textColor: 'text-green-600' },
    { id: 3, name: 'Договор / Юристы', color: 'border-yellow-400', textColor: 'text-yellow-600' },
    { id: 2, name: 'Переговоры', color: 'border-orange-500', textColor: 'text-orange-600' },
    { id: 1, name: 'Новая заявка', color: 'border-red-500', textColor: 'text-red-500' },
  ];

  // --- ЗАГРУЗКА ПРИ СТАРТЕ ---
  useEffect(() => { fetchDeals(); }, []);

  async function fetchDeals() {
    setIsLoading(true);
    // Скачиваем сделки из Supabase
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error("Ошибка загрузки:", error);
    else setDeals(data || []);

    setIsLoading(false);
  }

  // --- СОЗДАНИЕ СДЕЛКИ ---
  async function createDeal() {
    const title = prompt("Название новой сделки:");
    if (!title) return;

    const company = prompt("Название компании:");
    if (!company) return;

    const { error } = await supabase
      .from('deals')
      .insert([{ title, company, stage: 1 }]);

    if (error) {
      alert("Ошибка! Проверь RLS в Supabase.");
    } else {
      fetchDeals(); // Обновляем список
      setActiveStageId(1); // Идем на первый этап
    }
  }

  // --- ОТПРАВКА СООБЩЕНИЯ (Пока локально) ---
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedDeal) return;

    const msg
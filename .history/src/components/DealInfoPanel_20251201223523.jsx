import React, { useState, useEffect } from 'react';
import { X, Phone, Mail, FileText, CheckSquare, Building2, Users, TrendingUp, Calendar, Download, Eye, Plus, MessageSquare, Edit2, Trash2, ChevronRight, ChevronDown, Clock, User, Flame, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../supabase';

const DealInfoPanel = ({
    deal,
    onClose,
    dealTasks = [],
    addTask,
    toggleTask,
    setTaskInProgress,
    deleteTask,
    toggleSubtask
}) => {
    const [activeTab, setActiveTab] = useState('contacts');
    const [newTaskText, setNewTaskText] = useState('');
    const [taskCompletionComment, setTaskCompletionComment] = useState('');
    const [commentingTaskId, setCommentingTaskId] = useState(null);
    const [expandedTasks, setExpandedTasks] = useState(new Set());
    const [taskFilter, setTaskFilter] = useState('all');

    // Состояние для добавления контакта
    const [isAddingContact, setIsAddingContact] = useState(false);
    const [newContact, setNewContact] = useState({
        name: '',
        phone: '',
        email: '',
        position: ''
    });

    // Состояние для редактирования контакта
    const [editingContactId, setEditingContactId] = useState(null);
    const [editContact, setEditContact] = useState({
        name: '',
        phone: '',
        email: '',
        position: ''
    });

    // Состояние для добавления подзадачи
    const [addingSubtaskForTask, setAddingSubtaskForTask] = useState(null);
    const [newSubtaskText, setNewSubtaskText] = useState('');

    const handleAddTask = async () => {
        if (!newTaskText.trim() || !deal) return;

        await addTask(newTaskText, deal.id);
        setNewTaskText('');
    };

    const handleToggleTask = async (task) => {
        if (!task.is_done && commentingTaskId !== task.id) {
            // Если завершаем задачу - показываем поле комментария
            setCommentingTaskId(task.id);
            return;
        }

        // Если есть комментарий или просто переключаем обратно
        await toggleTask(task, commentingTaskId === task.id ? taskCompletionComment : null);
        setCommentingTaskId(null);
        setTaskCompletionComment('');
    };

    const handleToggleSubtask = async (task, subtaskIndex) => {
        await toggleSubtask(task, subtaskIndex);
    };

    const toggleExpand = (taskId) => {
        const newExpanded = new Set(expandedTasks);
        if (newExpanded.has(taskId)) {
            newExpanded.delete(taskId);
        } else {
            newExpanded.add(taskId);
        }
        setExpandedTasks(newExpanded);
    };

    const handleAddSubtask = async (task) => {
        if (!newSubtaskText.trim()) return;

        const currentSubtasks = task.subtasks || [];
        const newSubtasks = [...currentSubtasks, { text: newSubtaskText.trim(), is_done: false }];

        const { error } = await supabase
            .from('tasks')
            .update({ subtasks: newSubtasks })
            .eq('id', task.id);

        if (!error) {
            task.subtasks = newSubtasks;
            setNewSubtaskText('');
            setAddingSubtaskForTask(null);
        }
    };

    const handleAddContact = async () => {
        if (!newContact.name.trim()) {
            alert('Введите имя контакта');
            return;
        }

        const currentAdditional = deal.additional_contacts || [];
        const newAdditional = [...currentAdditional, {
            name: newContact.name,
            phone: newContact.phone || null,
            email: newContact.email || null,
            position: newContact.position || null
        }];

        const { error } = await supabase
            .from('deals')
            .update({ additional_contacts: newAdditional })
            .eq('id', deal.id);

        if (!error) {
            deal.additional_contacts = newAdditional;
            loadContacts();
            setNewContact({ name: '', phone: '', email: '', position: '' });
            setIsAddingContact(false);
        } else {
            alert('Ошибка сохранения: ' + error.message);
            console.error('Ошибка:', error);
        }
    };

    const handleEditContact = async () => {
        if (!editContact.name.trim()) {
            alert('Введите имя контакта');
            return;
        }

        if (editingContactId === 'main') {
            const { error } = await supabase
                .from('deals')
                .update({
                    contact_name: editContact.name,
                    contact_phone: editContact.phone || null,
                    contact_email: editContact.email || null,
                    contact_position: editContact.position || null
                })
                .eq('id', deal.id);

            if (!error) {
                deal.contact_name = editContact.name;
                deal.contact_phone = editContact.phone;
                deal.contact_email = editContact.email;
                deal.contact_position = editContact.position;
                loadContacts();
                setEditingContactId(null);
            } else {
                alert('Ошибка сохранения: ' + error.message);
            }
        } else {
            const index = parseInt(editingContactId.split('-')[1]);
            const currentAdditional = [...(deal.additional_contacts || [])];
            currentAdditional[index] = {
                name: editContact.name,
                phone: editContact.phone || null,
                email: editContact.email || null,
                position: editContact.position || null
            };

            const { error } = await supabase
                .from('deals')
                .update({ additional_contacts: currentAdditional })
                .eq('id', deal.id);

            if (!error) {
                deal.additional_contacts = currentAdditional;
                loadContacts();
                setEditingContactId(null);
            } else {
                alert('Ошибка сохранения: ' + error.message);
            }
        }
    };

    const handleDeleteContact = async (contactId) => {
        if (!confirm('Удалить контакт?')) return;

        if (contactId === 'main') {
            alert('Основной контакт можно только редактировать');
            return;
        }

        const index = parseInt(contactId.split('-')[1]);
        const currentAdditional = [...(deal.additional_contacts || [])];
        currentAdditional.splice(index, 1);

        const { error } = await supabase
            .from('deals')
            .update({ additional_contacts: currentAdditional })
            .eq('id', deal.id);

        if (!error) {
            deal.additional_contacts = currentAdditional;
            loadContacts();
        } else {
            alert('Ошибка удаления: ' + error.message);
        }
    };

    const [contacts, setContacts] = useState([]);

    useEffect(() => {
        if (deal?.id) {
            loadContacts();
        }
    }, [deal?.id, deal?.contact_name, deal?.contact_phone, deal?.contact_email, deal?.contact_position, deal?.additional_contacts]);

    const loadContacts = () => {
        const allContacts = [];

        if (deal.contact_name || deal.contact_phone || deal.contact_email) {
            allContacts.push({
                id: 'main',
                name: deal.contact_name || 'Контакт',
                phone: deal.contact_phone,
                email: deal.contact_email,
                position: deal.contact_position,
                isPrimary: true,
                isMain: true
            });
        }

        if (deal.additional_contacts && Array.isArray(deal.additional_contacts)) {
            deal.additional_contacts.forEach((contact, index) => {
                allContacts.push({
                    id: `additional-${index}`,
                    ...contact,
                    isPrimary: false,
                    isMain: false
                });
            });
        }

        setContacts(allContacts);
    };

    const mockCalls = [];
    const mockMeetings = [];
    const mockFiles = [];

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const formatDuration = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m} мин ${s} сек`;
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formatDateTime = (d) => new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    // Фильтрация задач
    const filteredTasks = dealTasks.filter(task => {
        if (taskFilter === 'active') return !task.is_done;
        if (taskFilter === 'completed') return task.is_done;
        return true;
    });

    return (
        <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute top-0 left-0 right-0 bg-white rounded-b-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
            style={{ height: '85vh' }}
        >
            {/* ПОЛОСКА-ИНДИКАТОР */}
            <div
                className="flex-shrink-0 flex items-center justify-center py-3 cursor-pointer hover:bg-blue-50 transition-colors duration-200"
                onClick={onClose}
            >
                <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>

            {/* Шапка */}
            <div className="flex-shrink-0 bg-white border-b border-gray-200">
                <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg shadow-blue-600/20">
                            {deal.company_name ? deal.company_name[0].toUpperCase() : deal.title[0].toUpperCase()}
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 text-center mb-1">
                            {deal.company_name || deal.title}
                        </h2>
                        {deal.inn && <p className="text-base text-gray-500 mb-3 font-mono">ИНН: {deal.inn}</p>}
                        <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-full border border-emerald-100">
                            🟢 Сделка активна
                        </span>
                    </div>
                </div>

                {/* Быстрые действия */}
                <div className="grid grid-cols-4 gap-4 px-8 pb-6">
                    <button
                        onClick={() => setActiveTab('contacts')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition border ${activeTab === 'contacts'
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200'
                            }`}
                    >
                        <Users size={24} />
                        <span className="text-sm font-bold">Контакты</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition border ${activeTab === 'tasks'
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200'
                            }`}
                    >
                        <CheckSquare size={24} />
                        <span className="text-sm font-bold">Задачи</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition border ${activeTab === 'history'
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200'
                            }`}
                    >
                        <Clock size={24} />
                        <span className="text-sm font-bold">История</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('files')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition border ${activeTab === 'files'
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200'
                            }`}
                    >
                        <FileText size={24} />
                        <span className="text-sm font-bold">Файлы</span>
                    </button>
                </div>
            </div>

            {/* Контент табов */}
            <div className="flex-1 overflow-y-auto">
                {/* ===== ТАБ КОНТАКТЫ ===== */}
                {activeTab === 'contacts' && (
                    <div className="p-6 space-y-3">
                        {/* Кнопка добавления контакта */}
                        {isAddingContact ? (
                            <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                                <div className="grid grid-cols-4 gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={newContact.name}
                                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                        placeholder="Имя *"
                                        className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                        type="tel"
                                        value={newContact.phone}
                                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                        placeholder="Телефон"
                                        className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                        type="email"
                                        value={newContact.email}
                                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                                        placeholder="Email"
                                        className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                        type="text"
                                        value={newContact.position}
                                        onChange={(e) => setNewContact({ ...newContact, position: e.target.value })}
                                        placeholder="Должность"
                                        className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAddContact}
                                        className="flex-1 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
                                    >
                                        Сохранить
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsAddingContact(false);
                                            setNewContact({ name: '', phone: '', email: '', position: '' });
                                        }}
                                        className="flex-1 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300"
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAddingContact(true)}
                                className="w-full py-2 text-sm text-blue-600 font-medium border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                            >
                                + Добавить контакт
                            </button>
                        )}

                        {/* Список контактов */}
                        <div className="space-y-2">
                            {contacts.length > 0 ? (
                                contacts.map(c => (
                                    <div key={c.id}>
                                        {editingContactId === c.id ? (
                                            <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                                                <div className="grid grid-cols-4 gap-2 mb-2">
                                                    <input
                                                        type="text"
                                                        value={editContact.name}
                                                        onChange={(e) => setEditContact({ ...editContact, name: e.target.value })}
                                                        placeholder="Имя *"
                                                        className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <input
                                                        type="tel"
                                                        value={editContact.phone}
                                                        onChange={(e) => setEditContact({ ...editContact, phone: e.target.value })}
                                                        placeholder="Телефон"
                                                        className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <input
                                                        type="email"
                                                        value={editContact.email}
                                                        onChange={(e) => setEditContact({ ...editContact, email: e.target.value })}
                                                        placeholder="Email"
                                                        className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={editContact.position}
                                                        onChange={(e) => setEditContact({ ...editContact, position: e.target.value })}
                                                        placeholder="Должность"
                                                        className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleEditContact}
                                                        className="flex-1 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
                                                    >
                                                        Сохранить
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingContactId(null)}
                                                        className="flex-1 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300"
                                                    >
                                                        Отмена
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={`p-2 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2 ${c.isPrimary ? 'font-semibold' : ''}`}>
                                                <div className="grid grid-cols-4 gap-2 items-center flex-1 pr-2">
                                                    {/* Имя с аватаром */}
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                                                            {c.name[0].toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-slate-800 text-sm break-words">{c.name}</div>
                                                        </div>
                                                    </div>

                                                    {/* Телефон */}
                                                    <div className="min-w-0">
                                                        {c.phone ? (
                                                            <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm truncate">
                                                                <Phone size={15} className="flex-shrink-0" />
                                                                <span className="truncate">{c.phone}</span>
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">—</span>
                                                        )}
                                                    </div>

                                                    {/* Email */}
                                                    <div className="min-w-0">
                                                        {c.email ? (
                                                            <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm truncate">
                                                                <Mail size={15} className="flex-shrink-0" />
                                                                <span className="truncate">{c.email}</span>
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">—</span>
                                                        )}
                                                    </div>

                                                    {/* Должность */}
                                                    <div className="text-gray-600 text-sm break-words">
                                                        {c.position || '—'}
                                                    </div>
                                                </div>

                                                {/* Кнопки действий */}
                                                <div className="flex gap-1 flex-shrink-0">
                                                    <button
                                                        onClick={() => {
                                                            setEditingContactId(c.id);
                                                            setEditContact({
                                                                name: c.name,
                                                                phone: c.phone || '',
                                                                email: c.email || '',
                                                                position: c.position || ''
                                                            });
                                                        }}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                        title="Редактировать"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    {!c.isMain ? (
                                                        <button
                                                            onClick={() => handleDeleteContact(c.id)}
                                                            className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                            title="Удалить"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    ) : (
                                                        <div className="w-8 h-8"></div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <Users size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Нет контактов</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ===== ТАБ ЗАДАЧИ ===== */}
                {activeTab === 'tasks' && (
                    <div className="p-6 space-y-4">
                        {/* Тулбар */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <h3 className="text-lg font-bold text-slate-800">Задачи по сделке</h3>
                                <span className="text-sm text-gray-500">
                                    {filteredTasks.filter(t => !t.is_done).length} активных
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setTaskFilter('all')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${taskFilter === 'all'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    Все
                                </button>
                                <button
                                    onClick={() => setTaskFilter('active')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${taskFilter === 'active'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    Активные
                                </button>
                                <button
                                    onClick={() => setTaskFilter('completed')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${taskFilter === 'completed'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    Выполненные
                                </button>
                            </div>
                        </div>

                        {/* Поле добавления задачи */}
                        <div className="flex gap-2 mb-6">
                            <input
                                type="text"
                                value={newTaskText}
                                onChange={(e) => setNewTaskText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                                placeholder="Новая задача..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleAddTask}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        {/* Список задач */}
                        {filteredTasks.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                Нет задач
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredTasks.map(task => {
                                    const isExpanded = expandedTasks.has(task.id);
                                    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
                                    const completedSubtasks = hasSubtasks
                                        ? task.subtasks.filter(s => s.is_done).length
                                        : 0;
                                    const totalSubtasks = hasSubtasks ? task.subtasks.length : 0;
                                    const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

                                    return (
                                        <div
                                            key={task.id}
                                            className={`bg-white border border-gray-200 rounded-xl overflow-hidden transition-all ${task.is_done ? 'opacity-60' : ''
                                                } ${isExpanded ? 'shadow-lg' : 'shadow-sm'}`}
                                        >
                                            {/* Заголовок задачи */}
                                            <div
                                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition"
                                                onClick={() => toggleExpand(task.id)}
                                            >
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div
                                                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition ${task.is_done
                                                            ? 'bg-green-500 border-green-500'
                                                            : 'border-gray-300 hover:border-green-500'
                                                            }`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleTask(task);
                                                        }}
                                                    >
                                                        {task.is_done && (
                                                            <CheckSquare size={14} className="text-white" />
                                                        )}
                                                    </div>
                                                    <span className={`font-medium text-slate-800 ${task.is_done ? 'line-through' : ''}`}>
                                                        {task.text}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {task.due_date && (
                                                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs">
                                                            <Clock size={12} />
                                                            {new Date(task.due_date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    )}
                                                    {task.in_progress && (
                                                        <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-600 rounded-lg text-xs">
                                                            <Flame size={12} />
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteTask(task.id);
                                                        }}
                                                        className="text-gray-400 hover:text-red-500 transition"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Тело задачи (раскрывается) */}
                                            {isExpanded && (
                                                <div className="border-t border-gray-100 p-4">
                                                    <div className="grid grid-cols-2 gap-6">
                                                        {/* Левая колонка - Чек-лист */}
                                                        <div>
                                                            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                                                {/* Заголовок чек-листа */}
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm font-semibold text-slate-700">Чек-лист</span>
                                                                    <span className="text-xs text-gray-500">
                                                                        {completedSubtasks} из {totalSubtasks}
                                                                    </span>
                                                                </div>

                                                                {/* Прогресс-бар */}
                                                                {hasSubtasks && (
                                                                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                                                                            style={{ width: `${progress}%` }}
                                                                        />
                                                                    </div>
                                                                )}

                                                                {/* Список подзадач */}
                                                                {hasSubtasks && (
                                                                    <div className="space-y-2">
                                                                        {task.subtasks.map((subtask, idx) => (
                                                                            <div
                                                                                key={idx}
                                                                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white transition cursor-pointer"
                                                                                onClick={() => handleToggleSubtask(task, idx)}
                                                                            >
                                                                                <div
                                                                                    className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${subtask.is_done || task.is_done
                                                                                        ? 'bg-blue-500 border-blue-500'
                                                                                        : 'border-gray-300'
                                                                                        }`}
                                                                                >
                                                                                    {(subtask.is_done || task.is_done) && (
                                                                                        <CheckSquare size={10} className="text-white" />
                                                                                    )}
                                                                                </div>
                                                                                <span
                                                                                    className={`text-sm ${subtask.is_done || task.is_done
                                                                                        ? 'text-gray-400 line-through'
                                                                                        : 'text-slate-700'
                                                                                        }`}
                                                                                >
                                                                                    {subtask.text}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {/* Форма добавления подзадачи */}
                                                                {addingSubtaskForTask === task.id ? (
                                                                    <div className="flex gap-2">
                                                                        <input
                                                                            type="text"
                                                                            value={newSubtaskText}
                                                                            onChange={(e) => setNewSubtaskText(e.target.value)}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') {
                                                                                    handleAddSubtask(task);
                                                                                } else if (e.key === 'Escape') {
                                                                                    setAddingSubtaskForTask(null);
                                                                                    setNewSubtaskText('');
                                                                                }
                                                                            }}
                                                                            placeholder="Введите название и нажмите Enter"
                                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                            autoFocus
                                                                        />
                                                                        <button
                                                                            onClick={() => {
                                                                                setAddingSubtaskForTask(null);
                                                                                setNewSubtaskText('');
                                                                            }}
                                                                            className="text-gray-400 hover:text-red-500"
                                                                        >
                                                                            <X size={18} />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => setAddingSubtaskForTask(task.id)}
                                                                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                                    >
                                                                        <Plus size={14} />
                                                                        Добавить пункт
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Правая колонка - Настройки */}
                                                        <div className="space-y-4">
                                                            {/* Срок исполнения и Исполнитель */}
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="text-xs font-semibold text-gray-500 mb-2 block">
                                                                        Срок исполнения
                                                                    </label>
                                                                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                                                        <Calendar size={14} className="text-gray-400" />
                                                                        <span className="text-sm text-slate-700">
                                                                            {task.due_date
                                                                                ? new Date(task.due_date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                                                                                : 'Не указан'
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="text-xs font-semibold text-gray-500 mb-2 block">
                                                                        Исполнитель
                                                                    </label>
                                                                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                                                        <User size={14} className="text-gray-400" />
                                                                        <span className="text-sm text-slate-700">
                                                                            {task.assignee || 'Не назначен'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Блок файлов */}
                                                            <div>
                                                                <label className="text-xs font-semibold text-gray-500 mb-2 block">
                                                                    Вложения
                                                                </label>
                                                                {task.files && task.files.length > 0 ? (
                                                                    <div className="space-y-2 mb-3">
                                                                        {task.files.map((file, idx) => (
                                                                            <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                                                                                <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                                                                                    <FileText size={16} className="text-red-600" />
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="text-sm font-medium text-slate-700 truncate">
                                                                                        {file.name}
                                                                                    </div>
                                                                                    <div className="text-xs text-gray-500">
                                                                                        {file.size}
                                                                                    </div>
                                                                                </div>
                                                                                <button className="text-gray-400 hover:text-red-500">
                                                                                    <X size={14} />
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : null}
                                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer">
                                                                    <Upload size={20} className="mx-auto text-gray-400 mb-1" />
                                                                    <div className="text-xs text-gray-500">Прикрепить файл</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ===== ТАБ ИСТОРИЯ ===== */}
                {activeTab === 'history' && (
                    <div className="p-6 space-y-4">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">История активности</h3>
                        <div className="text-center py-12 text-gray-400">
                            История пока не реализована
                        </div>
                    </div>
                )}

                {/* ===== ТАБ ФАЙЛЫ ===== */}
                {activeTab === 'files' && (
                    <div className="p-6 space-y-4">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Файлы</h3>
                        <div className="text-center py-12 text-gray-400">
                            Файлы пока не реализованы
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default DealInfoPanel;
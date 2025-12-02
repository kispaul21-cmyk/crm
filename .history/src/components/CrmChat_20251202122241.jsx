import React, { useRef, useEffect, useState } from 'react';
import { MoreVertical, Smile, Send, Building2, X, CheckSquare, Trash2, ListChecks, Paperclip } from 'lucide-react';
import { getFontSizeClass, getEmojiMultiplier } from '../constants/fontSizes';
import DealInfoPanel from './DealInfoPanel';
import DealOverlayPanel from './DealOverlayPanel';
import { AnimatePresence, motion } from 'framer-motion';

// Message color mapping (10 colors)
const MESSAGE_COLOR_MAP = {
    red: { bg: 'bg-red-600', text: 'text-white', timeText: 'text-red-100' },
    orange: { bg: 'bg-orange-600', text: 'text-white', timeText: 'text-orange-100' },
    amber: { bg: 'bg-amber-600', text: 'text-white', timeText: 'text-amber-100' },
    yellow: { bg: 'bg-yellow-500', text: 'text-white', timeText: 'text-yellow-100' },
    green: { bg: 'bg-green-600', text: 'text-white', timeText: 'text-green-100' },
    teal: { bg: 'bg-teal-600', text: 'text-white', timeText: 'text-teal-100' },
    blue: { bg: 'bg-blue-600', text: 'text-white', timeText: 'text-blue-100' },
    indigo: { bg: 'bg-indigo-600', text: 'text-white', timeText: 'text-indigo-100' },
    purple: { bg: 'bg-purple-600', text: 'text-white', timeText: 'text-purple-100' },
    pink: { bg: 'bg-pink-600', text: 'text-white', timeText: 'text-pink-100' },
};

const CrmChat = ({
    selectedDeal,
    chatStream,
    dealTasks,
    quickTaskText,
    setQuickTaskText,
    addTask,
    toggleTask,
    setTaskInProgress,
    editTask,
    deleteTask,
    newMessage,
    setNewMessage,
    sendMessage,
    replyTo,
    setReplyTo,
    openCompanyCard,
    editMessage,
    deleteMessage,
    forwardMessage,
}) => {
    // UI state for emoji picker and file attachment
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef(null);

    // Message editing and actions
    const [editingMessage, setEditingMessage] = useState(null);
    const [editText, setEditText] = useState('');
    const [forwardingMessage, setForwardingMessage] = useState(null);

    // Task editing
    const [editingTask, setEditingTask] = useState(null);
    const [editTaskText, setEditTaskText] = useState('');

    // Message selection (like Telegram)
    const [selectedMessages, setSelectedMessages] = useState([]);

    // Message colors from localStorage
    const [myMessageColor, setMyMessageColor] = useState(
        localStorage.getItem('myMessageColor') || 'blue'
    );
    const [incomingMessageColor, setIncomingMessageColor] = useState(
        localStorage.getItem('incomingMessageColor') || 'purple'
    );

    // Font size settings - Global for chat header and tasks
    const [fontSize, setFontSize] = useState(
        localStorage.getItem('crmGlobalFontSize') || 'm'
    );
    const [applyChatHeader, setApplyChatHeader] = useState(
        localStorage.getItem('crmApplyChatHeader') !== 'false'
    );

    // Font size settings - Chat messages
    const [chatIncomingFontSize, setChatIncomingFontSize] = useState(
        localStorage.getItem('chatIncomingFontSize') || 'm'
    );
    const [chatOutgoingFontSize, setChatOutgoingFontSize] = useState(
        localStorage.getItem('chatOutgoingFontSize') || 'm'
    );
    const [chatEmojiSize, setChatEmojiSize] = useState(
        localStorage.getItem('chatEmojiSize') || 'm'
    );

    // Info Panel state
    const [showInfoPanel, setShowInfoPanel] = useState(false);

    // Overlay Panel state
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);

    // Listen for color and font changes from settings
    useEffect(() => {
        const handleColorChange = () => {
            setMyMessageColor(localStorage.getItem('myMessageColor') || 'blue');
            setIncomingMessageColor(localStorage.getItem('incomingMessageColor') || 'purple');
        };

        const handleFontChange = () => {
            setFontSize(localStorage.getItem('crmGlobalFontSize') || 'm');
            setApplyChatHeader(localStorage.getItem('crmApplyChatHeader') !== 'false');
            setChatIncomingFontSize(localStorage.getItem('chatIncomingFontSize') || 'm');
            setChatOutgoingFontSize(localStorage.getItem('chatOutgoingFontSize') || 'm');
            setChatEmojiSize(localStorage.getItem('chatEmojiSize') || 'm');
        };

        window.addEventListener('messageColorsChanged', handleColorChange);
        window.addEventListener('fontSizeChanged', handleFontChange);

        return () => {
            window.removeEventListener('messageColorsChanged', handleColorChange);
            window.removeEventListener('fontSizeChanged', handleFontChange);
        };
    }, []);

    // Font classes
    const headerFontClass = applyChatHeader ? getFontSizeClass(fontSize) : 'text-base';
    const taskFontClass = applyChatHeader ? getFontSizeClass(fontSize) : 'text-sm';
    const incomingFontClass = getFontSizeClass(chatIncomingFontSize);
    const outgoingFontClass = getFontSizeClass(chatOutgoingFontSize);
    const emojiMultiplier = getEmojiMultiplier(chatEmojiSize);

    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        // Скроллим только контейнер чата, а не весь viewport
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatStream]);

    // Сбрасываем высоту textarea когда newMessage очищается
    useEffect(() => {
        if (newMessage === '' && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    }, [newMessage]);

    if (!selectedDeal) {
        return <div className="flex-1 flex items-center justify-center text-gray-400 bg-[#eef1f5]">Выберите сделку</div>;
    }

    // Без сортировки - задачи не будут дергаться при переключении
    const topTasks = dealTasks.slice(0, 5);

    // Get color classes
    const getMyMessageColors = () => MESSAGE_COLOR_MAP[myMessageColor] || MESSAGE_COLOR_MAP.blue;
    const getIncomingMessageColors = () => MESSAGE_COLOR_MAP[incomingMessageColor] || MESSAGE_COLOR_MAP.purple;

    return (
        <div className="flex-1 flex flex-col bg-[#eef1f5] overflow-hidden relative">
            {/* Header - ФИКСИРОВАННЫЙ - h-16 как в концепте */}
            <div
                className="bg-white border-b border-gray-100 flex-shrink-0"
            >
                <div className="h-16 flex items-center justify-between px-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-md shadow-blue-600/20">
                            D
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-slate-800 leading-tight">{selectedDeal.title}</h1>
                            <div className="text-xs text-slate-500 font-medium">
                                {selectedDeal.company_name || 'Без компании'}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); /* disabled opening info panel from this button */ }}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Меню действий"
                        title="Меню"
                    >
                        <MoreVertical size={20} className="text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Chat Stream - ТОЛЬКО СООБЩЕНИЯ */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-3" onClick={() => selectedMessages.length > 0 && setSelectedMessages([])}>
                {/* Панель действий для выделенных сообщений */}
                {selectedMessages.length > 0 && (
                    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-xl z-50 flex items-center gap-4">
                        <span className="font-semibold">{selectedMessages.length} выбрано</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                // Пересылка выбранных
                                selectedMessages.forEach(id => {
                                    const msg = chatStream.find(m => m.id === id);
                                    if (msg) setForwardingMessage(msg);
                                });
                                setSelectedMessages([]);
                            }}
                            className="hover:bg-blue-700 px-3 py-1 rounded-lg transition"
                        >
                            📤 Переслать
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                // Удаление выбранных
                                if (confirm(`Удалить ${selectedMessages.length} сообщений?`)) {
                                    selectedMessages.forEach(id => deleteMessage(id));
                                    setSelectedMessages([]);
                                }
                            }}
                            className="hover:bg-blue-700 px-3 py-1 rounded-lg transition"
                        >
                            🗑️ Удалить
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMessages([]);
                            }}
                            className="hover:bg-blue-700 px-3 py-1 rounded-lg transition"
                        >
                            ✖️ Отменить
                        </button>
                    </div>
                )}

                {chatStream.length === 0 && (
                    <div className="text-center text-gray-400 mt-10 text-sm">История пуста</div>
                )}
                {chatStream.map(item => {
                    if (item.type === 'task') {
                        return (
                            <TaskBubble
                                key={item.id}
                                task={item}
                                toggleTask={toggleTask}
                                deleteTask={deleteTask}
                                taskFontClass={taskFontClass}
                                setEditingTask={setEditingTask}
                                setEditTaskText={setEditTaskText}
                            />
                        );
                    }

                    const myColors = getMyMessageColors();
                    const incomingColors = getIncomingMessageColors();
                    const colors = item.is_me ? myColors : incomingColors;
                    const messageFontClass = item.is_me ? outgoingFontClass : incomingFontClass;

                    return (
                        <div key={item.id} className={`flex gap-2 group mb-1 ${item.is_me ? 'flex-row-reverse' : ''}`}>
                            {!item.is_me && (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${incomingColors.bg}`}>
                                    К
                                </div>
                            )}
                            <div className="flex flex-col max-w-[70%] min-w-0">
                                {item.reply_to_id && (
                                    <div className="text-[10px] mb-1 p-1 border-l-2 border-gray-300 text-gray-500">Ответ</div>
                                )}
                                {item.text.startsWith('⚡') ? (
                                    <div className="bg-white border border-gray-200 text-slate-600 px-3 py-2 rounded-lg shadow-sm">
                                        <div className="flex items-center justify-center gap-2 mb-2 pb-2 border-b border-gray-200">
                                            <span style={{ fontSize: `${18 * emojiMultiplier}px` }}>⚡</span>
                                            <span className="text-sm font-bold text-slate-700">Задача</span>
                                        </div>
                                        <div className="text-sm break-words">
                                            {item.text.replace(/^⚡\s*Задача:\s*/, '')}
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className={`px-2.5 py-1.5 rounded-lg shadow-sm ${colors.bg} ${colors.text} ${item.is_me ? 'rounded-tr-sm' : 'rounded-tl-sm'} ${messageFontClass} ${selectedMessages.includes(item.id) ? 'ring-2 ring-blue-500' : ''} cursor-context-menu break-words overflow-wrap-anywhere`}
                                        onClick={(e) => {
                                            if (selectedMessages.length > 0) {
                                                e.stopPropagation();
                                                if (selectedMessages.includes(item.id)) {
                                                    setSelectedMessages(selectedMessages.filter(id => id !== item.id));
                                                } else {
                                                    setSelectedMessages([...selectedMessages, item.id]);
                                                }
                                            }
                                        }}
                                        onContextMenu={(e) => {
                                            e.preventDefault();

                                            // Закрываем все существующие меню
                                            document.querySelectorAll('.context-menu').forEach(m => m.remove());

                                            const menu = document.createElement('div');
                                            menu.className = 'context-menu fixed bg-white border border-gray-100 rounded-xl shadow-2xl z-[100] py-2 w-[180px]';

                                            // Позиционируем меню с учетом границ экрана
                                            const menuWidth = 200;
                                            const menuHeight = 200;
                                            let left = e.clientX;
                                            let top = e.clientY;

                                            if (left + menuWidth > window.innerWidth) {
                                                left = window.innerWidth - menuWidth - 10;
                                            }
                                            if (top + menuHeight > window.innerHeight) {
                                                top = window.innerHeight - menuHeight - 10;
                                            }

                                            menu.style.left = `${left}px`;
                                            menu.style.top = `${top}px`;

                                            const buttons = [
                                                { label: '💬 Ответить', action: () => setReplyTo(item), show: true },
                                                { label: '✏️ Редактировать', action: () => { setEditingMessage(item); setEditText(item.text); }, show: item.is_me },
                                                { label: '🗑️ Удалить', action: () => deleteMessage(item.id), show: item.is_me },
                                                { label: '📋 Цитировать', action: () => { setNewMessage(`> ${item.text}\n\n`); document.querySelector('textarea')?.focus(); }, show: true },
                                                { label: '📤 Переслать', action: () => setForwardingMessage(item), show: true },
                                                { label: '☑️ Выбрать', action: () => setSelectedMessages([item.id]), show: true }
                                            ];

                                            buttons.filter(btn => btn.show).forEach((btn, index) => {
                                                const button = document.createElement('button');
                                                const isDelete = btn.label.includes('Удалить');
                                                button.className = `w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm font-medium text-slate-700 transition-all duration-150 whitespace-nowrap rounded-lg mx-1 ${isDelete ? 'text-red-600 hover:bg-red-50' : ''}`;
                                                button.textContent = btn.label;
                                                button.onclick = () => {
                                                    btn.action();
                                                    menu.remove();
                                                };
                                                menu.appendChild(button);
                                            });

                                            document.body.appendChild(menu);
                                            const closeMenu = (event) => {
                                                if (!menu.contains(event.target)) {
                                                    menu.remove();
                                                    document.removeEventListener('click', closeMenu);
                                                }
                                            };
                                            setTimeout(() => document.addEventListener('click', closeMenu), 0);
                                        }}
                                    >
                                        <div className="break-words">{item.text}</div>
                                    </div>
                                )}
                                {/* Время вне облака */}
                                <div className={`text-[10px] text-gray-400 mt-0.5 ${item.is_me ? 'text-right' : 'text-left'}`}>
                                    {new Date(item.created_at).toLocaleTimeString().slice(0, 5)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Message Input - СТРОГО ФИКСИРОВАННЫЙ ФУТЕР */}
            <div className="border-t border-gray-200 bg-white flex-shrink-0">
                <div className="p-4 max-h-[40vh] overflow-y-auto">
                    {/* Модальное окно редактирования */}
                    {editingMessage && (
                        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-yellow-700">✏️ Редактирование сообщения</span>
                                <button onClick={() => setEditingMessage(null)} className="text-gray-400 hover:text-red-500">
                                    <X size={14} />
                                </button>
                            </div>
                            <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full p-2 border border-yellow-300 rounded-lg text-sm resize-none"
                                rows={3}
                            />
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => {
                                        editMessage(editingMessage.id, editText);
                                        setEditingMessage(null);
                                    }}
                                    className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                >
                                    💾 Сохранить
                                </button>
                                <button
                                    onClick={() => setEditingMessage(null)}
                                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    )}

                    {replyTo && (
                        <div className="flex items-center gap-2 text-xs mb-2 p-2 bg-gray-50 rounded border border-gray-100">
                            <span className="text-gray-500">Ответ на:</span>
                            <span className="text-slate-600 truncate flex-1">{replyTo.text}</span>
                            <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-red-500">
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    {/* Превью задачи при вводе с # */}
                    {newMessage.startsWith('#') && newMessage.trim().length > 1 && (
                        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg max-h-48 overflow-y-auto">
                            <div className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1">
                                <ListChecks size={12} />
                                Превью задачи:
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 font-semibold text-slate-800">
                                    <div className="w-4 h-4 rounded border border-gray-300 bg-white flex-shrink-0" />
                                    <span>{newMessage.replace('#', '').trim()}</span>
                                </div>
                            </div>
                            <div className="text-xs text-blue-600 mt-2">
                                💡 Enter для отправки
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3 relative min-h-[56px]">
                        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-gray-400 hover:text-blue-600 p-1 self-end">
                            <Smile size={20} />
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-blue-600 p-1 self-end">
                            <Paperclip size={20} />
                        </button>
                        <input ref={fileInputRef} type="file" multiple className="hidden" />
                        {showEmojiPicker && (
                            <div className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-lg p-3 shadow-xl z-50 grid grid-cols-8 gap-1 max-h-64 overflow-y-auto">
                                {['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤗', '🤭', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '😴', '👍', '👎', '👌', '✌️', '🤞', '🤝', '👏', '🙌', '💪', '🔥', '✅', '❌', '⚡', '💡', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '⭐', '🌟', '✨', '💫', '💥', '💯', '🔔', '📝', '📌', '📍', '📎', '📞', '📱', '💻', '⌚', '📧', '📨', '📩', '📤', '📥', '📦', '📋', '📊', '📈', '📉', '🗂️', '📅', '📆', '🗓️', '📇', '🗃️', '🗄️', '📁', '📂', '🗂️', '📰', '🗞️', '📄', '📃', '📑', '📜', '📋'].map(emoji => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        className="text-xl hover:scale-125 transition p-1"
                                        onClick={() => {
                                            const textarea = document.querySelector('textarea');
                                            if (textarea) {
                                                const start = textarea.selectionStart;
                                                const end = textarea.selectionEnd;
                                                const newVal = newMessage.slice(0, start) + emoji + newMessage.slice(end);
                                                setNewMessage(newVal);
                                                setTimeout(() => {
                                                    textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
                                                    textarea.focus();
                                                }, 0);
                                            }
                                            setShowEmojiPicker(false);
                                        }}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}
                        <textarea
                            ref={textareaRef}
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && e.ctrlKey) {
                                    e.preventDefault();
                                    const { selectionStart, selectionEnd } = e.target;
                                    const updated = newMessage.slice(0, selectionStart) + '\n' + newMessage.slice(selectionEnd);
                                    setNewMessage(updated);
                                    setTimeout(() => {
                                        e.target.selectionStart = e.target.selectionEnd = selectionStart + 1;
                                    }, 0);
                                } else if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            placeholder="Сообщение или #Задача..."
                            className="flex-1 bg-transparent outline-none text-sm resize-none max-h-32 min-h-[32px] py-2 overflow-y-auto"
                            rows={1}
                            style={{ height: 'auto' }}
                            onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                            }}
                        />
                        <button onClick={sendMessage} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition self-end flex-shrink-0">
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Затемнение и Info Panel с анимацией */}
            <AnimatePresence>
                {showInfoPanel && (
                    <>
                        {/* Затемнение - только в области чата+инфо */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 bg-black/50 z-40"
                            onClick={() => setShowInfoPanel(false)}
                        />

                        {/* Info Panel */}
                        <DealInfoPanel
                            deal={selectedDeal}
                            onClose={() => setShowInfoPanel(false)}
                            dealTasks={dealTasks}
                            addTask={addTask}
                            toggleTask={toggleTask}
                            setTaskInProgress={setTaskInProgress}
                            deleteTask={deleteTask}
                        />
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

// Задача в чате - БЕЗ ПОДЗАДАЧ
const TaskBubble = ({ task, toggleTask, deleteTask, taskFontClass, setEditingTask, setEditTaskText }) => {
    return (
        <div className="flex gap-3 mb-3 group w-full">
            {/* Иконка задачи - обычная серая */}
            <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
                <ListChecks size={16} />
            </div>

            {/* Карточка задачи - белая, прямоугольная */}
            <div
                className="flex-1 max-w-[85%]"
                onContextMenu={(e) => {
                    e.preventDefault();

                    // Закрываем все существующие меню
                    document.querySelectorAll('.context-menu').forEach(m => m.remove());

                    const menu = document.createElement('div');
                    menu.className = 'context-menu fixed bg-white border border-gray-100 rounded-xl shadow-2xl z-[100] py-2 w-[180px]';
                    menu.style.left = `${e.clientX}px`;
                    menu.style.top = `${e.clientY}px`;

                    const buttons = [
                        { label: '✏️ Редактировать', action: () => { setEditingTask(task); setEditTaskText(task.text); } },
                        { label: '🗑️ Удалить', action: () => deleteTask(task.id), className: 'text-red-600 hover:bg-red-50' }
                    ];

                    buttons.forEach(btn => {
                        const button = document.createElement('button');
                        button.className = `w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm font-medium text-slate-700 transition-all duration-150 whitespace-nowrap rounded-lg mx-1 ${btn.className || ''}`;
                        button.textContent = btn.label;
                        button.onclick = () => {
                            btn.action();
                            menu.remove();
                        };
                        menu.appendChild(button);
                    });

                    document.body.appendChild(menu);
                    const closeMenu = (event) => {
                        if (!menu.contains(event.target)) {
                            menu.remove();
                            document.removeEventListener('click', closeMenu);
                        }
                    };
                    setTimeout(() => document.addEventListener('click', closeMenu), 0);
                }}
            >
                <div className={`bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-all duration-150 hover:shadow-md hover:border-gray-300 ${task.is_done ? 'opacity-60' : ''}`}>
                    {/* Основная задача */}
                    <div className="flex items-center p-3 gap-3">
                        <button
                            onClick={() => toggleTask(task)}
                            className={`w-6 h-6 rounded border flex-shrink-0 flex items-center justify-center transition ${task.is_done
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-gray-300 hover:border-blue-500'
                                }`}
                        >
                            {task.is_done && <CheckSquare size={14} />}
                        </button>
                        <div className="flex-1 min-w-0">
                            <span className={`font-medium block break-words ${task.is_done ? 'text-gray-400 line-through' : 'text-slate-800'} ${taskFontClass}`}>
                                {task.text}
                            </span>
                        </div>
                        <button
                            onClick={() => deleteTask(task.id)}
                            className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Быстрая задача в верхней панели - БЕЗ ПОДЗАДАЧ
const TopPanelTask = ({ task, toggleTask, setTaskInProgress, deleteTask, taskFontClass, setEditingTask, setEditTaskText }) => {
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [completionComment, setCompletionComment] = useState('');

    const handleComplete = () => {
        toggleTask(task.id, completionComment || null);
        setShowCommentInput(false);
        setCompletionComment('');
    };

    return (
        <div
            className={`group relative ${task.is_done ? 'opacity-50' : ''}`}
            onContextMenu={(e) => {
                e.preventDefault();

                // Закрываем все существующие меню
                document.querySelectorAll('.context-menu').forEach(m => m.remove());

                const menu = document.createElement('div');
                menu.className = 'context-menu fixed bg-white border border-gray-100 rounded-xl shadow-2xl z-[100] py-2 w-[180px]';
                menu.style.left = `${e.clientX}px`;
                menu.style.top = `${e.clientY}px`;

                const buttons = [
                    { label: '✏️ Редактировать', action: () => { setEditingTask(task); setEditTaskText(task.text); } },
                    { label: '🗑️ Удалить', action: () => deleteTask(task.id), className: 'text-red-600 hover:bg-red-50' }
                ];

                buttons.forEach(btn => {
                    const button = document.createElement('button');
                    button.className = `w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm font-medium text-slate-700 transition-all duration-150 whitespace-nowrap rounded-lg mx-1 ${btn.className || ''}`;
                    button.textContent = btn.label;
                    button.onclick = () => {
                        btn.action();
                        menu.remove();
                    };
                    menu.appendChild(button);
                });

                document.body.appendChild(menu);
                const closeMenu = (event) => {
                    if (!menu.contains(event.target)) {
                        menu.remove();
                        document.removeEventListener('click', closeMenu);
                    }
                };
                setTimeout(() => document.addEventListener('click', closeMenu), 0);
            }}
        >
            {showCommentInput ? (
                // Форма завершения с комментарием
                <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                    <input
                        type="text"
                        value={completionComment}
                        onChange={(e) => setCompletionComment(e.target.value)}
                        placeholder="Комментарий (необязательно)..."
                        className="w-full px-2 py-1 text-sm border border-green-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        autoFocus
                        onKeyPress={(e) => e.key === 'Enter' && handleComplete()}
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleComplete}
                            className="flex-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                            ✓ Завершить
                        </button>
                        <button
                            onClick={() => {
                                setShowCommentInput(false);
                                setCompletionComment('');
                            }}
                            className="flex-1 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-blue-50 transition-all duration-150">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (task.is_done) {
                                toggleTask(task);
                            } else {
                                setShowCommentInput(true);
                            }
                        }}
                        className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center ${task.is_done
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : task.in_progress
                                ? 'bg-yellow-500 border-yellow-500 text-white'
                                : 'border-gray-300 hover:border-blue-500 text-transparent'
                            }`}
                    >
                        <CheckSquare size={12} />
                    </button>
                    <div className="flex-1 cursor-pointer min-w-0">
                        <span className={`block truncate ${task.is_done
                            ? 'text-gray-400 line-through'
                            : task.in_progress
                                ? 'text-yellow-700 font-semibold'
                                : 'text-slate-700 font-medium'
                            } ${taskFontClass}`}>
                            {task.in_progress && '⚡ '}{task.text}
                        </span>
                    </div>

                    {/* Кнопка "В работу" */}
                    {!task.is_done && !task.in_progress && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setTaskInProgress(task.id);
                            }}
                            className="px-2 py-0.5 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 opacity-0 group-hover:opacity-100 transition"
                        >
                            ⚡ В работу
                        </button>
                    )}

                    {/* Кнопка "Снять с работы" */}
                    {!task.is_done && task.in_progress && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setTaskInProgress(task.id);
                            }}
                            className="px-2 py-0.5 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 opacity-0 group-hover:opacity-100 transition"
                        >
                            ◯ Снять
                        </button>
                    )}

                    <button
                        onClick={() => deleteTask(task.id)}
                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default CrmChat;
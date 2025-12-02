import React, { useRef, useEffect, useState } from 'react';
import { MoreVertical, Smile, Send, Building2, X, CheckSquare, ChevronDown, ChevronRight, Trash2, ListChecks, Paperclip } from 'lucide-react';
import { getFontSizeClass, getEmojiMultiplier } from '../constants/fontSizes';

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
    toggleSubtask,
    deleteTask,
    newMessage,
    setNewMessage,
    sendMessage,
    replyTo,
    setReplyTo,
    openCompanyCard,
}) => {
    // UI state for emoji picker and file attachment
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef(null);

    // Message colors from localStorage
    const [myMessageColor, setMyMessageColor] = useState(
        localStorage.getItem('myMessageColor') || 'blue'
    );
    const [incomingMessageColor, setIncomingMessageColor] = useState(
        localStorage.getItem('incomingMessageColor') || 'purple'
    );
    const [quickTaskColor, setQuickTaskColor] = useState(
        localStorage.getItem('quickTaskColor') || 'orange'
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

    // Listen for color and font changes from settings
    useEffect(() => {
        const handleColorChange = () => {
            setMyMessageColor(localStorage.getItem('myMessageColor') || 'blue');
            setIncomingMessageColor(localStorage.getItem('incomingMessageColor') || 'purple');
            setQuickTaskColor(localStorage.getItem('quickTaskColor') || 'orange');
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
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatStream]);

    if (!selectedDeal) {
        return <div className="flex-1 flex items-center justify-center text-gray-400 bg-[#eef1f5]">Выберите сделку</div>;
    }

    const sortedTopTasks = [...dealTasks].sort((a, b) => Number(a.is_done) - Number(b.is_done));

    // Get color classes
    const getMyMessageColors = () => MESSAGE_COLOR_MAP[myMessageColor] || MESSAGE_COLOR_MAP.blue;
    const getIncomingMessageColors = () => MESSAGE_COLOR_MAP[incomingMessageColor] || MESSAGE_COLOR_MAP.purple;
    const getQuickTaskColors = () => MESSAGE_COLOR_MAP[quickTaskColor] || MESSAGE_COLOR_MAP.orange;

    return (
        <div className="flex-1 flex flex-col bg-[#eef1f5] min-w-[500px]">
            {/* Header */}
            <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
                <div>
                    <h2 className={`font-bold text-slate-800 flex items-center gap-2 ${headerFontClass}`}>{selectedDeal.title}</h2>
                    <p className="text-xs text-blue-600 cursor-pointer hover:underline flex items-center gap-1" onClick={() => openCompanyCard(selectedDeal.company_id)}>
                        <Building2 size={10} /> {selectedDeal.company_name}
                    </p>
                </div>
                <MoreVertical size={20} className="text-gray-400 cursor-pointer" />
            </div>

            {/* Quick Tasks Panel */}
            <div className="bg-white/90 border-b border-gray-200 px-6 py-4 backdrop-blur-sm shadow-sm relative z-20">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-2">
                    <ListChecks size={12} /> План работ
                </h3>
                <div className="flex flex-col space-y-1">
                    {sortedTopTasks.map(task => (
                        <TopPanelTask
                            key={task.id}
                            task={task}
                            toggleTask={toggleTask}
                            toggleSubtask={toggleSubtask}
                            deleteTask={deleteTask}
                            taskFontClass={taskFontClass}
                        />
                    ))}
                </div>
            </div>

            {/* Chat Stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
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
                                toggleSubtask={toggleSubtask}
                                deleteTask={deleteTask}
                                taskFontClass={taskFontClass}
                            />
                        );
                    }

                    const myColors = getMyMessageColors();
                    const incomingColors = getIncomingMessageColors();
                    const quickColors = getQuickTaskColors();

                    // Determine colors and font based on message type
                    const isQuickTask = item.is_quick_task || item.text.startsWith(':::TASK:::') || item.text.startsWith('⚡ Поставлена задача:');
                    const colors = isQuickTask ? quickColors : (item.is_me ? myColors : incomingColors);
                    const messageFontClass = item.is_me ? outgoingFontClass : incomingFontClass;

                    // Clean text for display
                    let displayText = item.text;
                    if (displayText.startsWith(':::TASK::: ')) {
                        displayText = displayText.replace(':::TASK::: ', '');
                    } else if (displayText.startsWith('⚡ Поставлена задача:')) {
                        displayText = displayText.replace('⚡ Поставлена задача:', '').trim();
                    }

                    return (
                        <div key={item.id} className={`flex gap-3 group mb-2 ${item.is_me ? 'flex-row-reverse' : ''}`}>
                            {!item.is_me && (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${incomingColors.bg}`}>
                                    К
                                </div>
                            )}
                            <div className="max-w-[80%]">
                                {item.reply_to_id && (
                                    <div className="text-[10px] mb-1 p-1 border-l-2 border-gray-300 text-gray-500">Ответ</div>
                                )}
                                {isQuickTask && (
                                    <div className="text-[10px] text-gray-500 mb-1 font-semibold">Задача</div>
                                )}
                                <div className={`p-3 rounded-2xl shadow-sm ${colors.bg} ${colors.text} ${item.is_me ? 'rounded-tr-none' : 'rounded-tl-none'} ${messageFontClass}`}>
                                    <div className="whitespace-pre-wrap">{displayText}</div>
                                    <div className={`text-[10px] text-right mt-1 ${colors.timeText}`}>
                                        {new Date(item.created_at).toLocaleTimeString().slice(0, 5)}
                                    </div>
                                </div>
                                {!isQuickTask && (
                                    <div className="flex gap-1 text-xs mt-1 opacity-0 group-hover:opacity-100 transition">
                                        <button onClick={() => setReplyTo(item)} className="text-gray-400 hover:text-blue-600">Ответить</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4 bg-white">
                {replyTo && (
                    <div className="flex items-center gap-2 text-xs mb-2 p-2 bg-gray-50 rounded border border-gray-100">
                        <span className="text-gray-500">Ответ на:</span>
                        <span className="text-slate-600 truncate flex-1">{replyTo.text}</span>
                        <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-red-500">
                            <X size={14} />
                        </button>
                    </div>
                )}
                <div className="flex items-end gap-3 bg-white border border-gray-200 rounded-lg p-3 relative">
                    <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-gray-400 hover:text-blue-600 p-1">
                        <Smile size={20} />
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-blue-600 p-1">
                        <Paperclip size={20} />
                    </button>
                    <input ref={fileInputRef} type="file" multiple className="hidden" />
                    {showEmojiPicker && (
                        <div className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-lg p-3 shadow-xl z-50 grid grid-cols-8 gap-1">
                            {['😀', '😂', '😊', '😍', '🤔', '👍', '👎', '🔥', '💪', '✅', '❌', '⚡', '🎉', '💡', '📝', '📞'].map(emoji => (
                                <button
                                    key={emoji}
                                    type="button"
                                    className="text-xl hover:scale-125 transition"
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
                        className="flex-1 bg-transparent outline-none text-sm resize-none max-h-24 py-2 overflow-y-auto"
                        rows={1}
                    />
                    <button onClick={sendMessage} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition">
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Задача в чате - красивое зелёное облако как сообщение
const TaskBubble = ({ task, toggleTask, toggleSubtask, deleteTask, taskFontClass }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;

    return (
        <div className="flex gap-3 mb-3 group">
            {/* Иконка задачи - как аватар */}
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                <ListChecks size={16} />
            </div>

            {/* Облако задачи */}
            <div className="max-w-[80%]">
                <div className={`bg-emerald-50 border-2 border-emerald-200 rounded-2xl rounded-tl-none shadow-sm overflow-hidden transition-all ${task.is_done ? 'opacity-60' : ''}`}>
                    {/* Основная задача */}
                    <div className={`flex items-center p-2.5 gap-2 ${hasSubtasks ? 'border-b border-emerald-100' : ''}`}>
                        <button
                            onClick={() => toggleTask(task)}
                            className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition ${task.is_done
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-emerald-400 hover:border-emerald-500'
                                }`}
                        >
                            {task.is_done && <CheckSquare size={12} />}
                        </button>
                        <div className="flex-1 min-w-0">
                            <span className={`font-medium block ${task.is_done ? 'text-gray-400 line-through' : 'text-emerald-900'} ${taskFontClass}`}>
                                {task.text}
                            </span>
                        </div>
                        {hasSubtasks && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-emerald-600 hover:text-emerald-700 p-1"
                            >
                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                        )}
                        <button
                            onClick={() => deleteTask(task.id)}
                            className="text-emerald-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>

                    {/* Подзадачи */}
                    {hasSubtasks && isExpanded && (
                        <div className="bg-white/50 px-2.5 py-2 space-y-1">
                            {task.subtasks.map((sub, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-2 py-1 px-2 hover:bg-white/70 rounded cursor-pointer transition"
                                    onClick={() => toggleSubtask(task, idx)}
                                >
                                    <div className={`mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition ${sub.is_done || task.is_done
                                        ? 'bg-emerald-500 border-emerald-500'
                                        : 'border-emerald-300 bg-white'
                                        }`}>
                                        {(sub.is_done || task.is_done) && <CheckSquare size={10} className="text-white" />}
                                    </div>
                                    <span className={`text-xs leading-relaxed ${sub.is_done || task.is_done
                                        ? 'text-gray-400 line-through'
                                        : 'text-emerald-800'
                                        }`}>
                                        {sub.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Быстрая задача в верхней панели - компактный вид
const TopPanelTask = ({ task, toggleTask, toggleSubtask, deleteTask, taskFontClass }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;

    return (
        <div className={`group relative ${task.is_done ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-2 py-1.5 px-2 hover:bg-emerald-50/50 rounded-lg transition">
                <button
                    onClick={() => toggleTask(task)}
                    className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition ${task.is_done
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-gray-300 hover:border-emerald-500 text-transparent'
                        }`}
                >
                    <CheckSquare size={10} />
                </button>
                <div
                    className="flex-1 cursor-pointer min-w-0"
                    onClick={() => hasSubtasks && setIsExpanded(!isExpanded)}
                >
                    <span className={`block truncate ${task.is_done
                        ? 'text-gray-400 line-through'
                        : 'text-slate-700 font-medium'
                        } ${taskFontClass}`}>
                        {task.text}
                    </span>
                </div>
                {hasSubtasks && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-gray-400 hover:text-emerald-600 p-1"
                    >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                )}
                <button
                    onClick={() => deleteTask(task.id)}
                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            {/* Подзадачи - всплывающее окно */}
            {hasSubtasks && isExpanded && (
                <div className="absolute left-0 top-full mt-1 w-full bg-white border-2 border-emerald-200 rounded-xl shadow-xl z-50 p-2">
                    {task.subtasks.map((sub, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-emerald-50 rounded px-2 transition"
                            onClick={() => toggleSubtask(task, idx)}
                        >
                            <div className={`w-3 h-3 rounded border-2 flex-shrink-0 flex items-center justify-center ${sub.is_done || task.is_done
                                ? 'bg-emerald-500 border-emerald-500'
                                : 'border-emerald-300'
                                }`}>
                                {(sub.is_done || task.is_done) && <CheckSquare size={8} className="text-white" />}
                            </div>
                            <span className={`text-sm ${sub.is_done || task.is_done
                                ? 'text-gray-400 line-through'
                                : 'text-slate-600'
                                }`}>
                                {sub.text}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CrmChat;
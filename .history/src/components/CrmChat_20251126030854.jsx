const messagesEndRef = useRef(null);
useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [chatStream]);

if (!selectedDeal) {
    return <div className="flex-1 flex items-center justify-center text-gray-400 bg-[#eef1f5]">Выберите сделку</div>;
}

const sortedTopTasks = [...dealTasks].sort((a, b) => Number(a.is_done) - Number(b.is_done));

return (
    <div className="flex-1 flex flex-col bg-[#eef1f5] min-w-[500px]">
        {/* Header */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
            <div>
                <h2 className="font-bold text-slate-800 flex items-center gap-2">{selectedDeal.title}</h2>
                <p className="text-xs text-blue-600 cursor-pointer hover:underline flex items-center gap-1" onClick={() => openCompanyCard(selectedDeal.company_id)}>
                    <Building2 size={10} /> {selectedDeal.company_name}
                </p>
            </div>
            <MoreVertical size={20} className="text-gray-400 cursor-pointer" />
        </div>

        {/* Quick Tasks Panel */}
        <div className="bg-white/90 border-b border-gray-200 px-6 py-4 backdrop-blur-sm max-h-64 overflow-y-auto custom-scrollbar shadow-sm">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-2">
                <ListChecks size={12} /> План работ
            </h3>
            <div className="flex flex-col">
                {sortedTopTasks.map(task => (
                    <TopPanelTask
                        key={task.id}
                        task={task}
                        toggleTask={toggleTask}
                        toggleSubtask={toggleSubtask}
                        deleteTask={deleteTask}
                    />
                ))}
            </div>
            {/* Quick Task Input */}
            <div className="flex items-center gap-3 py-2 px-2 mt-1 hover:bg-gray-50 rounded-lg transition group">
                <button
                    onClick={() => {
                        if (dealTasks.filter(t => !t.is_done).length >= 5) {
                            alert('Лимит: не более 5 активных задач.');
                            return;
                        }
                        if (quickTaskText.trim()) addTask(quickTaskText, selectedDeal.id);
                    }}
                    disabled={dealTasks.filter(t => !t.is_done).length >= 5}
                    className="w-4 h-4 flex items-center justify-center flex-shrink-0 cursor-pointer disabled:cursor-not-allowed"
                >
                    <Plus size={16} className={dealTasks.filter(t => !t.is_done).length >= 5 ? 'text-gray-300' : 'text-blue-400 group-hover:text-blue-600'} />
                </button>
                <input
                    type="text"
                    value={quickTaskText}
                    onChange={e => setQuickTaskText(e.target.value)}
                    placeholder={dealTasks.filter(t => !t.is_done).length >= 5 ? 'Лимит задач исчерпан (5/5)' : 'Новый пункт...'}
                    disabled={dealTasks.filter(t => !t.is_done).length >= 5}
                    className="bg-transparent text-sm w-full outline-none placeholder-gray-400 text-slate-700 font-medium h-full disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="off"
                />
            </div>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {chatStream.length === 0 && (
                <div className="text-center text-gray-400 mt-10 text-sm">История пуста</div>
            )}
            {chatStream.map(item => {
                if (item.type === 'task') {
                    return <TaskBubble key={item.id} task={item} toggleTask={toggleTask} toggleSubtask={toggleSubtask} deleteTask={deleteTask} />;
                }
                return (
                    <div key={item.id} className={`flex gap-3 group mb-2 ${item.is_me ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${item.is_me ? 'bg-blue-600' : 'bg-purple-600'}`}>
                            {item.is_me ? 'Я' : 'К'}
                        </div>
                        <div className="max-w-[80%]">
                            {item.reply_to_id && (
                                <div className="text-[10px] mb-1 p-1 border-l-2 border-gray-300 text-gray-500">Ответ</div>
                            )}
                            {item.text.startsWith('⚡') ? (
                                <div className="bg-gray-100 border border-gray-200 text-slate-500 text-xs px-3 py-1.5 rounded-lg inline-block">
                                    {item.text}
                                </div>
                            ) : (
                                <div className={`p-3 rounded-2xl text-sm shadow-sm ${item.is_me ? 'bg-white text-slate-800 rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none'}`}>
                                    <div className="whitespace-pre-wrap">{item.text}</div>
                                    <div className="text-[10px] text-gray-400 text-right mt-1">
                                        {new Date(item.created_at).toLocaleTimeString().slice(0, 5)}
                                    </div>
                                </div>
                            )}
                            {!item.text.startsWith('⚡') && (
                                <button onClick={() => setReplyTo(item)} className="text-[10px] text-gray-400 mt-1 hover:text-blue-600 opacity-0 group-hover:opacity-100">
                                    Ответить
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white border-t border-gray-200">
            {replyTo && (
                <div className="flex justify-between bg-blue-50 p-2 text-xs text-blue-700 mb-2 rounded">
                    <span>Ответ...</span>
                    <X size={14} className="cursor-pointer" onClick={() => setReplyTo(null)} />
                </div>
            )}
            <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-xl border border-transparent focus-within:bg-white focus-within:border-blue-200 transition-all relative">
                {/* Emoji picker toggle */}
                <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                    <Smile size={20} />
                </button>
                {/* File attachment button */}
                <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-600"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                    <Paperclip size={20} />
                </button>
                {/* Hidden file input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                            console.log('Selected file:', file);
                            // For now just append file name to the message
                            setNewMessage(prev => prev + ` [${file.name}]`);
                        }
                    }}
                />
                {/* Emoji picker panel */}
                {showEmojiPicker && (
                    <div className="absolute bottom-16 left-4 bg-white border rounded shadow-lg p-2 flex flex-wrap gap-2 z-20">
                        {['😀', '😂', '👍', '❤️', '🚀', '😎', '🤔', '🎉', '💡', '🔥'].map(emoji => (
                            <button
                                key={emoji}
                                type="button"
                                className="text-xl"
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
                <button onClick={sendMessage} className="bg-blue-600 text-white p-2 rounded-lg">
                    <Send size={18} />
                </button>
            </div>
        </div>
    </div>
);
};

const TaskBubble = ({ task, toggleTask, toggleSubtask, deleteTask }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    return (
        <div className="flex gap-3 mb-4 group">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-sm border border-emerald-200">
                <ListChecks size={16} />
            </div>
            <div className={`w-[80%] bg-white border rounded-xl rounded-tl-none shadow-sm overflow-hidden transition-all ${task.is_done ? 'opacity-60 border-gray-200' : 'border-emerald-100'}`}>
                <div className={`flex items-center p-3 gap-3 ${hasSubtasks ? 'border-b border-gray-50' : ''}`}>
                    <button
                        onClick={() => toggleTask(task)}
                        className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition ${task.is_done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 hover:border-emerald-500'}`}
                    >
                        {task.is_done && <CheckSquare size={12} />}
                    </button>
                    <div className="flex-1 min-w-0">
                        <span className={`font-bold text-sm block truncate ${task.is_done ? 'text-gray-400 line-through' : 'text-slate-700'}`}>{task.text}</span>
                    </div>
                    {hasSubtasks && (
                        <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-400 hover:text-blue-600 p-1">
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                    )}
                    <button onClick={() => deleteTask(task.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1">
                        <Trash2 size={14} />
                    </button>
                </div>
                {hasSubtasks && isExpanded && (
                    <div className="bg-emerald-50/20 p-2 space-y-1">
                        {task.subtasks.map((sub, idx) => (
                            <div
                                key={idx}
                                className="flex items-start gap-2 px-2 py-1.5 hover:bg-white/50 rounded cursor-pointer transition"
                                onClick={() => toggleSubtask(task, idx)}
                            >
                                <div className={`mt-0.5 w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition ${sub.is_done || task.is_done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'}`}>
                                    {(sub.is_done || task.is_done) && <CheckSquare size={10} className="text-white" />}
                                </div>
                                <span className={`text-xs leading-tight ${sub.is_done || task.is_done ? 'text-gray-400 line-through' : 'text-slate-700'}`}>{sub.text}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const TopPanelTask = ({ task, toggleTask, toggleSubtask, deleteTask }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    return (
        <div className={`group border-b border-gray-50 last:border-0 hover:bg-gray-50 transition rounded-lg px-2 ${task.is_done ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-3 py-2">
                <button
                    onClick={() => toggleTask(task)}
                    className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition ${task.is_done ? 'bg-gray-400 border-gray-400 text-white' : 'border-gray-300 hover:border-blue-500 text-transparent'}`}
                >
                    <CheckSquare size={10} />
                </button>
                <div className="flex-1 cursor-pointer min-w-0" onClick={() => hasSubtasks && setIsExpanded(!isExpanded)}>
                    <span className={`text-sm block truncate ${task.is_done ? 'text-gray-400 line-through' : 'text-slate-700 font-medium'}`}>{task.text}</span>
                </div>
                {hasSubtasks && (
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-400 hover:text-blue-600 p-1">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                )}
                <button onClick={() => deleteTask(task.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1">
                    <Trash2 size={14} />
                </button>
            </div>
            {hasSubtasks && isExpanded && (
                <div className="pl-9 pr-2 pb-2 space-y-1">
                    {task.subtasks.map((sub, idx) => (
                        <div key={idx} className="flex items-center gap-2 py-0.5 cursor-pointer hover:text-blue-600 transition" onClick={() => toggleSubtask(task, idx)}>
                            <div className={`w-3 h-3 rounded border flex-shrink-0 flex items-center justify-center ${sub.is_done || task.is_done ? 'bg-gray-400 border-gray-400' : 'border-gray-300'}`}>
                                {(sub.is_done || task.is_done) && <CheckSquare size={8} className="text-white" />}
                            </div>
                            <span className={`text-xs ${sub.is_done || task.is_done ? 'text-gray-400 line-through' : 'text-slate-600'}`}>{sub.text}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CrmChat;
<h3 className="text-lg font-bold text-slate-800 mb-4">Контактная информация</h3>

{
    deal.contact_name && (
        <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs font-bold text-gray-400 uppercase mb-1">Контактное лицо</div>
            <div className="text-sm font-semibold text-slate-800">{deal.contact_name}</div>
            {deal.contact_position && (
                <div className="text-xs text-gray-500 mt-1">{deal.contact_position}</div>
            )}
        </div>
    )
}

<div className="grid grid-cols-2 gap-4">
    {deal.contact_phone && (
        <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs font-bold text-gray-400 uppercase mb-1">Телефон</div>
            <a href={`tel:${deal.contact_phone}`} className="text-sm font-semibold text-blue-600 hover:underline">
                {deal.contact_phone}
            </a>
        </div>
    )}

    {deal.contact_email && (
        <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs font-bold text-gray-400 uppercase mb-1">Email</div>
            <a href={`mailto:${deal.contact_email}`} className="text-sm font-semibold text-blue-600 hover:underline">
                {deal.contact_email}
            </a>
        </div>
    )}
</div>

{
    deal.company_name && (
        <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs font-bold text-gray-400 uppercase mb-1">Компания</div>
            <div className="text-sm font-semibold text-slate-800">{deal.company_name}</div>
            {deal.company_inn && (
                <div className="text-xs text-gray-500 mt-1">ИНН: {deal.company_inn}</div>
            )}
        </div>
    )
}

{
    deal.comment && (
        <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs font-bold text-gray-400 uppercase mb-1">Комментарий</div>
            <div className="text-sm text-slate-700 whitespace-pre-wrap">{deal.comment}</div>
        </div>
    )
}
        </div >
    );
};

// Задачи
const TasksTab = ({ tasks, dealId }) => {
    const dealTasks = tasks.filter(t => t.deal_id === dealId);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Задачи по сделке</h3>

            {dealTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Нет задач по этой сделке</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {dealTasks.map((task) => (
                        <div
                            key={task.id}
                            className={`p-4 rounded-lg border ${task.is_done
                                ? 'bg-green-50 border-green-200'
                                : task.in_progress
                                    ? 'bg-blue-50 border-blue-200'
                                    : 'bg-white border-gray-200'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${task.is_done ? 'bg-green-500 border-green-500' : 'border-gray-300'
                                    }`}>
                                    {task.is_done && <span className="text-white text-xs">✓</span>}
                                </div>
                                <div className="flex-1">
                                    <div className={`text-sm font-medium ${task.is_done ? 'line-through text-gray-500' : 'text-slate-800'}`}>
                                        {task.text}
                                    </div>
                                    {task.due_date && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            Срок: {new Date(task.due_date).toLocaleDateString('ru-RU')}
                                        </div>
                                    )}
                                    {task.in_progress && !task.is_done && (
                                        <div className="text-xs text-blue-600 font-medium mt-1">В работе</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Файлы
const FilesTab = ({ dealId }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Файлы</h3>
            <div className="text-center py-8 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Функция загрузки файлов будет добавлена позже</p>
            </div>
        </div>
    );
};

// История звонков
const CallsTab = ({ dealId }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4">История звонков</h3>
            <div className="text-center py-8 text-gray-400">
                <Phone className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>История звонков будет доступна после интеграции с телефонией</p>
            </div>
        </div>
    );
};

// История сделки
const HistoryTab = ({ messages, dealId }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4">История изменений</h3>
            <div className="text-center py-8 text-gray-400">
                <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>История изменений сделки будет добавлена позже</p>
            </div>
        </div>
    );
};

export default DealOverlayPanel;

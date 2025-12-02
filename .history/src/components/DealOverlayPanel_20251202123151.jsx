<div className="space-y-4">
    <h3 className="text-lg font-bold text-slate-800 mb-4">Контактная информация</h3>

    {deal.contact_name && (
        <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs font-bold text-gray-400 uppercase mb-1">Контактное лицо</div>
            <div className="text-sm font-semibold text-slate-800">{deal.contact_name}</div>
            {deal.contact_position && (
                <div className="text-xs text-gray-500 mt-1">{deal.contact_position}</div>
            )}
        </div>
    )}

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

    {deal.company_name && (
        <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs font-bold text-gray-400 uppercase mb-1">Компания</div>
            <div className="text-sm font-semibold text-slate-800">{deal.company_name}</div>
            {deal.company_inn && (
                <div className="text-xs text-gray-500 mt-1">ИНН: {deal.company_inn}</div>
            )}
        </div>
    )}

    {deal.comment && (
        <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs font-bold text-gray-400 uppercase mb-1">Комментарий</div>
            <div className="text-sm text-slate-700 whitespace-pre-wrap">{deal.comment}</div>
        </div>
    )}
</div>
    );
};

// Товары
const ProductsTab = ({ deal }) => {
    const products = [
        { id: 1, name: 'Dell PowerEdge R740', quantity: 2, price: 450000, total: 900000 },
        { id: 2, name: 'Лицензия VMware vSphere', quantity: 1, price: 150000, total: 150000 },
    ];

    const totalSum = products.reduce((sum, p) => sum + p.total, 0);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">Товары и услуги</h3>
                <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                    + Добавить товар
                </button>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Нет товаров в сделке</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Наименование</th>
                                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase w-24">Кол-во</th>
                                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase w-32">Цена</th>
                                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase w-32">Сумма</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm font-medium text-slate-800">{product.name}</td>
                                        <td className="px-4 py-3 text-sm text-center text-gray-600">{product.quantity}</td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-600">
                                            {product.price.toLocaleString('ru-RU')} ₽
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right font-semibold text-slate-800">
                                            {product.total.toLocaleString('ru-RU')} ₽
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-blue-50 border-t-2 border-blue-200">
                                <tr>
                                    <td colSpan="3" className="px-4 py-3 text-sm font-bold text-slate-800 text-right">
                                        Итого:
                                    </td>
                                    <td className="px-4 py-3 text-base font-bold text-blue-600 text-right">
                                        {totalSum.toLocaleString('ru-RU')} ₽
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {deal.value && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Сумма сделки:</span>
                                <span className="text-lg font-bold text-slate-800">
                                    {Number(deal.value).toLocaleString('ru-RU')} ₽
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
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

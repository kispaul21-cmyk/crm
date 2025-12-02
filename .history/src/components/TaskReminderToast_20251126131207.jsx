import React, { useEffect } from 'react';
import { X, Clock, AlertCircle } from 'lucide-react';

const TaskReminderToast = ({ reminders, onDismiss }) => {
    if (!reminders || reminders.length === 0) return null;

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
            {reminders.map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} onDismiss={onDismiss} />
            ))}
        </div>
    );
};

const ReminderCard = ({ reminder, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(reminder.id);
        }, 10000); // Auto-dismiss after 10 seconds

        return () => clearTimeout(timer);
    }, [reminder.id, onDismiss]);

    const getUrgencyColor = () => {
        const now = new Date();
        const dueDate = new Date(reminder.due_date);
        const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60);

        if (hoursUntilDue < 0) return 'from-red-500 to-red-600';
        if (hoursUntilDue < 1) return 'from-orange-500 to-red-500';
        return 'from-blue-500 to-purple-500';
    };

    const formatTimeUntil = () => {
        const now = new Date();
        const dueDate = new Date(reminder.due_date);
        const diffMs = dueDate - now;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 0) return 'Просрочено!';
        if (diffMins < 60) return `Через ${diffMins} мин`;
        if (diffHours < 24) return `Через ${diffHours} ч`;
        return `Через ${Math.floor(diffHours / 24)} дн`;
    };

    return (
        <div
            className="animate-slide-down bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-w-md w-full"
            style={{ animation: 'slideDown 0.3s ease-out' }}
        >
            <div className={`h-1 bg-gradient-to-r ${getUrgencyColor()}`} />
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${getUrgencyColor()} text-white flex-shrink-0`}>
                        <AlertCircle size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-800">Напоминание о задаче</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock size={12} />
                                {formatTimeUntil()}
                            </span>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">{reminder.text}</p>
                    </div>

                    <button
                        onClick={() => onDismiss(reminder.id)}
                        className="text-gray-400 hover:text-gray-600 transition flex-shrink-0"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Add this to your global CSS or index.css
const styles = `
@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-down {
  animation: slideDown 0.3s ease-out;
}
`;

export default TaskReminderToast;

/**
 * Утилиты для форматирования данных
 */

/**
 * Форматирование даты
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ru-RU');
};

/**
 * Форматирование даты и времени
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDateTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString('ru-RU');
};

/**
 * Форматирование суммы
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '';
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
    }).format(amount);
};

/**
 * Форматирование номера телефона
 * @param {string} phone
 * @returns {string}
 */
export const formatPhone = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
        return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
    }
    
    return phone;
};

/**
 * Утилиты для валидации данных
 */

/**
 * Валидация ИНН
 * @param {string} inn - ИНН для проверки
 * @returns {boolean} true если валиден
 */
export const validateInn = (inn) => {
    if (!inn) return false;
    
    // Удаляем все нецифровые символы
    const cleanInn = inn.replace(/\D/g, '');
    
    // ИНН должен быть 10 или 12 цифр
    return cleanInn.length === 10 || cleanInn.length === 12;
};

/**
 * Валидация email
 * @param {string} email
 * @returns {boolean}
 */
export const validateEmail = (email) => {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

/**
 * Валидация телефона
 * @param {string} phone
 * @returns {boolean}
 */
export const validatePhone = (phone) => {
    if (!phone) return false;
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10;
};

/**
 * Очистка ИНН от нецифровых символов
 * @param {string} inn
 * @returns {string}
 */
export const cleanInn = (inn) => {
    return inn ? inn.replace(/\D/g, '') : '';
};

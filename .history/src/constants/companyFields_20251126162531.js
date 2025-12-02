/**
 * Дополнительные поля компании
 * Используются в CompanyModal для динамического добавления полей
 */
export const ADDITIONAL_FIELDS = [
    { key: 'okpo', label: 'ОКПО', placeholder: '12345678' },
    { key: 'okved', label: 'ОКВЭД', placeholder: '62.01' },
    { key: 'director_post', label: 'Должность директора', placeholder: 'Генеральный директор' },
    { key: 'phone', label: 'Телефон', placeholder: '+7 (999) 123-45-67' },
    { key: 'email', label: 'Email', placeholder: 'info@company.ru' },
    { key: 'website', label: 'Сайт', placeholder: 'https://company.ru' },
    { key: 'status', label: 'Статус компании', placeholder: 'Действующая' },
    { key: 'registration_date', label: 'Дата регистрации', placeholder: '2020-01-15', type: 'date' },
    { key: 'capital', label: 'Уставный капитал (₽)', placeholder: '10000', type: 'number' },
    { key: 'employee_count', label: 'Количество сотрудников', placeholder: '50', type: 'number' },
    { key: 'full_name', label: 'Полное наименование', placeholder: 'Общество с ограниченной ответственностью...' },
    { key: 'short_name', label: 'Краткое наименование', placeholder: 'ООО "Компания"' },
    { key: 'opf', label: 'ОПФ', placeholder: 'ООО' },
    { key: 'postal_code', label: 'Почтовый индекс', placeholder: '123456' },
];

/**
 * Стандартные поля компании (всегда видимы)
 */
export const STANDARD_FIELDS = [
    'name',
    'inn',
    'kpp',
    'ogrn',
    'legal_address',
    'director',
    'bank_bik',
    'bank_name'
];

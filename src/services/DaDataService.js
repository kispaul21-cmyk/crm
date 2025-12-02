/**
 * DaDataService.js
 * 
 * Сервис для работы с DaData API
 * Получает данные о компаниях по ИНН и обрабатывает ответы
 */

const DADATA_API_URL = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party';

/**
 * Получить данные компании по ИНН из DaData
 * @param {string} inn - ИНН компании (10 или 12 цифр)
 * @param {string} apiKey - API ключ DaData
 * @returns {Promise<Object|null>} - Данные компании или null
 */
export async function fetchCompanyByINN(inn, apiKey) {
    if (!inn || !apiKey) {
        console.error('DaData: ИНН и API ключ обязательны');
        return null;
    }

    // Убираем пробелы и нецифровые символы
    const cleanINN = inn.replace(/\D/g, '');

    if (cleanINN.length !== 10 && cleanINN.length !== 12) {
        console.error('DaData: Неверный формат ИНН. Должно быть 10 (юр.лицо) или 12 (ИП) цифр');
        return null;
    }

    try {
        const response = await fetch(DADATA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${apiKey}`
            },
            body: JSON.stringify({ query: cleanINN })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('DaData API Error:', response.status, errorText);
            
            // Обработка типичных ошибок
            if (response.status === 403) {
                throw new Error('Ошибка авторизации. Проверьте API ключ в настройках.');
            }
            if (response.status === 429) {
                throw new Error('Превышен лимит запросов. Попробуйте позже.');
            }
            
            throw new Error(`Ошибка DaData API: ${response.status}`);
        }

        const result = await response.json();

        // Проверяем наличие результатов
        if (!result.suggestions || result.suggestions.length === 0) {
            console.warn('DaData: Компания с таким ИНН не найдена');
            return null;
        }

        // Берём первый результат (самый релевантный)
        const data = result.suggestions[0].data;

        // Преобразуем данные в формат нашей CRM
        return mapDaDataToCompany(data);

    } catch (error) {
        console.error('DaData Service Error:', error);
        throw error;
    }
}

/**
 * Преобразование данных DaData в формат CRM
 * Безопасное извлечение с проверкой на null
 * @param {Object} data - Данные от DaData API
 * @returns {Object} - Объект компании для CRM
 */
function mapDaDataToCompany(data) {
    return {
        // Основная информация
        name: data.name?.short_with_opf || data.name?.short || '',
        full_name: data.name?.full || '',
        short_name: data.name?.short || '',
        opf: data.opf?.short || '',

        // Реквизиты
        inn: data.inn || '',
        kpp: data.kpp || '',
        ogrn: data.ogrn || '',
        okpo: data.okpo || '',
        okved: data.okved || '',

        // Руководство
        director: data.management?.name || '',
        director_name: data.management?.name || '',
        director_post: data.management?.post || '',

        // Адрес
        legal_address: data.address?.unrestricted_value || data.address?.value || '',
        postal_code: data.address?.data?.postal_code || '',

        // Контакты (DaData не всегда возвращает, оставляем пустыми)
        phone: data.phones?.[0]?.data?.number || '',
        email: data.emails?.[0]?.value || '',
        website: '',

        // Статус
        status: data.state?.status || 'UNKNOWN',
        registration_date: data.state?.registration_date 
            ? new Date(data.state.registration_date).toISOString().split('T')[0] 
            : null,

        // Финансовая информация
        employee_count: data.employee_count || null,
        capital: data.capital || null,

        // Метаданные
        dadata_fetched_at: new Date().toISOString(),
        dadata_raw_data: data  // Сохраняем полный ответ для будущего использования
    };
}

/**
 * Получить статус компании (человекочитаемый)
 * @param {string} status - Статус из DaData
 * @returns {string} - Описание статуса
 */
export function getCompanyStatusText(status) {
    const statuses = {
        'ACTIVE': 'Действующая',
        'LIQUIDATING': 'В процессе ликвидации',
        'LIQUIDATED': 'Ликвидирована',
        'REORGANIZING': 'Реорганизуется',
        'BANKRUPT': 'Банкротство',
        'UNKNOWN': 'Неизвестно'
    };

    return statuses[status] || 'Неизвестно';
}

/**
 * Проверка валидности API ключа DaData
 * @param {string} apiKey - API ключ для проверки
 * @returns {Promise<boolean>} - true если ключ валиден
 */
export async function validateApiKey(apiKey) {
    if (!apiKey || apiKey.length < 20) {
        return false;
    }

    try {
        // Пробуем запрос с тестовым ИНН (Сбербанк)
        const response = await fetch(DADATA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${apiKey}`
            },
            body: JSON.stringify({ query: '7707083893' })
        });

        return response.ok;
    } catch (error) {
        console.error('Ошибка проверки API ключа:', error);
        return false;
    }
}

/**
 * Сохранить API ключ DaData в Supabase
 * @param {Object} supabase - Клиент Supabase
 * @param {string} apiKey - API ключ DaData
 * @returns {Promise<Object>} - Результат сохранения
 */
export async function saveDaDataApiKey(supabase, apiKey) {
    // Проверяем валидность ключа перед сохранением
    const isValid = await validateApiKey(apiKey);
    
    if (!isValid) {
        throw new Error('Неверный API ключ DaData');
    }

    // Проверяем, есть ли уже интеграция DaData
    const { data: existing } = await supabase
        .from('integrations')
        .select('*')
        .eq('service_type', 'dadata')
        .single();

    if (existing) {
        // Обновляем существующую
        const { data, error } = await supabase
            .from('integrations')
            .update({
                api_key: apiKey,
                is_active: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', existing.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } else {
        // Создаём новую
        const { data, error } = await supabase
            .from('integrations')
            .insert([{
                name: 'DaData - Автозаполнение компаний',
                service_type: 'dadata',
                api_key: apiKey,
                search_type: 'inn',
                entity_type: 'company',
                trigger_field: 'inn',
                is_active: true
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}

/**
 * Получить API ключ DaData из Supabase
 * @param {Object} supabase - Клиент Supabase
 * @returns {Promise<string|null>} - API ключ или null
 */
export async function getDaDataApiKey(supabase) {
    const { data, error } = await supabase
        .from('integrations')
        .select('api_key, is_active')
        .eq('service_type', 'dadata')
        .eq('is_active', true)
        .single();

    if (error || !data) {
        return null;
    }

    return data.api_key;
}
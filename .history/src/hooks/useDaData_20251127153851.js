import { useState } from 'react';
import { fetchCompanyByINN, getDaDataApiKey } from '../services/DaDataService';
import { supabase } from '../supabase';

/**
 * Хук для работы с DaData API
 * @returns {Object} { fetchByInn, loading, error, data }
 */
export const useDaData = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const fetchByInn = async (inn) => {
        if (!inn || inn.trim().length < 10) {
            setError('ИНН должен содержать 10 или 12 цифр');
            return null;
        }

        setLoading(true);
        setError(null);
        setData(null);

        try {
            const apiKey = await getDaDataApiKey(supabase);

            if (!apiKey) {
                throw new Error('Интеграция DaData не настроена');
            }

            const companyData = await fetchCompanyByINN(inn.trim(), apiKey);

            if (!companyData) {
                throw new Error('Компания с таким ИНН не найдена');
            }

            setData(companyData);
            return companyData;
        } catch (err) {
            setError(err.message);
            console.error('Ошибка DaData:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        fetchByInn,
        loading,
        error,
        data
    };
};

import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

/**
 * Хук для загрузки сделок конкретной компании
 * @param {string} companyId - ID компании
 * @returns {Object} { deals, loading, error, refresh }
 */
export const useCompanyDeals = (companyId) => {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchDeals = async () => {
        if (!companyId) {
            setDeals([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Загружаем сделки
            const { data: dealsData, error: dealsError } = await supabase
                .from('deals')
                .select('*')
                .eq('company_id', companyId)
                .order('created_at', { ascending: false });

            if (dealsError) throw dealsError;

            // Загружаем этапы
            const { data: stagesData, error: stagesError } = await supabase
                .from('stages')
                .select('*');

            if (stagesError) throw stagesError;

            // Объединяем данные
            const dealsWithStages = (dealsData || []).map(deal => ({
                ...deal,
                stage_info: stagesData?.find(s => s.id === deal.stage) || null
            }));

            setDeals(dealsWithStages);
        } catch (err) {
            setError(err.message);
            console.error('Ошибка загрузки сделок компании:', err);
            setDeals([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeals();
    }, [companyId]);

    return {
        deals,
        loading,
        error,
        refresh: fetchDeals
    };
};

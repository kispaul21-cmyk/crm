import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

/**
 * Хук для работы с компаниями
 * @returns {Object} { companies, loading, refresh, create, update, remove }
 */
export const useCompanies = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCompanies = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('companies')
                .select('*')
                .order('name');

            if (error) throw error;
            setCompanies(data || []);
        } catch (err) {
            setError(err.message);
            console.error('Ошибка загрузки компаний:', err);
        } finally {
            setLoading(false);
        }
    };

    const create = async (companyData) => {
        try {
            const { data, error } = await supabase
                .from('companies')
                .insert([companyData])
                .select();

            if (error) throw error;
            await fetchCompanies();
            return data?.[0];
        } catch (err) {
            console.error('Ошибка создания компании:', err);
            throw err;
        }
    };

    const update = async (id, companyData) => {
        try {
            const { error } = await supabase
                .from('companies')
                .update(companyData)
                .eq('id', id);

            if (error) throw error;
            await fetchCompanies();
        } catch (err) {
            console.error('Ошибка обновления компании:', err);
            throw err;
        }
    };

    const remove = async (id) => {
        try {
            const { error } = await supabase
                .from('companies')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchCompanies();
        } catch (err) {
            console.error('Ошибка удаления компании:', err);
            throw err;
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    return {
        companies,
        loading,
        error,
        refresh: fetchCompanies,
        create,
        update,
        remove
    };
};

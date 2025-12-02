import { supabase } from '../../supabase';

/**
 * Сервис для работы с компаниями
 */
export const CompanyService = {
    /**
     * Получить все компании
     */
    async getAll() {
        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .order('name');
        
        if (error) throw error;
        return data || [];
    },

    /**
     * Получить компанию по ID
     */
    async getById(id) {
        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    },

    /**
     * Создать компанию
     */
    async create(companyData) {
        const { data, error } = await supabase
            .from('companies')
            .insert([companyData])
            .select();
        
        if (error) throw error;
        return data?.[0];
    },

    /**
     * Обновить компанию
     */
    async update(id, companyData) {
        const { data, error } = await supabase
            .from('companies')
            .update(companyData)
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return data?.[0];
    },

    /**
     * Удалить компанию
     */
    async delete(id) {
        const { error } = await supabase
            .from('companies')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    },

    /**
     * Найти компанию по ИНН
     */
    async findByInn(inn) {
        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .eq('inn', inn)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
        return data;
    }
};

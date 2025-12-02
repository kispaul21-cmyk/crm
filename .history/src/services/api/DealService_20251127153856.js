import { supabase } from '../../supabase';

/**
 * Сервис для работы со сделками
 */
export const DealService = {
    /**
     * Получить все сделки
     */
    async getAll() {
        const { data, error } = await supabase
            .from('deals')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Получить сделку по ID
     */
    async getById(id) {
        const { data, error } = await supabase
            .from('deals')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Получить сделки компании
     */
    async getByCompany(companyId) {
        const { data, error } = await supabase
            .from('deals')
            .select('*')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Создать сделку
     */
    async create(dealData) {
        const { data, error } = await supabase
            .from('deals')
            .insert([dealData])
            .select();

        if (error) throw error;
        return data?.[0];
    },

    /**
     * Обновить сделку
     */
    async update(id, dealData) {
        const { data, error } = await supabase
            .from('deals')
            .update(dealData)
            .eq('id', id)
            .select();

        if (error) throw error;
        return data?.[0];
    },

    /**
     * Удалить сделку
     */
    async delete(id) {
        const { error } = await supabase
            .from('deals')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * Обновить этап сделки
     */
    async updateStage(id, stageId) {
        return this.update(id, { stage: stageId });
    }
};

import { supabase } from '../lib/supabaseClient';
import { Visit, VisitStatus } from '../types';

const mapToVisit = (data: any): Visit => ({
    id: data.id,
    storeId: data.store_id,
    salesPersonId: data.sales_person_id,
    visitDate: data.visit_date,
    purpose: data.purpose,
    status: data.status,
    notes: data.notes,
    proofOfVisitImage: data.proof_of_visit_image
});

const mapToDb = (data: Partial<Visit>) => {
    const dbData: any = { ...data };
    if (data.storeId !== undefined) dbData.store_id = data.storeId;
    if (data.salesPersonId !== undefined) dbData.sales_person_id = data.salesPersonId;
    if (data.visitDate !== undefined) dbData.visit_date = data.visitDate;
    if (data.proofOfVisitImage !== undefined) dbData.proof_of_visit_image = data.proofOfVisitImage;

    delete dbData.storeId;
    delete dbData.salesPersonId;
    delete dbData.visitDate;
    delete dbData.proofOfVisitImage;
    return dbData;
};

export const getVisits = async (): Promise<Visit[]> => {
    const { data, error } = await supabase.from('visits').select('*');
    if (error) throw new Error(error.message);
    return (data || []).map(mapToVisit);
};

export const createVisit = async (visitData: Omit<Visit, 'id' | 'status'>): Promise<Visit> => {
    const dbPayload = mapToDb({ ...visitData, status: VisitStatus.UPCOMING }); // Default status
    const { data, error } = await supabase.from('visits').insert(dbPayload).select().single();
    if (error) throw new Error(error.message);
    return mapToVisit(data);
};

export const updateVisit = async (payload: { id: string } & Partial<Omit<Visit, 'id'>>): Promise<Visit> => {
    const { id, ...updateData } = payload;
    const dbPayload = mapToDb(updateData);
    const { data, error } = await supabase.from('visits').update(dbPayload).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return mapToVisit(data);
};

export const deleteVisit = async (visitId: string): Promise<void> => {
    const { error } = await supabase.from('visits').delete().eq('id', visitId);
    if (error) throw new Error(error.message);
};
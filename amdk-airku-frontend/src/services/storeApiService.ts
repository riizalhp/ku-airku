import { supabase } from '../lib/supabaseClient';
import { Store, Coordinate } from '../types';

const mapToStore = (data: any): Store => ({
    id: data.id,
    name: data.name,
    address: data.address,
    location: data.location,
    region: data.region,
    owner: data.owner_name,
    phone: data.phone,
    subscribedSince: data.created_at, // Mapping created_at to subscribedSince
    lastOrder: '', // TODO: Fetch from orders or add column
    isPartner: data.is_partner,
    partnerCode: data.partner_code,
});

const mapToDb = (data: Partial<Store>) => {
    const dbData: any = { ...data };
    if (data.owner !== undefined) dbData.owner_name = data.owner;
    if (data.isPartner !== undefined) dbData.is_partner = data.isPartner;
    if (data.partnerCode !== undefined) dbData.partner_code = data.partnerCode;

    delete dbData.owner;
    delete dbData.isPartner;
    delete dbData.partnerCode;
    delete dbData.subscribedSince;
    delete dbData.lastOrder;

    return dbData;
};

export const getStores = async (): Promise<Store[]> => {
    const { data, error } = await supabase.from('stores').select('*');
    if (error) throw new Error(error.message);
    return (data || []).map(mapToStore);
};

export const createStore = async (storeData: Omit<Store, 'id' | 'subscribedSince' | 'lastOrder'>): Promise<Store> => {
    const dbPayload = mapToDb(storeData);
    const { data, error } = await supabase.from('stores').insert(dbPayload).select().single();
    if (error) throw new Error(error.message);
    return mapToStore(data);
};

export const createSalesStore = async (storeData: Omit<Store, 'id' | 'subscribedSince' | 'lastOrder'>): Promise<Store> => {
    // Same as createStore for now, backend logic separation might be needed via Edge Function if complex
    return createStore(storeData);
};

export const updateStore = async (storeData: Store): Promise<Store> => {
    const { id, ...updateData } = storeData;
    const dbPayload = mapToDb(updateData);
    const { data, error } = await supabase.from('stores').update(dbPayload).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return mapToStore(data);
};

export const deleteStore = async (storeId: string): Promise<void> => {
    const { error } = await supabase.from('stores').delete().eq('id', storeId);
    if (error) throw new Error(error.message);
};

export const classifyRegion = async (coords: Coordinate): Promise<{ region: string }> => {
    // Temporary client-side classification or stub
    // Ideal: Supabase Edge Function with PostGIS
    console.warn('classifyRegion is currently a stub in Supabase migration', coords);
    return { region: 'Unknown' };
};
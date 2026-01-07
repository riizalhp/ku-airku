import { supabase } from '../lib/supabaseClient';
import { Vehicle } from '../types';

const mapToVehicle = (data: any): Vehicle => ({
    id: data.id,
    plateNumber: data.plate_number,
    model: data.model,
    capacity: data.capacity,
    status: data.status,
    vehicleType: data.vehicle_type
});

const mapToDb = (data: Partial<Vehicle>) => {
    const dbData: any = { ...data };
    if (data.plateNumber !== undefined) dbData.plate_number = data.plateNumber;
    if (data.vehicleType !== undefined) dbData.vehicle_type = data.vehicleType;

    delete dbData.plateNumber;
    delete dbData.vehicleType;
    return dbData;
};

export const getVehicles = async (): Promise<Vehicle[]> => {
    const { data, error } = await supabase.from('vehicles').select('*');
    if (error) throw new Error(error.message);
    return (data || []).map(mapToVehicle);
};

export const createVehicle = async (vehicleData: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
    const dbPayload = mapToDb(vehicleData);
    const { data, error } = await supabase.from('vehicles').insert(dbPayload).select().single();
    if (error) throw new Error(error.message);
    return mapToVehicle(data);
};

export const updateVehicle = async (vehicleData: Vehicle): Promise<Vehicle> => {
    const { id, ...updateData } = vehicleData;
    const dbPayload = mapToDb(updateData);
    const { data, error } = await supabase.from('vehicles').update(dbPayload).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return mapToVehicle(data);
};

export const deleteVehicle = async (vehicleId: string): Promise<void> => {
    const { error } = await supabase.from('vehicles').delete().eq('id', vehicleId);
    if (error) throw new Error(error.message);
};
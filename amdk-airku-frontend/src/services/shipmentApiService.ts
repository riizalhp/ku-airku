import api from './api';
import { Shipment } from '../types';

export const getShipments = async (filters: { date?: string } = {}): Promise<Shipment[]> => {
    const response = await api.get('/shipments', { params: filters });
    return response.data;
};

export const createShipment = async (payload: { name: string, date: string }): Promise<Shipment> => {
    const response = await api.post('/shipments', payload);
    return response.data;
};

export const addOrderToShipment = async (payload: { shipmentId: string, orderId: string }): Promise<{ success: boolean, message: string }> => {
    const response = await api.post(`/shipments/${payload.shipmentId}/orders`, { orderId: payload.orderId });
    return response.data;
};

export const removeOrderFromShipment = async (payload: { shipmentId: string, orderId: string }): Promise<{ success: boolean, message: string }> => {
    const response = await api.delete(`/shipments/${payload.shipmentId}/orders/${payload.orderId}`);
    return response.data;
};

export const assignShipment = async (payload: { shipmentId: string, vehicleId: string, driverId: string }): Promise<{ success: boolean, message: string, routePlan: any }> => {
    const response = await api.post(`/shipments/${payload.shipmentId}/assign`, {
        vehicleId: payload.vehicleId,
        driverId: payload.driverId
    });
    return response.data;
};

export const deleteShipment = async (shipmentId: string): Promise<void> => {
    await api.delete(`/shipments/${shipmentId}`);
};

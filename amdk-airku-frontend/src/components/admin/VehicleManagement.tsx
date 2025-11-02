import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../ui/Card';
import { ICONS } from '../../constants';
import { Vehicle, VehicleStatus } from '../../types';
import { Modal } from '../ui/Modal';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../../services/vehicleApiService';

export const VehicleManagement: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const initialFormState: Omit<Vehicle, 'id'> = { 
        plateNumber: '', 
        model: '', 
        capacity: 200, 
        status: VehicleStatus.IDLE,
        vehicleType: 'L300'
    };
    const [currentVehicle, setCurrentVehicle] = useState<Omit<Vehicle, 'id'> | Vehicle>(initialFormState);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [apiError, setApiError] = useState<string | null>(null);

    const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
      queryKey: ['vehicles'],
      queryFn: getVehicles,
    });

    const createMutation = useMutation({
        mutationFn: createVehicle,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
            setIsModalOpen(false);
            alert('Armada baru berhasil ditambahkan!');
        },
        onError: (error: any) => setApiError(error.response?.data?.message || 'Gagal membuat data armada.'),
    });

    const updateMutation = useMutation({
        mutationFn: updateVehicle,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
            setIsModalOpen(false);
            alert('Data armada berhasil diperbarui!');
        },
        onError: (error: any) => setApiError(error.response?.data?.message || 'Gagal memperbarui data armada.'),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteVehicle,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
            alert('Armada berhasil dihapus.');
        },
        onError: (error: any) => alert(error.response?.data?.message || 'Gagal menghapus armada.'),
    });

    const filteredVehicles = useMemo(() => {
        return [...vehicles].reverse().filter(vehicle => {
            const term = searchTerm.toLowerCase();
            return vehicle.plateNumber.toLowerCase().includes(term) ||
                   vehicle.model.toLowerCase().includes(term);
        });
    }, [vehicles, searchTerm]);

    const openModalForAdd = () => {
        setIsEditing(false);
        setCurrentVehicle(initialFormState);
        setApiError(null);
        setIsModalOpen(true);
    };

    const openModalForEdit = (vehicle: Vehicle) => {
        setIsEditing(true);
        setCurrentVehicle(vehicle);
        setApiError(null);
        setIsModalOpen(true);
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // Auto-set capacity based on vehicleType
        if (name === 'vehicleType') {
            const capacity = value === 'Cherry Box' ? 170 : 200;
            setCurrentVehicle(prev => ({ 
                ...prev, 
                vehicleType: value,
                capacity: capacity
            }));
        } else {
            setCurrentVehicle(prev => ({ 
                ...prev, 
                [name]: (name === 'capacity') ? parseFloat(value) || 0 : value 
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setApiError(null);
        if (currentVehicle.plateNumber && currentVehicle.model && currentVehicle.capacity > 0) {
            if (isEditing) {
                updateMutation.mutate(currentVehicle as Vehicle);
            } else {
                createMutation.mutate(currentVehicle as Omit<Vehicle, 'id'>);
            }
        }
    };

    const handleDelete = (vehicleId: string) => {
        if (window.confirm('Anda yakin ingin menghapus data armada ini?')) {
            deleteMutation.mutate(vehicleId);
        }
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-brand-dark">Manajemen Armada</h1>
                <button onClick={openModalForAdd} className="flex items-center gap-2 bg-brand-primary text-white font-bold py-2 px-4 rounded-lg">
                    <ICONS.plus /> Tambah Armada
                </button>
            </div>

             <Card>
                <input type="text" placeholder="Cari plat nomor atau model..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="w-full max-w-md p-2 border border-gray-300 rounded-md"
                />
            </Card>

            <Card className="!p-0">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-700">
                        <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                            <tr>
                                <th scope="col" className="px-6 py-3">Plat Nomor</th>
                                <th scope="col" className="px-6 py-3">Model</th>
                                <th scope="col" className="px-6 py-3">Tipe Kendaraan</th>
                                <th scope="col" className="px-6 py-3 text-right">Kapasitas</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (<tr><td colSpan={6} className="text-center p-4">Memuat data...</td></tr>) : 
                             filteredVehicles.map((vehicle) => (
                                <tr key={vehicle.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{vehicle.plateNumber}</td>
                                    <td className="px-6 py-4">{vehicle.model}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                            {vehicle.vehicleType || 'L300'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">{vehicle.capacity} unit</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{vehicle.status}</span></td>
                                    <td className="px-6 py-4 flex justify-center space-x-2">
                                        <button onClick={() => openModalForEdit(vehicle)} className="text-blue-600 hover:text-blue-800 p-1"><ICONS.edit width={20} height={20} /></button>
                                        <button onClick={() => handleDelete(vehicle.id)} disabled={deleteMutation.isPending} className="text-red-600 hover:text-red-800 p-1"><ICONS.trash width={20} height={20} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {!isLoading && filteredVehicles.length === 0 && <p className="text-center text-gray-500 py-6">Tidak ada data armada.</p>}
                </div>
            </Card>

            <Modal title={isEditing ? "Edit Armada" : "Tambah Armada Baru"} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {apiError && <p className="text-sm text-red-600 bg-red-100 p-2 rounded">{apiError}</p>}
                    
                    <div>
                        <label htmlFor="plateNumber" className="block text-sm font-medium text-gray-700">Plat Nomor</label>
                        <input 
                            type="text" 
                            id="plateNumber"
                            name="plateNumber" 
                            placeholder="AB 1234 CD" 
                            value={currentVehicle.plateNumber} 
                            onChange={handleInputChange} 
                            className="mt-1 w-full p-2 border rounded" 
                            required 
                        />
                    </div>

                    <div>
                        <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model Kendaraan</label>
                        <input 
                            type="text" 
                            id="model"
                            name="model" 
                            placeholder="Suzuki APV" 
                            value={currentVehicle.model} 
                            onChange={handleInputChange} 
                            className="mt-1 w-full p-2 border rounded" 
                            required 
                        />
                    </div>

                    <div>
                        <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700">
                            Tipe Kendaraan
                            <span className="text-xs text-gray-500 block mt-0.5">Menentukan kapasitas maksimal</span>
                        </label>
                        <select 
                            id="vehicleType"
                            name="vehicleType" 
                            value={currentVehicle.vehicleType || 'L300'} 
                            onChange={handleInputChange} 
                            className="mt-1 w-full p-2 border rounded bg-white"
                            required
                        >
                            <option value="L300">L300 (Kapasitas: 200 setara 240ml)</option>
                            <option value="Cherry Box">Cherry Box (Kapasitas: 170 setara 240ml)</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                            Kapasitas (Unit Setara 240ml)
                            <span className="text-xs text-gray-500 block mt-0.5">Auto-set berdasarkan tipe kendaraan</span>
                        </label>
                        <input 
                            type="number" 
                            id="capacity"
                            name="capacity" 
                            placeholder="200" 
                            value={currentVehicle.capacity} 
                            onChange={handleInputChange} 
                            className="mt-1 w-full p-2 border rounded bg-gray-50" 
                            readOnly
                        />
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                        <select 
                            id="status"
                            name="status" 
                            value={currentVehicle.status} 
                            onChange={handleInputChange} 
                            className="mt-1 w-full p-2 border rounded bg-white"
                        >
                            {Object.values(VehicleStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="flex justify-end pt-4">
                         <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 py-2 px-4 rounded-lg mr-2">Batal</button>
                        <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-brand-primary text-white py-2 px-4 rounded-lg">
                            {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : "Simpan"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
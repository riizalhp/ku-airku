import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../ui/Card';
import { getVehicles } from '../../services/vehicleApiService';
import { getUsers } from '../../services/userApiService';
import { getShipments, assignShipment, deleteShipment, createShipment, removeOrderFromShipment } from '../../services/shipmentApiService';
import { getOrders } from '../../services/orderApiService';
import { getProducts } from '../../services/productApiService';
import { VehicleStatus, Vehicle, User, Order, Product, Shipment, Role } from '../../types';
import { Modal } from '../ui/Modal';
import { ICONS } from '../../constants';

const OrderStatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const statusInfo = useMemo(() => {
        const statusMap: Record<string, { text: string; className: string }> = {
            'Pending': { text: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
            'Routed': { text: 'Routed', className: 'bg-cyan-100 text-cyan-800' },
            'Delivering': { text: 'Delivering', className: 'bg-indigo-100 text-indigo-800' },
            'Failed': { text: 'Failed', className: 'bg-red-100 text-red-800' },
            'Delivered': { text: 'Delivered', className: 'bg-green-100 text-green-800' },
        };
        return statusMap[status] || { text: status, className: 'bg-gray-100 text-gray-800' };
    }, [status]);
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.className}`}>{statusInfo.text}</span>;
};

const ShipmentStatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const statusInfo = useMemo(() => {
        const statusMap: Record<string, { text: string; className: string }> = {
            'unassigned': { text: 'Belum Ditugaskan', className: 'bg-yellow-100 text-yellow-800' },
            'assigned': { text: 'Sudah Ditugaskan', className: 'bg-blue-100 text-blue-800' },
            'departed': { text: 'Sudah Berangkat', className: 'bg-green-100 text-green-800' },
            'completed': { text: 'Selesai', className: 'bg-gray-100 text-gray-800' },
        };
        return statusMap[status] || { text: status, className: 'bg-gray-100 text-gray-800' };
    }, [status]);
    return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.className}`}>{statusInfo.text}</span>;
};

interface AssignmentModalProps {
    shipment: Shipment | null;
    onClose: () => void;
    vehicles: Vehicle[];
    users: User[];
    mutation: any;
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({ shipment, onClose, vehicles, users, mutation }) => {
    const [vehicleId, setVehicleId] = useState('');
    const [driverId, setDriverId] = useState('');

    const availableVehicles = useMemo(() => {
        return vehicles.filter(v => v.status === VehicleStatus.IDLE);
    }, [vehicles]);

    const availableDrivers = useMemo(() => {
        return users.filter(u => u.role === Role.DRIVER);
    }, [users]);

    const handleSubmit = () => {
        if (!vehicleId || !driverId) {
            alert('Harap pilih armada dan driver');
            return;
        }
        if (!shipment) return;
        
        mutation.mutate({
            shipmentId: shipment.id,
            vehicleId,
            driverId
        });
    };

    if (!shipment) return null;

    return (
        <Modal title={`Tugaskan Muatan: ${shipment.name}`} isOpen={!!shipment} onClose={onClose}>
            <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">
                        <strong>Total Pesanan:</strong> {shipment.orders.length} pesanan
                    </p>
                    <p className="text-sm text-gray-700">
                        <strong>Tanggal:</strong> {new Date(shipment.date).toLocaleDateString('id-ID')}
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Pilih Armada</label>
                    <select 
                        value={vehicleId} 
                        onChange={(e) => setVehicleId(e.target.value)}
                        className="w-full p-2 border rounded bg-white"
                    >
                        <option value="">-- Pilih Armada --</option>
                        {availableVehicles.map(v => (
                            <option key={v.id} value={v.id}>
                                {v.plateNumber} - {v.model} (Kapasitas: {v.capacity} unit)
                            </option>
                        ))}
                    </select>
                    {availableVehicles.length === 0 && (
                        <p className="text-xs text-red-600 mt-1">⚠️ Tidak ada armada idle yang tersedia</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Pilih Driver</label>
                    <select 
                        value={driverId} 
                        onChange={(e) => setDriverId(e.target.value)}
                        className="w-full p-2 border rounded bg-white"
                    >
                        <option value="">-- Pilih Driver --</option>
                        {availableDrivers.map(d => (
                            <option key={d.id} value={d.id}>
                                {d.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                        <strong>ℹ️ Info:</strong> Setelah ditugaskan, sistem akan otomatis membuat rute optimal untuk perjalanan ini.
                    </p>
                </div>

                <div className="flex justify-end pt-4 gap-2">
                    <button onClick={onClose} className="bg-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition">
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={mutation.isPending || !vehicleId || !driverId}
                        className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 hover:bg-brand-dark transition"
                    >
                        {mutation.isPending ? 'Menugaskan...' : 'Tugaskan & Buat Rute'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export const FleetManagement: React.FC = () => {
    const today = new Date().toISOString().split('T')[0];
    const queryClient = useQueryClient();
    
    const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newShipmentName, setNewShipmentName] = useState('');
    const [newShipmentDate, setNewShipmentDate] = useState(today);

    const { data: vehicles = [] } = useQuery<Vehicle[]>({ queryKey: ['vehicles'], queryFn: getVehicles });
    const { data: users = [] } = useQuery<User[]>({ queryKey: ['users'], queryFn: getUsers });
    const { data: shipments = [], isLoading } = useQuery<Shipment[]>({ 
        queryKey: ['shipments', { date: today }], 
        queryFn: () => getShipments({ date: today }) 
    });
    const { data: orders = [] } = useQuery<Order[]>({ queryKey: ['orders'], queryFn: getOrders });
    const { data: products = [] } = useQuery<Product[]>({ queryKey: ['products'], queryFn: getProducts });

    const createShipmentMutation = useMutation({
        mutationFn: createShipment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
            setIsCreateModalOpen(false);
            setNewShipmentName('');
            setNewShipmentDate(today);
            alert('Muatan baru berhasil dibuat!');
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Gagal membuat muatan.');
        }
    });

    const assignShipmentMutation = useMutation({
        mutationFn: assignShipment,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
            queryClient.invalidateQueries({ queryKey: ['deliveryRoutes'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
            setSelectedShipment(null);
            alert(data.message || 'Muatan berhasil ditugaskan dan rute telah dibuat!');
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Gagal menugaskan muatan.');
        }
    });

    const deleteShipmentMutation = useMutation({
        mutationFn: deleteShipment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            alert('Muatan berhasil dihapus.');
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Gagal menghapus muatan.');
        }
    });

    const removeOrderMutation = useMutation({
        mutationFn: removeOrderFromShipment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            alert('Pesanan berhasil dihapus dari muatan.');
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Gagal menghapus pesanan.');
        }
    });

    const shipmentsWithDetails = useMemo(() => {
        if (!shipments.length || !products.length) return [];

        return shipments.map(shipment => {
            const ordersWithLoad = shipment.orders.map(order => {
                const load = order.items.reduce((sum, item) => {
                    const product = products.find(p => p.id === item.productId);
                    return sum + (item.quantity * (product?.capacityUnit || 0));
                }, 0);
                return { ...order, load: Math.round(load * 10) / 10 };
            });

            const totalLoad = ordersWithLoad.reduce((sum, order) => sum + order.load, 0);
            
            const driver = shipment.driverId ? users.find(u => u.id === shipment.driverId) : null;
            const vehicle = shipment.vehicleId ? vehicles.find(v => v.id === shipment.vehicleId) : null;

            return {
                ...shipment,
                orders: ordersWithLoad,
                totalLoad: Math.round(totalLoad * 10) / 10,
                driver,
                vehicle
            };
        });
    }, [shipments, orders, products, users, vehicles]);

    const handleCreateShipment = () => {
        if (!newShipmentName.trim()) {
            alert('Harap isi nama muatan');
            return;
        }
        createShipmentMutation.mutate({
            name: newShipmentName,
            date: newShipmentDate
        });
    };

    const handleDeleteShipment = (shipmentId: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus muatan ini? Semua pesanan akan dikembalikan ke status pending.')) {
            deleteShipmentMutation.mutate(shipmentId);
        }
    };

    const handleRemoveOrder = (shipmentId: string, orderId: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus pesanan ini dari muatan?')) {
            removeOrderMutation.mutate({ shipmentId, orderId });
        }
    };

    if (isLoading) {
        return <div className="p-8">Memuat data muatan...</div>;
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-brand-dark">Manajemen Muatan & Armada</h1>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-brand-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-brand-dark transition"
                >
                    <ICONS.plus />
                    Buat Muatan Baru
                </button>
            </div>

            <Card className="bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 text-brand-primary pt-1">
                        <ICONS.orders className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-md font-bold text-brand-dark">Flow Manajemen Muatan</h3>
                        <ol className="text-sm text-gray-700 mt-2 ml-4 list-decimal space-y-1">
                            <li><strong>Buat Muatan Baru</strong> - Buat container untuk group pesanan</li>
                            <li><strong>Tambah Pesanan</strong> - Dari halaman Manajemen Pesanan, assign pesanan ke muatan</li>
                            <li><strong>Tugaskan Driver & Armada</strong> - Klik tombol "Tugaskan" untuk assign dan membuat rute</li>
                            <li><strong>Rute Otomatis Dibuat</strong> - Sistem membuat rute optimal setelah penugasan</li>
                        </ol>
                    </div>
                </div>
            </Card>

            {shipmentsWithDetails.length === 0 ? (
                <Card>
                    <p className="text-center py-10 text-gray-500">
                        Belum ada muatan untuk hari ini. Klik "Buat Muatan Baru" untuk memulai.
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {shipmentsWithDetails.map(shipment => (
                        <Card key={shipment.id} className="flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="font-bold text-lg text-brand-primary">{shipment.name}</h2>
                                    <p className="text-sm text-gray-500">
                                        {new Date(shipment.date).toLocaleDateString('id-ID', { 
                                            weekday: 'long', 
                                            day: 'numeric', 
                                            month: 'long' 
                                        })}
                                    </p>
                                    {shipment.region && (
                                        <p className="text-xs text-gray-600 mt-1">
                                            <strong>Wilayah:</strong> {shipment.region}
                                        </p>
                                    )}
                                </div>
                                <ShipmentStatusBadge status={shipment.status} />
                            </div>

                            {shipment.vehicle && shipment.driver && (
                                <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-4">
                                    <p className="text-sm text-gray-700">
                                        <strong>Driver:</strong> {shipment.driver.name}
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        <strong>Armada:</strong> {shipment.vehicle.plateNumber} ({shipment.vehicle.model})
                                    </p>
                                </div>
                            )}

                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-semibold">Total Muatan</span>
                                    <span>
                                        {shipment.totalLoad} / {shipment.vehicle?.capacity || '?'} unit
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4 relative">
                                    <div 
                                        className={`h-4 rounded-full ${
                                            shipment.vehicle && shipment.totalLoad > shipment.vehicle.capacity 
                                                ? 'bg-red-500' 
                                                : 'bg-brand-primary'
                                        }`}
                                        style={{ 
                                            width: `${
                                                shipment.vehicle 
                                                    ? Math.min((shipment.totalLoad / shipment.vehicle.capacity) * 100, 100)
                                                    : 50
                                            }%` 
                                        }}
                                    ></div>
                                </div>
                                {shipment.vehicle && shipment.totalLoad > shipment.vehicle.capacity && (
                                    <p className="text-red-500 text-xs text-right mt-1 font-semibold">
                                        ⚠️ Kapasitas terlampaui!
                                    </p>
                                )}
                            </div>

                            <div className="flex-grow">
                                <h3 className="font-semibold text-sm text-gray-700 mb-2">
                                    Daftar Pesanan ({shipment.orders.length})
                                </h3>
                                {shipment.orders.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic text-center py-4">
                                        Belum ada pesanan. Tambahkan dari halaman Manajemen Pesanan.
                                    </p>
                                ) : (
                                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                        {shipment.orders.map(order => (
                                            <div key={order.id} className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                                <div className="flex-grow">
                                                    <p className="font-semibold text-gray-800">{order.storeName}</p>
                                                    <p className="text-xs text-gray-500">
                                                        ID: {order.id.slice(0, 8)} | Load: {order.load} unit
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <OrderStatusBadge status={order.status} />
                                                    {shipment.status === 'unassigned' && (
                                                        <button
                                                            onClick={() => handleRemoveOrder(shipment.id, order.id)}
                                                            className="text-red-600 hover:text-red-800 p-1"
                                                            title="Hapus dari muatan"
                                                        >
                                                            <ICONS.trash className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t flex gap-2">
                                {shipment.status === 'unassigned' && (
                                    <>
                                        <button
                                            onClick={() => setSelectedShipment(shipment)}
                                            disabled={shipment.orders.length === 0}
                                            className="flex-1 bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-dark transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            <ICONS.fleet className="inline w-4 h-4 mr-2" />
                                            Tugaskan
                                        </button>
                                        <button
                                            onClick={() => handleDeleteShipment(shipment.id)}
                                            className="bg-red-100 text-red-700 font-bold py-2 px-4 rounded-lg hover:bg-red-200 transition"
                                        >
                                            <ICONS.trash className="inline w-4 h-4" />
                                        </button>
                                    </>
                                )}
                                {shipment.status === 'assigned' && (
                                    <button
                                        className="flex-1 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition"
                                    >
                                        🚚 Berangkatkan
                                    </button>
                                )}
                                {(shipment.status === 'departed' || shipment.status === 'completed') && (
                                    <button
                                        className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg cursor-not-allowed"
                                        disabled
                                    >
                                        {shipment.status === 'departed' ? 'Sedang Berjalan' : 'Selesai'}
                                    </button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Shipment Modal */}
            <Modal 
                title="Buat Muatan Baru" 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700">
                            Nama Muatan
                        </label>
                        <input
                            type="text"
                            value={newShipmentName}
                            onChange={(e) => setNewShipmentName(e.target.value)}
                            placeholder="Contoh: Pengiriman Bantul 29 Okt"
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700">
                            Tanggal
                        </label>
                        <input
                            type="date"
                            value={newShipmentDate}
                            onChange={(e) => setNewShipmentDate(e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                        <p className="text-sm text-gray-700">
                            <strong>ℹ️ Info:</strong> Setelah muatan dibuat, Anda dapat menambahkan pesanan dari halaman Manajemen Pesanan.
                        </p>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            onClick={() => setIsCreateModalOpen(false)}
                            className="bg-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleCreateShipment}
                            disabled={createShipmentMutation.isPending}
                            className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 hover:bg-brand-dark transition"
                        >
                            {createShipmentMutation.isPending ? 'Membuat...' : 'Buat Muatan'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Assignment Modal */}
            <AssignmentModal
                shipment={selectedShipment}
                onClose={() => setSelectedShipment(null)}
                vehicles={vehicles}
                users={users}
                mutation={assignShipmentMutation}
            />
        </div>
    );
};

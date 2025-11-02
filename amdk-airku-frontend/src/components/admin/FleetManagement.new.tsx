import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tantml:query';
import { Card } from '../ui/Card';
import { getVehicles } from '../../services/vehicleApiService';
import { getUsers } from '../../services/userApiService';
import { getDeliveryRoutes, assignDriverVehicle } from '../../services/routeApiService';
import { Vehicle, User, RoutePlan, Role } from '../../types';
import { Modal } from '../ui/Modal';
import { ICONS } from '../../constants';
import { getDistance } from '../../utils/geolocation';

const RouteStatusBadge: React.FC<{ driverId?: string; vehicleId?: string }> = ({ driverId, vehicleId }) => {
    if (driverId && vehicleId) {
        return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">Sudah Ditugaskan</span>;
    }
    return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">Belum Ditugaskan</span>;
};

interface AssignModalProps {
    route: RoutePlan | null;
    onClose: () => void;
    vehicles: Vehicle[];
    users: User[];
}

const AssignModal: React.FC<AssignModalProps> = ({ route, onClose, vehicles, users }) => {
    const queryClient = useQueryClient();
    const [vehicleId, setVehicleId] = useState('');
    const [driverId, setDriverId] = useState('');
    const [error, setError] = useState('');

    const availableVehicles = useMemo(() => {
        return vehicles.filter(v => v.status === 'Idle');
    }, [vehicles]);

    const availableDrivers = useMemo(() => {
        return users.filter(u => u.role === Role.DRIVER);
    }, [users]);

    const assignMutation = useMutation({
        mutationFn: ({ routeId, vehicleId, driverId }: { routeId: string; vehicleId: string; driverId: string }) => 
            assignDriverVehicle(routeId, vehicleId, driverId),
        onSuccess: () => {
            alert('Rute berhasil ditugaskan!');
            queryClient.invalidateQueries({ queryKey: ['deliveryRoutes'] });
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
            onClose();
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Gagal menugaskan rute.');
        },
    });

    const handleSubmit = () => {
        if (!vehicleId || !driverId) {
            setError('Harap pilih armada dan driver');
            return;
        }
        if (!route) return;
        
        setError('');
        assignMutation.mutate({
            routeId: route.id,
            vehicleId,
            driverId
        });
    };

    if (!route) return null;

    return (
        <Modal title="Tugaskan Armada & Driver" isOpen={!!route} onClose={onClose}>
            <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">
                        <strong>Wilayah:</strong> {route.region}
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                        <strong>Total Pemberhentian:</strong> {route.stops.length} toko
                    </p>
                    <p className="text-sm text-gray-700">
                        <strong>Tanggal:</strong> {new Date(route.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

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
                        <p className="text-sm text-red-600 mt-1">Tidak ada armada yang tersedia (Idle).</p>
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
                        {availableDrivers.map(u => (
                            <option key={u.id} value={u.id}>
                                {u.name}
                            </option>
                        ))}
                    </select>
                    {availableDrivers.length === 0 && (
                        <p className="text-sm text-red-600 mt-1">Tidak ada driver yang tersedia.</p>
                    )}
                </div>

                <div className="flex justify-end pt-4 gap-2">
                    <button 
                        onClick={onClose} 
                        className="bg-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={assignMutation.isPending || !vehicleId || !driverId}
                        className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 hover:bg-brand-dark transition"
                    >
                        {assignMutation.isPending ? 'Menugaskan...' : 'Tugaskan'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export const FleetManagement: React.FC = () => {
    const today = new Date().toISOString().split('T')[0];
    const queryClient = useQueryClient();
    const [selectedDate, setSelectedDate] = useState(today);
    const [selectedRoute, setSelectedRoute] = useState<RoutePlan | null>(null);
    const [expandedRouteIds, setExpandedRouteIds] = useState<string[]>([]);

    const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({ 
        queryKey: ['vehicles'], 
        queryFn: getVehicles 
    });
    
    const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({ 
        queryKey: ['users'], 
        queryFn: getUsers 
    });
    
    const { data: routes = [], isLoading: isLoadingRoutes } = useQuery<RoutePlan[]>({ 
        queryKey: ['deliveryRoutes', { date: selectedDate }], 
        queryFn: () => getDeliveryRoutes({ date: selectedDate }) 
    });

    const isLoading = isLoadingVehicles || isLoadingUsers || isLoadingRoutes;

    // Calculate total distance for each route
    const routesWithDistance = useMemo(() => {
        const depotLocation = { lat: -7.8664161, lng: 110.1486773 }; // PDAM Tirta Binangun
        
        return routes.map(route => {
            let totalDistance = 0;
            let lastLocation = depotLocation;

            route.stops.forEach(stop => {
                const distance = getDistance(lastLocation, stop.location);
                totalDistance += distance;
                lastLocation = stop.location;
            });

            // Add return distance to depot
            totalDistance += getDistance(lastLocation, depotLocation);

            return {
                ...route,
                totalDistance: Math.round(totalDistance * 10) / 10
            };
        });
    }, [routes]);

    const toggleExpand = (routeId: string) => {
        setExpandedRouteIds(prev =>
            prev.includes(routeId) ? prev.filter(id => id !== routeId) : [...prev, routeId]
        );
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-brand-dark">Manajemen Muatan & Armada</h1>
            </div>

            <Card>
                <div className="flex items-center gap-4">
                    <label className="text-sm font-semibold">Pilih Tanggal:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="p-2 border rounded-md"
                    />
                    <span className="text-sm text-gray-600">
                        {routes.length} rute ditemukan
                    </span>
                </div>
            </Card>

            {isLoading ? (
                <Card>
                    <p className="text-center py-10 text-gray-500">Memuat rute...</p>
                </Card>
            ) : routesWithDistance.length === 0 ? (
                <Card>
                    <div className="text-center py-10">
                        <ICONS.route className="mx-auto mb-4 text-gray-400" width={48} height={48} />
                        <p className="text-gray-500 mb-2">Belum ada rute untuk tanggal ini.</p>
                        <p className="text-sm text-gray-400">
                            Buat rute optimal dari halaman <strong>Manajemen Pesanan</strong> terlebih dahulu.
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {routesWithDistance.map((route) => {
                        const driver = users.find(u => u.id === route.driverId);
                        const vehicle = vehicles.find(v => v.id === route.vehicleId);
                        const isExpanded = expandedRouteIds.includes(route.id);
                        const isAssigned = !!route.driverId && !!route.vehicleId;

                        return (
                            <Card key={route.id} className={isAssigned ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-yellow-500'}>
                                <div className="space-y-3">
                                    {/* Header */}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold text-brand-dark">{route.region}</h3>
                                            <p className="text-sm text-gray-600">
                                                {route.stops.length} Pemberhentian
                                            </p>
                                        </div>
                                        <RouteStatusBadge driverId={route.driverId} vehicleId={route.vehicleId} />
                                    </div>

                                    {/* Distance */}
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <p className="text-sm font-semibold text-gray-700">
                                            <ICONS.mapPin className="inline mr-1" width={16} height={16} />
                                            Jarak Total: <span className="text-brand-primary">{route.totalDistance} km</span>
                                        </p>
                                    </div>

                                    {/* Assignment Info */}
                                    {isAssigned ? (
                                        <div className="border-t pt-3">
                                            <p className="text-sm text-gray-700 mb-1">
                                                <strong>Driver:</strong> {driver?.name || '-'}
                                            </p>
                                            <p className="text-sm text-gray-700">
                                                <strong>Armada:</strong> {vehicle?.plateNumber || '-'} ({vehicle?.model || '-'})
                                            </p>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setSelectedRoute(route)}
                                            className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-dark transition"
                                        >
                                            <ICONS.fleet className="inline mr-2" width={18} height={18} />
                                            Tugaskan Armada
                                        </button>
                                    )}

                                    {/* Expand/Collapse */}
                                    <button
                                        onClick={() => toggleExpand(route.id)}
                                        className="w-full text-sm text-brand-primary font-semibold hover:underline mt-2"
                                    >
                                        {isExpanded ? 'Sembunyikan Detail' : 'Lihat Detail Pemberhentian'}
                                    </button>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="border-t pt-3 mt-3">
                                            <h4 className="font-semibold text-gray-800 mb-2">Daftar Pemberhentian:</h4>
                                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                                {route.stops.map((stop, index) => (
                                                    <div key={stop.id} className="bg-gray-50 p-2 rounded text-sm">
                                                        <p className="font-semibold text-gray-700">
                                                            {index + 1}. {stop.storeName}
                                                        </p>
                                                        <p className="text-gray-600 text-xs">
                                                            Pesanan: {stop.orderId.slice(-6).toUpperCase()}
                                                        </p>
                                                        <p className="text-gray-600 text-xs">
                                                            Status: <span className={`font-semibold ${stop.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                                                                {stop.status === 'completed' ? 'Selesai' : 'Pending'}
                                                            </span>
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Assignment Modal */}
            {selectedRoute && (
                <AssignModal
                    route={selectedRoute}
                    onClose={() => setSelectedRoute(null)}
                    vehicles={vehicles}
                    users={users}
                />
            )}
        </div>
    );
};

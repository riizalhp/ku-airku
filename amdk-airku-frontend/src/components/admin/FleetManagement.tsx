import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../ui/Card';
import { getVehicles } from '../../services/vehicleApiService';
import { getUsers } from '../../services/userApiService';
import { getDeliveryRoutes, assignDriverVehicle, deleteDeliveryRoute, unassignDriverVehicle } from '../../services/routeApiService';
import { getOrders } from '../../services/orderApiService';
import { getProducts } from '../../services/productApiService';
import { Vehicle, User, RoutePlan, Role, Order, Product } from '../../types';
import { Modal } from '../ui/Modal';
import { ICONS } from '../../constants';
import { getDistance } from '../../utils/geolocation';

interface RouteWithCapacity extends RoutePlan {
    totalDistance: number;
    capacityUsed: number;
}

const RouteStatusBadge: React.FC<{ driverId?: string | null; vehicleId?: string | null }> = ({ driverId, vehicleId }) => {
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
            assignDriverVehicle({ routeId, vehicleId, driverId }),
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
    const queryClient = useQueryClient();
    const today = new Date().toISOString().split('T')[0];
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

    const { data: orders = [], isLoading: isLoadingOrders } = useQuery<Order[]>({
        queryKey: ['orders'],
        queryFn: getOrders
    });

    const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: getProducts
    });

    const deleteMutation = useMutation({
        mutationFn: deleteDeliveryRoute,
        onSuccess: () => {
            alert('Rute berhasil dibatalkan. Pesanan dikembalikan ke status Pending.');
            queryClient.invalidateQueries({ queryKey: ['deliveryRoutes'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Gagal membatalkan rute.');
        },
    });

    const unassignMutation = useMutation({
        mutationFn: unassignDriverVehicle,
        onSuccess: () => {
            alert('Penugasan rute berhasil dibatalkan. Rute kembali ke status belum ditugaskan.');
            queryClient.invalidateQueries({ queryKey: ['deliveryRoutes'] });
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Gagal membatalkan penugasan rute.');
        },
    });

    const isLoading = isLoadingVehicles || isLoadingUsers || isLoadingRoutes || isLoadingOrders || isLoadingProducts;

    const handleCancelRoute = (routeId: string, routeRegion: string) => {
        const confirmed = window.confirm(
            `Apakah Anda yakin ingin membatalkan rute untuk wilayah ${routeRegion}?\n\n` +
            `Pesanan dalam rute ini akan dikembalikan ke status Pending.`
        );
        
        if (confirmed) {
            deleteMutation.mutate(routeId);
        }
    };

    const handleUnassignRoute = (routeId: string, routeRegion: string) => {
        const confirmed = window.confirm(
            `Apakah Anda yakin ingin membatalkan penugasan rute wilayah ${routeRegion}?\n\n` +
            `Driver dan armada akan dilepas dari rute ini, tetapi rute tetap ada dan pesanan tetap dalam status Routed.`
        );
        
        if (confirmed) {
            unassignMutation.mutate(routeId);
        }
    };

    // Calculate total distance for each route
    const routesWithDistance = useMemo<RouteWithCapacity[]>(() => {
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

            // Calculate capacity usage dengan logika homogen/heterogen
            let totalCapacityUsed = 0;
            const allProductsInRoute: string[] = [];
            
            // Collect all products from all stops in this route
            route.stops.forEach(stop => {
                const order = orders.find(o => o.id === stop.orderId);
                if (order && order.items) {
                    order.items.forEach(item => {
                        allProductsInRoute.push(item.productId);
                    });
                }
            });

            // Determine if route is homogeneous
            const uniqueProductIds = new Set(allProductsInRoute);
            const isHomogeneous = uniqueProductIds.size === 1 || allProductsInRoute.length === 1;
            
            console.log(`Route ${route.id} (${route.region}):`, {
                totalItems: allProductsInRoute.length,
                uniqueProducts: uniqueProductIds.size,
                isHomogeneous: isHomogeneous
            });

            // Calculate capacity with correct logic
            route.stops.forEach(stop => {
                const order = orders.find(o => o.id === stop.orderId);
                if (order && order.items) {
                    order.items.forEach(item => {
                        const product = products.find(p => p.id === item.productId);
                        if (product) {
                            // PERBAIKAN: Gunakan logika homogen/heterogen
                            const conversionRate = isHomogeneous 
                                ? (product.capacityUnit || 1.0)  // Homogen: gunakan capacityUnit
                                : (product.capacityConversionHeterogeneous || 1.0); // Heterogen: gunakan conversion
                            
                            totalCapacityUsed += item.quantity * conversionRate;
                            
                            console.log(`  - ${product.name}: ${item.quantity} × ${conversionRate} = ${item.quantity * conversionRate}`);
                        }
                    });
                }
            });

            console.log(`  Total capacity: ${totalCapacityUsed} (${isHomogeneous ? 'HOMOGEN' : 'HETEROGEN'})`);

            return {
                ...route,
                totalDistance: Math.round(totalDistance * 10) / 10,
                capacityUsed: Math.round(totalCapacityUsed * 10) / 10
            };
        });
    }, [routes, orders, products]);

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

                                    {/* Total Load Display - For Both Assigned and Unassigned */}
                                    <div className={`p-3 rounded-lg ${isAssigned ? 'bg-green-50' : 'bg-purple-50'}`}>
                                        <p className="text-sm font-semibold text-gray-700 mb-1">
                                            <ICONS.product className="inline mr-1" width={16} height={16} />
                                            Total Muatan:
                                        </p>
                                        <p className="text-lg font-bold text-brand-dark">
                                            {route.capacityUsed || 0} unit
                                        </p>
                                        {!isAssigned && (
                                            <p className="text-xs text-gray-600 mt-1">
                                                (Unit equivalen - sudah disesuaikan dengan jenis muatan)
                                            </p>
                                        )}
                                    </div>

                                    {/* Capacity Usage - Only for Assigned Routes with Vehicle */}
                                    {isAssigned && vehicle && (
                                        <div className="bg-green-50 p-3 rounded-lg border-t-2 border-green-200">
                                            <p className="text-sm font-semibold text-gray-700 mb-2">
                                                Kapasitas Armada {vehicle.plateNumber}:
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                                                    <div 
                                                        className={`h-2.5 rounded-full ${
                                                            (route.capacityUsed || 0) > vehicle.capacity 
                                                                ? 'bg-red-600' 
                                                                : (route.capacityUsed || 0) > vehicle.capacity * 0.9 
                                                                ? 'bg-yellow-500' 
                                                                : 'bg-green-600'
                                                        }`}
                                                        style={{ width: `${Math.min(((route.capacityUsed || 0) / vehicle.capacity) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                                                    {route.capacityUsed || 0} / {vehicle.capacity}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {(((route.capacityUsed || 0) / vehicle.capacity) * 100).toFixed(1)}% terisi
                                                {(route.capacityUsed || 0) > vehicle.capacity && (
                                                    <span className="text-red-600 font-semibold"> (Overload!)</span>
                                                )}
                                            </p>
                                        </div>
                                    )}

                                    {/* Assignment Info */}
                                    {isAssigned ? (
                                        <div className="border-t pt-3">
                                            <p className="text-sm text-gray-700 mb-1">
                                                <strong>Driver:</strong> {driver?.name || '-'}
                                            </p>
                                            <p className="text-sm text-gray-700">
                                                <strong>Armada:</strong> {vehicle?.plateNumber || '-'} ({vehicle?.model || '-'})
                                            </p>
                                            
                                            {/* Unassign button - Only if not departed/completed */}
                                            {route.assignmentStatus !== 'departed' && route.assignmentStatus !== 'completed' && (
                                                <button
                                                    onClick={() => handleUnassignRoute(route.id, route.region)}
                                                    disabled={unassignMutation.isPending}
                                                    className="w-full bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition mt-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                >
                                                    <ICONS.trash className="inline mr-2" width={18} height={18} />
                                                    {unassignMutation.isPending ? 'Membatalkan...' : 'Batal Tugaskan'}
                                                </button>
                                            )}
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

                                    {/* Cancel Route Button - Only for unassigned routes */}
                                    {(!route.driverId && !route.vehicleId) && (
                                        <button
                                            onClick={() => handleCancelRoute(route.id, route.region)}
                                            disabled={deleteMutation.isPending}
                                            className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition mt-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            <ICONS.trash className="inline mr-2" width={18} height={18} />
                                            {deleteMutation.isPending ? 'Membatalkan...' : 'Batalkan Rute'}
                                        </button>
                                    )}

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="border-t pt-3 mt-3">
                                            <h4 className="font-semibold text-gray-800 mb-3">Daftar Pemberhentian:</h4>
                                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                                {route.stops.map((stop, index) => {
                                                    const order = orders.find(o => o.id === stop.orderId);
                                                    
                                                    return (
                                                        <div key={stop.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                            {/* Stop Header */}
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div className="flex-1">
                                                                    <p className="font-bold text-gray-800 text-sm">
                                                                        {index + 1}. {stop.storeName}
                                                                    </p>
                                                                    <p className="text-gray-600 text-xs mt-0.5">
                                                                        ID Pesanan: {stop.orderId.slice(-6).toUpperCase()}
                                                                    </p>
                                                                </div>
                                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                                    stop.status === 'Completed' 
                                                                        ? 'bg-green-100 text-green-700' 
                                                                        : 'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                    {stop.status === 'Completed' ? 'Selesai' : 'Pending'}
                                                                </span>
                                                            </div>
                                                            
                                                            {/* Order Details */}
                                                            {order && order.items && order.items.length > 0 && (
                                                                <div className="mt-2 pt-2 border-t border-gray-300">
                                                                    <p className="text-xs font-semibold text-gray-700 mb-2">Detail Pesanan:</p>
                                                                    <div className="space-y-1.5">
                                                                        {order.items.map((item) => {
                                                                            const product = products.find(p => p.id === item.productId);
                                                                            if (!product) return null;
                                                                            
                                                                            return (
                                                                                <div key={item.productId} className="bg-white p-2 rounded text-xs">
                                                                                    <div className="flex justify-between items-start">
                                                                                        <span className="font-medium text-gray-800 flex-1">
                                                                                            {product.name}
                                                                                        </span>
                                                                                        <span className="text-gray-600 ml-2">
                                                                                            {item.quantity} pcs
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="text-gray-500 mt-0.5">
                                                                                        Rp {(item.specialPrice || item.originalPrice).toLocaleString('id-ID')} / pcs
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                    
                                                                    {/* Order Total */}
                                                                    <div className="mt-2 pt-2 border-t border-gray-300 flex justify-between items-center">
                                                                        <span className="text-xs font-semibold text-gray-700">Total Pesanan:</span>
                                                                        <span className="text-xs font-bold text-brand-primary">
                                                                            Rp {order.totalAmount.toLocaleString('id-ID')}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
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

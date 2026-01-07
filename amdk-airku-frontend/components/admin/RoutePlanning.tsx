



import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../ui/Card';
import { Role, RoutePlan, Vehicle, VehicleStatus, SalesVisitRoutePlan, User, SalesVisitStop, RouteStop, Coordinate } from '../../types';
import { ICONS } from '../../constants';
import { Modal } from '../ui/Modal';
import { getVehicles } from '../../services/vehicleApiService';
import { getUsers } from '../../services/userApiService';
import { createDeliveryRoute, getDeliveryRoutes, deleteDeliveryRoute, createSalesRoute, getSalesRoutes, deleteSalesRoute } from '../../services/routeApiService';
import { RouteMap } from '../ui/RouteMap';
import { getDistance } from '../../utils/geolocation';

type PlanningTab = 'delivery' | 'salesVisit';

const getStatusClass = (status: VehicleStatus) => {
    switch (status) {
        case VehicleStatus.IDLE: return 'bg-green-100 text-green-800';
        case VehicleStatus.DELIVERING: return 'bg-blue-100 text-blue-800';
        case VehicleStatus.REPAIR: return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export const RoutePlanning: React.FC = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<PlanningTab>('delivery');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);
    const [expandedRouteIds, setExpandedRouteIds] = useState<string[]>([]);
    const depotLocation = { lat: -7.8664161, lng: 110.1486773 };

    // --- Data Fetching ---
    const { data: users = [] } = useQuery<User[]>({ queryKey: ['users'], queryFn: getUsers });
    const { data: vehicles = [] } = useQuery<Vehicle[]>({ queryKey: ['vehicles'], queryFn: getVehicles });
    const { data: deliveryRoutes = [], isLoading: isLoadingDelivery } = useQuery<RoutePlan[]>({ queryKey: ['deliveryRoutes'], queryFn: () => getDeliveryRoutes(), enabled: activeTab === 'delivery' });
    const { data: salesRoutes = [], isLoading: isLoadingSales } = useQuery<SalesVisitRoutePlan[]>({ queryKey: ['salesRoutes'], queryFn: () => getSalesRoutes(), enabled: activeTab === 'salesVisit' });

    // --- Delivery Planning ---
    const [dailyPlanForm, setDailyPlanForm] = useState({
        date: new Date().toISOString().split('T')[0],
        assignments: new Map<string, string>() // Map<vehicleId, driverId>
    });
    
    const createDeliveryMutation = useMutation({
        mutationFn: createDeliveryRoute,
        onSuccess: (data) => {
            alert(data.message);
            queryClient.invalidateQueries({ queryKey: ['deliveryRoutes'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            setIsModalOpen(false);
            setDailyPlanForm(prev => ({ ...prev, assignments: new Map() }));
        },
        onError: (err: any) => setModalError(err.response?.data?.message || 'Gagal membuat rute.'),
    });

    const deleteDeliveryMutation = useMutation({
        mutationFn: deleteDeliveryRoute,
        onSuccess: () => {
            alert('Perjalanan berhasil dihapus/dibatalkan.');
            queryClient.invalidateQueries({ queryKey: ['deliveryRoutes'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
        onError: (err: any) => alert(err.response?.data?.message || 'Gagal menghapus rute.'),
    });

    const handleCreateDeliveryPlan = () => {
        setModalError(null);
        if (dailyPlanForm.assignments.size === 0) {
            setModalError("Harap pilih setidaknya satu armada dan pengemudi.");
            return;
        }

        const assignmentsArray = Array.from(dailyPlanForm.assignments.entries())
            .map(([vehicleId, driverId]) => ({ vehicleId, driverId }));
        
        for (const assignment of assignmentsArray) {
            if (!assignment.driverId) {
                setModalError("Setiap armada yang dipilih harus memiliki pengemudi.");
                return;
            }
        }

        createDeliveryMutation.mutate({
            deliveryDate: dailyPlanForm.date,
            assignments: assignmentsArray
        });
    };

    const handleDeleteDeliveryTrip = (tripId: string) => {
        if (window.confirm("Anda yakin ingin menghapus/membatalkan perjalanan ini? Pesanan akan dikembalikan ke status 'Pending'.")) {
            deleteDeliveryMutation.mutate(tripId);
        }
    };
    
    const handleAssignmentChange = (vehicleId: string, type: 'select' | 'driver', value?: string) => {
        setDailyPlanForm(prev => {
            const newAssignments = new Map(prev.assignments);
            if (type === 'select') {
                if (newAssignments.has(vehicleId)) {
                    newAssignments.delete(vehicleId);
                } else {
                    newAssignments.set(vehicleId, ''); // Add with no driver selected yet
                }
            } else if (type === 'driver' && value !== undefined) {
                newAssignments.set(vehicleId, value);
            }
            return { ...prev, assignments: newAssignments };
        });
    };

    // --- Sales Visit Planning ---
    const [salesForm, setSalesForm] = useState({ salesPersonId: '', visitDate: new Date().toISOString().split('T')[0] });
    
    const createSalesMutation = useMutation({
        mutationFn: createSalesRoute,
        onSuccess: (data) => {
            alert(data.message);
            queryClient.invalidateQueries({ queryKey: ['salesRoutes'] });
            setIsModalOpen(false);
        },
        onError: (err: any) => setModalError(err.response?.data?.message || 'Gagal membuat rute kunjungan.'),
    });
    
     const deleteSalesMutation = useMutation({
        mutationFn: deleteSalesRoute,
        onSuccess: () => {
            alert('Rencana kunjungan berhasil dihapus.');
            queryClient.invalidateQueries({ queryKey: ['salesRoutes'] });
        },
        onError: (err: any) => alert(err.response?.data?.message || 'Gagal menghapus rute.'),
    });

    const handleCreateSalesPlan = () => {
        setModalError(null);
        if (!salesForm.salesPersonId || !salesForm.visitDate) {
            setModalError("Harap pilih sales dan tanggal kunjungan.");
            return;
        }
        createSalesMutation.mutate(salesForm);
    };

    const toggleRouteExpansion = (routeId: string) => {
        setExpandedRouteIds(prev =>
            prev.includes(routeId)
                ? prev.filter(id => id !== routeId)
                : [...prev, routeId]
        );
    };

    // Memos
    const availableDrivers = useMemo(() => users.filter(u => u.role === Role.DRIVER), [users]);
    const availableSales = useMemo(() => users.filter(u => u.role === Role.SALES), [users]);
    const idleVehicles = useMemo(() => vehicles.filter(v => v.status === VehicleStatus.IDLE), [vehicles]);
    const assignedDriverIds = useMemo(() => new Set(dailyPlanForm.assignments.values()), [dailyPlanForm.assignments]);
    
    const routesByDateAndDriver = useMemo(() => {
        const grouped: Record<string, Record<string, RoutePlan[]>> = {};
        deliveryRoutes.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).forEach(route => {
            if (!grouped[route.date]) grouped[route.date] = {};
            if (!grouped[route.date][route.driverId]) grouped[route.date][route.driverId] = [];
            grouped[route.date][route.driverId].push(route);
        });
        return grouped;
    }, [deliveryRoutes]);
    
    const sortedSalesRoutes = useMemo(() => {
        return [...salesRoutes].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [salesRoutes]);


    return (
        <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold text-brand-dark">Perencanaan Rute</h1>
            <div className="border-b border-gray-200"><nav className="-mb-px flex space-x-6"><button onClick={() => setActiveTab('delivery')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'delivery' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Rute Pengiriman</button><button onClick={() => setActiveTab('salesVisit')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'salesVisit' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Rute Kunjungan Sales</button></nav></div>
            
            <div className="mt-6">
                {activeTab === 'delivery' ? (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center"><h2 className="text-2xl font-semibold">Rute Pengiriman Armada</h2><button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-brand-primary text-white font-bold py-2 px-4 rounded-lg"><ICONS.plus /> Buat Rencana Harian</button></div>
                        {isLoadingDelivery ? <p>Memuat rute...</p> : Object.keys(routesByDateAndDriver).length === 0 ? (<Card><p className="text-center py-10 text-gray-500">Belum ada rencana rute pengiriman.</p></Card>) : (
                            Object.entries(routesByDateAndDriver).map(([date, driverRoutes]) => (<div key={date}><h3 className="text-xl font-bold pb-2 mb-4 border-b">Rencana untuk: {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</h3><div className="space-y-6">{Object.entries(driverRoutes).map(([driverId, routeList]) => {
                                const driver = users.find(d => d.id === driverId); const vehicle = vehicles.find(v => v.id === routeList[0]?.vehicleId); if (!driver || !vehicle) return null;
                                return (<Card key={driverId}><div className="flex justify-between items-start mb-4"><div><h4 className="text-lg font-bold text-brand-primary">Pengemudi: {driver.name}</h4><p className="text-sm text-gray-500">Armada: {vehicle.plateNumber}</p></div><span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusClass(vehicle.status)}`}>{vehicle.status}</span></div>{routeList.map((route, index) => {
                                    const isExpanded = expandedRouteIds.includes(route.id);
                                    
                                    const sequencedStoreGroups = useMemo(() => {
                                        if (!isExpanded) return [];
                                        type StoreGroup = { storeId: string; storeName: string; address: string; location: Coordinate; orders: RouteStop[] };
                                        const groups: StoreGroup[] = [];
                                        route.stops.forEach(stop => {
                                            const lastGroup = groups[groups.length - 1];
                                            if (lastGroup && lastGroup.storeId === stop.storeId) {
                                                lastGroup.orders.push(stop);
                                            } else {
                                                groups.push({ storeId: stop.storeId, storeName: stop.storeName, address: stop.address, location: stop.location, orders: [stop] });
                                            }
                                        });
                                        return groups;
                                    }, [isExpanded, route.stops]);

                                    return (
                                    <div key={route.id} className="mt-4 border-t pt-4">
                                        <div className="flex justify-between items-center">
                                            <h5 className="font-semibold">Perjalanan {index + 1} ({sequencedStoreGroups.length} pemberhentian)</h5>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => toggleRouteExpansion(route.id)} className="text-sm font-semibold text-gray-600 hover:underline">{isExpanded ? 'Sembunyikan' : 'Lihat Detail'}</button>
                                                <button onClick={() => handleDeleteDeliveryTrip(route.id)} className="p-2 rounded-lg bg-red-100 text-red-700" title="Hapus/Batalkan Perjalanan"><ICONS.trash /></button>
                                            </div>
                                        </div>
                                        {isExpanded && (
                                            <div className="mt-4 pl-4 space-y-4">
                                                <RouteMap stops={route.stops} depot={depotLocation} />
                                                <div className="border-l-2 border-brand-light space-y-4 pt-4">
                                                    {sequencedStoreGroups.map((storeGroup, groupIndex) => {
                                                         const prevLocation = groupIndex === 0 ? depotLocation : sequencedStoreGroups[groupIndex - 1].location;
                                                         const distance = getDistance(prevLocation, storeGroup.location);
                                                         return (
                                                         <div key={storeGroup.storeName + groupIndex} className="relative pl-6">
                                                            <div className="absolute left-0 top-1 w-4 h-4 bg-brand-secondary text-white text-xs rounded-full flex items-center justify-center font-mono">
                                                                {groupIndex + 1}
                                                            </div>
                                                            <p className="font-semibold text-sm">{storeGroup.storeName}</p>
                                                            <p className="text-xs text-gray-500 mb-1">{storeGroup.address}</p>
                                                            {distance > 0 && (
                                                                <div className="flex items-center gap-1.5 text-xs text-brand-secondary font-semibold mb-1">
                                                                    <ICONS.route width={14} height={14} />
                                                                    <span>~{distance.toFixed(1)} km dari titik sebelumnya</span>
                                                                </div>
                                                            )}
                                                            <ul className="list-disc list-inside pl-4 space-y-1">
                                                                {storeGroup.orders.map(order => (
                                                                    <li key={order.orderId} className="text-xs text-gray-600">
                                                                        ID Pesanan: {order.orderId.slice(-6).toUpperCase()}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )})}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    )
                                })}</Card>)
                            })}</div></div>))
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center"><h2 className="text-2xl font-semibold">Rute Kunjungan Sales</h2><button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-brand-primary text-white font-bold py-2 px-4 rounded-lg"><ICONS.plus /> Buat Rencana</button></div>
                        {isLoadingSales ? <p>Memuat rute...</p> : (
                            <div className="space-y-4">
                                {sortedSalesRoutes.length === 0 ? (
                                    <Card><p className="text-center py-10 text-gray-500">Belum ada rencana rute kunjungan.</p></Card>
                                ) : (
                                    sortedSalesRoutes.map(route => {
                                        const isExpanded = expandedRouteIds.includes(route.id);
                                        return (
                                            <Card key={route.id}>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-brand-primary">Rencana untuk {users.find(u => u.id === route.salesPersonId)?.name}</h3>
                                                        <p className="text-sm text-gray-500">Total: {route.stops.length} Kunjungan</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-semibold bg-blue-100 text-blue-800 py-1 px-2 rounded-full">{new Date(route.date).toLocaleDateString('id-ID')}</span>
                                                    </div>
                                                </div>
                                                <div className="mt-4 border-t pt-4">
                                                    <div className="flex justify-between items-center">
                                                        <h5 className="font-semibold">Daftar Kunjungan</h5>
                                                        <div className="flex items-center gap-3">
                                                            <button onClick={() => toggleRouteExpansion(route.id)} className="text-sm font-semibold text-gray-600 hover:underline">
                                                                {isExpanded ? 'Sembunyikan' : 'Lihat Detail'}
                                                            </button>
                                                            <button onClick={() => deleteSalesMutation.mutate(route.id)} className="p-2 rounded-lg bg-red-100 text-red-700" title="Hapus Rencana Kunjungan"><ICONS.trash /></button>
                                                        </div>
                                                    </div>
                                                    {isExpanded && (
                                                        <div className="mt-4 pl-4 space-y-4">
                                                            <RouteMap stops={route.stops.map(s => ({...s, id: s.visitId}))} depot={depotLocation} />
                                                            <div className="border-l-2 border-brand-light space-y-3 pt-4">
                                                                {route.stops.map((stop, stopIndex) => {
                                                                    const prevLocation = stopIndex === 0 ? depotLocation : route.stops[stopIndex - 1].location;
                                                                    const distance = getDistance(prevLocation, stop.location);
                                                                    return (
                                                                    <div key={stop.visitId} className="relative pl-6">
                                                                        <div className="absolute left-0 top-1 w-4 h-4 bg-brand-secondary text-white text-xs rounded-full flex items-center justify-center font-mono">{stopIndex + 1}</div>
                                                                        <p className="font-semibold text-sm">{stop.storeName}</p>
                                                                        <p className="text-xs text-gray-500">{stop.address}</p>
                                                                        {distance > 0 && (
                                                                            <div className="flex items-center gap-1.5 text-xs text-brand-secondary font-semibold mt-1">
                                                                                <ICONS.route width={14} height={14} />
                                                                                <span>~{distance.toFixed(1)} km dari titik sebelumnya</span>
                                                                            </div>
                                                                        )}
                                                                        <p className="text-xs text-gray-600 mt-1 font-medium">Tujuan: {stop.purpose}</p>
                                                                    </div>
                                                                )})}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>
                                        )
                                    })
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Modal title={activeTab === 'delivery' ? 'Buat Rencana Pengiriman Harian' : 'Buat Rencana Kunjungan'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                {modalError && <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4">{modalError}</div>}
                {activeTab === 'delivery' ? (
                    <div className="space-y-4">
                        <div><label className="block text-sm font-medium">Tanggal Pengiriman</label><input type="date" value={dailyPlanForm.date} onChange={e => setDailyPlanForm(f => ({...f, date: e.target.value}))} className="w-full p-2 border rounded mt-1"/></div>
                        
                        <div>
                            <label className="block text-sm font-medium">Pilih Armada & Pengemudi</label>
                            <div className="mt-2 p-3 border rounded-lg space-y-3 max-h-80 overflow-y-auto bg-gray-50">
                                {idleVehicles.length === 0 && <p className="text-sm text-center text-gray-500">Tidak ada armada yang idle.</p>}
                                {idleVehicles.map(vehicle => {
                                    const isSelected = dailyPlanForm.assignments.has(vehicle.id);
                                    const selectedDriverId = dailyPlanForm.assignments.get(vehicle.id);
                                    return (
                                        <div key={vehicle.id} className={`p-3 rounded-lg transition-colors ${isSelected ? 'bg-blue-100 border border-blue-300' : 'bg-white border'}`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <input type="checkbox" checked={isSelected} onChange={() => handleAssignmentChange(vehicle.id, 'select')} className="h-5 w-5"/>
                                                    <div>
                                                        <p className="font-semibold">{vehicle.plateNumber} <span className="font-normal text-gray-500">({vehicle.model})</span></p>
                                                        <p className="text-xs">Kapasitas: {vehicle.capacity} unit</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <div className="mt-3 pl-8">
                                                    <select 
                                                        value={selectedDriverId || ''}
                                                        onChange={(e) => handleAssignmentChange(vehicle.id, 'driver', e.target.value)}
                                                        className="w-full p-2 border rounded bg-white text-sm"
                                                    >
                                                        <option value="" disabled>-- Pilih Pengemudi --</option>
                                                        {availableDrivers.map(d => {
                                                            const isAssignedElsewhere = assignedDriverIds.has(d.id) && selectedDriverId !== d.id;
                                                            return <option key={d.id} value={d.id} disabled={isAssignedElsewhere}>{d.name}{isAssignedElsewhere ? ' (sudah ditugaskan)' : ''}</option>
                                                        })}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4"><button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 py-2 px-4 rounded-lg mr-2">Batal</button><button onClick={handleCreateDeliveryPlan} disabled={createDeliveryMutation.isPending} className="bg-brand-primary text-white py-2 px-4 rounded-lg disabled:bg-gray-400">{createDeliveryMutation.isPending ? 'Membuat...' : 'Hasilkan Rute'}</button></div>
                    </div>
                ) : (
                     <div className="space-y-4">
                        <div><label>Sales</label><select value={salesForm.salesPersonId} onChange={e => setSalesForm(f => ({...f, salesPersonId: e.target.value}))} className="w-full p-2 border rounded mt-1"><option value="" disabled>-- Pilih --</option>{availableSales.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                        <div><label>Tanggal</label><input type="date" value={salesForm.visitDate} onChange={e => setSalesForm(f => ({...f, visitDate: e.target.value}))} className="w-full p-2 border rounded mt-1"/></div>
                        <div className="flex justify-end pt-4"><button onClick={() => setIsModalOpen(false)} className="bg-gray-200 py-2 px-4 rounded-lg mr-2">Batal</button><button onClick={handleCreateSalesPlan} disabled={createSalesMutation.isPending} className="bg-brand-primary text-white py-2 px-4 rounded-lg disabled:bg-gray-400">{createSalesMutation.isPending ? 'Membuat...' : 'Hasilkan Rute'}</button></div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
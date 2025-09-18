
const Vehicle = require('../models/vehicleModel');
const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Route = require('../models/routeModel');
const { calculateSavingsMatrixRoutes } = require('../services/routingService');
const { getDistance } = require('../utils/geolocation');

const createPlan = async (req, res) => {
    const { deliveryDate, assignments } = req.body;

    if (!deliveryDate || !Array.isArray(assignments) || assignments.length === 0) {
        return res.status(400).json({ message: "Harap pilih tanggal dan setidaknya satu pasangan armada-pengemudi." });
    }

    try {
        // --- 1. Data Fetching and Validation ---
        const assignedVehicleIds = assignments.map(a => a.vehicleId);
        const allVehicles = await Vehicle.getAll();
        const assignedVehicles = allVehicles.filter(v => assignedVehicleIds.includes(v.id));

        // Validate that all assigned vehicles exist and are idle before proceeding
        for (const assignment of assignments) {
            const vehicle = allVehicles.find(v => v.id === assignment.vehicleId);
            if (!vehicle) {
                return res.status(404).json({ message: `Armada dengan ID ${assignment.vehicleId} tidak ditemukan.` });
            }
            if (vehicle.status !== 'Idle') {
                return res.status(400).json({ message: `Armada ${vehicle.plateNumber} tidak idle dan tidak dapat dijadwalkan.` });
            }
            // Delete any previous unstarted plans for this vehicle to allow for replanning
            await Route.deletePendingPlansForVehicle(assignment.vehicleId, deliveryDate);
        }

        // Fetch all routable orders. We only need to do this once.
        let remainingOrders = await Order.findRoutableOrders({ deliveryDate });
        
        if (remainingOrders.length === 0) {
            return res.status(404).json({ message: "Tidak ada pesanan 'Pending' yang bisa dijadwalkan untuk tanggal yang dipilih." });
        }
        
        const allCreatedRoutes = [];
        let totalRoutedOrders = 0;
        const depotLocation = { lat: -7.8664161, lng: 110.1486773 }; // PDAM Tirta Binangun

        // --- 2. Iterative Route Generation for Each Vehicle ---
        for (const assignment of assignments) {
            const { vehicleId, driverId } = assignment;
            const vehicle = assignedVehicles.find(v => v.id === vehicleId);

            if (!vehicle || remainingOrders.length === 0) continue;

            // Group remaining orders by store to create nodes for VRP
            const storeStops = remainingOrders.reduce((acc, order) => {
                if (!acc[order.storeId]) {
                    acc[order.storeId] = {
                        storeId: order.storeId, storeName: order.storeName, address: order.address,
                        location: order.location, totalDemand: 0, orderIds: [], priority: false,
                    };
                }
                acc[order.storeId].totalDemand += order.demand;
                acc[order.storeId].orderIds.push(order.id);
                if (order.priority) acc[order.storeId].priority = true;
                return acc;
            }, {});

            const nodes = Object.values(storeStops).map(store => ({
                id: store.storeId, // VRP works with store IDs
                location: store.location, demand: store.totalDemand, priority: store.priority,
            }));

            // Generate optimized trips (of store IDs) for the current vehicle's capacity
            const calculatedTrips = calculateSavingsMatrixRoutes(nodes, depotLocation, vehicle.capacity);
            
            const routedOrderIdsThisVehicle = new Set();
            
            // For each trip, create a full RoutePlan with all associated orders
            for (const tripStoreIds of calculatedTrips) {
                const stopsForThisTrip = [];
                for (const storeId of tripStoreIds) {
                    const storeData = storeStops[storeId];
                    if (storeData) {
                        storeData.orderIds.forEach(orderId => {
                            const orderData = remainingOrders.find(o => o.id === orderId);
                            if (orderData) {
                                stopsForThisTrip.push({
                                    orderId: orderData.id,
                                    storeId: orderData.storeId,
                                    storeName: orderData.storeName,
                                    address: orderData.address,
                                    location: orderData.location
                                });
                                routedOrderIdsThisVehicle.add(orderId);
                            }
                        });
                    }
                }
                
                if (stopsForThisTrip.length > 0) {
                    const newRoutePlan = { driverId, vehicleId, date: deliveryDate, stops: stopsForThisTrip };
                    const createdRoute = await Route.createPlan(newRoutePlan);
                    allCreatedRoutes.push(createdRoute);
                }
            }

            // Update remaining orders for the next vehicle in the loop
            if (routedOrderIdsThisVehicle.size > 0) {
                totalRoutedOrders += routedOrderIdsThisVehicle.size;
                remainingOrders = remainingOrders.filter(o => !routedOrderIdsThisVehicle.has(o.id));
            }
        }
        
        const message = `Berhasil membuat ${allCreatedRoutes.length} perjalanan untuk ${assignments.length} armada, menjadwalkan ${totalRoutedOrders} pesanan.`;
        res.status(201).json({ success: true, message, routes: allCreatedRoutes });

    } catch (error) {
        console.error('Error creating daily plan:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server saat membuat rencana rute harian.' });
    }
};


const getRoutePlans = async (req, res) => {
    try {
        const { user } = req;
        let filters = { ...req.query };

        // Security: Drivers can only see their own data. Admins see everything based on query.
        if (user.role === 'Driver') {
            filters.driverId = user.id;
        } else if (user.role !== 'Admin') {
            // Other roles (like Sales) cannot see delivery routes.
            return res.json([]);
        }
        
        const plans = await Route.getAll(filters);

        // --- Calculate distances for each stop ---
        const depotLocation = { lat: -7.8664161, lng: 110.1486773 }; // PDAM Tirta Binangun
        const plansWithDistances = plans.map(plan => {
            let lastLocation = depotLocation;
            const stopsWithDistances = plan.stops.map(stop => {
                const distance = getDistance(lastLocation, stop.location);
                lastLocation = stop.location;
                return { ...stop, distanceFromPrev: distance };
            });
            return { ...plan, stops: stopsWithDistances };
        });

        res.json(plansWithDistances);
    } catch (error) {
        console.error('Error getting route plans:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengambil riwayat perjalanan.' });
    }
};

const getRoutePlanById = async (req, res) => {
    try {
        const plan = await Route.getById(req.params.id);
        if (plan) {
            // Security check for non-admins
            if (req.user.role === 'Driver' && req.user.id !== plan.driverId) {
                return res.status(403).json({ message: 'Akses ditolak.' });
            }
            res.json(plan);
        } else {
            res.status(404).json({ message: 'Rencana rute tidak ditemukan.' });
        }
    } catch (error) {
        console.error(`Error getting route plan ${req.params.id}:`, error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

const updateStopStatus = async (req, res) => {
    const { id: stopId } = req.params;
    const { status, proofImage, failureReason } = req.body;
    const { user } = req; // Logged-in user

    if (!status || (status === 'Failed' && !failureReason)) {
        return res.status(400).json({ message: 'Status (dan alasan jika Gagal) wajib diisi.' });
    }

    try {
        const result = await Route.updateStopStatus(stopId, { status, proofOfDeliveryImage: proofImage, failureReason }, user);
        if (result) {
            res.json({ message: 'Status berhasil diperbarui.' });
        } else {
            res.status(404).json({ message: 'Pemberhentian tidak ditemukan atau Anda tidak memiliki izin untuk memperbaruinya.' });
        }
    } catch (error) {
        console.error(`Error updating stop status ${stopId}:`, error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server saat memperbarui status.' });
    }
};

const deleteRoutePlan = async (req, res) => {
    const { id: routeId } = req.params;
    try {
        const success = await Route.deletePlan(routeId);
        if (success) {
            res.json({ message: 'Rencana perjalanan berhasil dihapus dan pesanan dikembalikan.' });
        } else {
            res.status(404).json({ message: 'Rencana perjalanan tidak ditemukan.' });
        }
    } catch (error) {
        console.error(`Error deleting route plan ${routeId}:`, error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server saat menghapus rencana.' });
    }
};

const moveOrder = async (req, res) => {
    const { orderId, newVehicleId } = req.body;
    if (!orderId) {
        return res.status(400).json({ message: "ID Pesanan wajib diisi." });
    }
    try {
        await Route.moveOrder(orderId, newVehicleId);
        res.json({ message: 'Pesanan berhasil dipindahkan.' });
    } catch (error) {
        console.error(`Error moving order ${orderId}:`, error);
        res.status(500).json({ message: error.message || 'Gagal memindahkan pesanan.' });
    }
};


module.exports = {
    createPlan,
    getRoutePlans,
    getRoutePlanById,
    updateStopStatus,
    deleteRoutePlan,
    moveOrder,
};


const Vehicle = require('../models/vehicleModel');
const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Route = require('../models/routeModel');
const { calculateSavingsMatrixRoutes, clusterOrdersByRegion } = require('../services/routingService');
const { getDistance } = require('../utils/geolocation');

const createPlan = async (req, res) => {
    const { deliveryDate, assignments, selectedOrderIds } = req.body;

    if (!deliveryDate) {
        return res.status(400).json({ message: "Harap pilih tanggal pengiriman." });
    }

    // New flow: Allow creating route without assignments
    const hasAssignments = assignments && Array.isArray(assignments) && assignments.length > 0;

    try {
        console.log('[Route Planning] Starting route planning for date:', deliveryDate);
        console.log('[Route Planning] Has assignments:', hasAssignments);
        console.log('[Route Planning] Selected order IDs:', selectedOrderIds);
        
        // Fetch all routable orders
        console.log('[Route Planning] Fetching routable orders...');
        let remainingOrders = await Order.findRoutableOrders({ deliveryDate });
        console.log('[Route Planning] Routable orders found:', remainingOrders.length);
        
        // If selectedOrderIds provided, filter only those orders
        if (selectedOrderIds && Array.isArray(selectedOrderIds) && selectedOrderIds.length > 0) {
            remainingOrders = remainingOrders.filter(order => selectedOrderIds.includes(order.id));
            console.log('[Route Planning] Filtered to selected orders:', remainingOrders.length);
        }
        
        if (remainingOrders.length === 0) {
            return res.status(404).json({ message: "Tidak ada pesanan yang dipilih atau tersedia untuk tanggal yang dipilih." });
        }

        // Validate order data integrity
        for (const order of remainingOrders) {
            if (!order.location || !order.location.lat || !order.location.lng) {
                console.error('[Route Planning] Order missing location:', order.id, order);
                return res.status(500).json({ 
                    message: `Pesanan ${order.id} tidak memiliki koordinat lokasi yang valid. Silakan periksa data toko.` 
                });
            }
            if (!order.demand || order.demand <= 0) {
                console.error('[Route Planning] Order missing demand:', order.id, order);
                return res.status(500).json({ 
                    message: `Pesanan ${order.id} tidak memiliki data demand yang valid.` 
                });
            }
        }

        // If no assignments provided, create unassigned routes
        if (!hasAssignments) {
            return await createUnassignedRoutes(remainingOrders, deliveryDate, res);
        }

        // Original flow: Create routes with vehicle/driver assignments
        return await createAssignedRoutes(remainingOrders, deliveryDate, assignments, res);

    } catch (error) {
        console.error('Error creating daily plan:', error);
        console.error('Error stack:', error.stack);
        console.error('Error message:', error.message);
        res.status(500).json({ 
            message: 'Terjadi kesalahan pada server saat membuat rencana rute harian.',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Helper function: Create unassigned routes (no driver/vehicle)
async function createUnassignedRoutes(orders, deliveryDate, res) {
    console.log('[Route Planning] Creating unassigned routes...');
    
    const depotLocation = { lat: -7.8664161, lng: 110.1486773 }; // PDAM Tirta Binangun
    
    // ===== STEP 1: CLUSTER ORDERS BY REGION =====
    const regionClusters = clusterOrdersByRegion(orders);
    console.log('[Route Planning] Region clusters:', Object.keys(regionClusters));
    
    const allCreatedRoutes = [];
    // Use L300 capacity as default (200 equivalent units)
    // This is the maximum capacity for heterogeneous loads
    const DEFAULT_CAPACITY = 200; 
    
    console.log('[Route Planning] Using default capacity:', DEFAULT_CAPACITY);
    
    // ===== STEP 2: PROCESS EACH REGION SEPARATELY =====
    for (const [region, regionOrders] of Object.entries(regionClusters)) {
        console.log(`[Route Planning] Processing region: ${region} with ${regionOrders.length} orders`);
        
        // Group orders by store within this region
        const storeStops = regionOrders.reduce((acc, order) => {
            if (!acc[order.storeId]) {
                acc[order.storeId] = {
                    storeId: order.storeId, 
                    storeName: order.storeName, 
                    address: order.address,
                    location: order.location, 
                    totalDemand: 0, 
                    orderIds: [], 
                    priority: false,
                };
            }
            acc[order.storeId].totalDemand += order.demand;
            acc[order.storeId].orderIds.push(order.id);
            if (order.priority) acc[order.storeId].priority = true;
            return acc;
        }, {});

        const nodes = Object.values(storeStops).map(store => ({
            id: store.storeId,
            location: store.location, 
            demand: store.totalDemand, 
            priority: store.priority,
        }));

        console.log(`[Route Planning] Creating routes for ${nodes.length} stores in region ${region}`);
        console.log('[Route Planning] Store demands:', nodes.map(n => ({ id: n.id, demand: n.demand })));
        console.log('[Route Planning] Total demand for region:', nodes.reduce((sum, n) => sum + n.demand, 0));

        // ===== STEP 3: RUN CLARKE-WRIGHT FOR THIS REGION =====
        const calculatedTrips = calculateSavingsMatrixRoutes(nodes, depotLocation, DEFAULT_CAPACITY);
        
        console.log(`[Route Planning] Generated ${calculatedTrips.length} trips for region ${region}`);

        // ===== STEP 4: CREATE ROUTES FOR THIS REGION =====
        for (const tripStoreIds of calculatedTrips) {
            const stopsForThisTrip = [];
            
            for (const storeId of tripStoreIds) {
                const storeData = storeStops[storeId];
                if (storeData) {
                    storeData.orderIds.forEach(orderId => {
                        const orderData = regionOrders.find(o => o.id === orderId);
                        if (orderData) {
                            stopsForThisTrip.push({
                                orderId: orderData.id,
                                storeId: orderData.storeId,
                                storeName: orderData.storeName,
                                address: orderData.address,
                                location: orderData.location
                            });
                        }
                    });
                }
            }
            
            if (stopsForThisTrip.length > 0) {
                console.log(`[Route Planning] Creating unassigned route for region ${region} with ${stopsForThisTrip.length} stops`);
                const newRoutePlan = { 
                    driverId: null, 
                    vehicleId: null, 
                    date: deliveryDate, 
                    stops: stopsForThisTrip,
                    assignmentStatus: 'unassigned'
                };
                const createdRoute = await Route.createPlan(newRoutePlan);
                allCreatedRoutes.push(createdRoute);
            }
        }
    }

    const message = `Berhasil membuat ${allCreatedRoutes.length} rute tanpa assignment (dikelompokkan per wilayah). Silakan assign driver dan armada sebelum berangkat.`;
    res.status(201).json({ success: true, message, routes: allCreatedRoutes });
}

// Helper function: Create assigned routes (with driver/vehicle)
async function createAssignedRoutes(remainingOrders, deliveryDate, assignments, res) {
    console.log('[Route Planning] Creating assigned routes...');
    console.log('[Route Planning] Assignments:', assignments.length);
    
    const assignedVehicleIds = assignments.map(a => a.vehicleId);
    const allVehicles = await Vehicle.getAll();
    const assignedVehicles = allVehicles.filter(v => assignedVehicleIds.includes(v.id));

    // Validate vehicles
    for (const assignment of assignments) {
        const vehicle = allVehicles.find(v => v.id === assignment.vehicleId);
        if (!vehicle) {
            return res.status(404).json({ message: `Armada dengan ID ${assignment.vehicleId} tidak ditemukan.` });
        }
        if (vehicle.status !== 'Idle') {
            return res.status(400).json({ message: `Armada ${vehicle.plateNumber} tidak idle dan tidak dapat dijadwalkan.` });
        }
        console.log('[Route Planning] Deleting pending plans for vehicle:', vehicle.plateNumber);
        await Route.deletePendingPlansForVehicle(assignment.vehicleId, deliveryDate);
    }
        
        if (remainingOrders.length === 0) {
            return res.status(404).json({ message: "Tidak ada pesanan 'Pending' yang bisa dijadwalkan untuk tanggal yang dipilih." });
        }
        
        // Validate order data integrity
        for (const order of remainingOrders) {
            if (!order.location || !order.location.lat || !order.location.lng) {
                console.error('[Route Planning] Order missing location:', order.id, order);
                return res.status(500).json({ 
                    message: `Pesanan ${order.id} tidak memiliki koordinat lokasi yang valid. Silakan periksa data toko.` 
                });
            }
            if (!order.demand || order.demand <= 0) {
                console.error('[Route Planning] Order missing demand:', order.id, order);
                return res.status(500).json({ 
                    message: `Pesanan ${order.id} tidak memiliki data demand yang valid.` 
                });
            }
        }
        
        const allCreatedRoutes = [];
        let totalRoutedOrders = 0;
        const depotLocation = { lat: -7.8664161, lng: 110.1486773 }; // PDAM Tirta Binangun

        // ===== STEP 1: CLUSTER ALL REMAINING ORDERS BY REGION =====
        console.log('[Route Planning] Clustering orders by region before vehicle assignment...');
        const regionClusters = clusterOrdersByRegion(remainingOrders);
        
        // --- 2. Iterative Route Generation for Each Vehicle ---
        for (const assignment of assignments) {
            const { vehicleId, driverId } = assignment;
            const vehicle = assignedVehicles.find(v => v.id === vehicleId);

            if (!vehicle || remainingOrders.length === 0) continue;

            console.log(`[Route Planning] Processing vehicle: ${vehicle.plateNumber} (capacity: ${vehicle.capacity})`);
            console.log(`[Route Planning] Remaining orders for this vehicle: ${remainingOrders.length}`);
            
            // ===== STEP 2: PROCESS EACH REGION SEPARATELY FOR THIS VEHICLE =====
            const routedOrderIdsThisVehicle = new Set();
            
            for (const [region, regionOrders] of Object.entries(regionClusters)) {
                // Filter to only remaining orders in this region
                const remainingRegionOrders = regionOrders.filter(o => 
                    remainingOrders.some(ro => ro.id === o.id)
                );
                
                if (remainingRegionOrders.length === 0) continue;
                
                console.log(`[Route Planning] Processing region: ${region} with ${remainingRegionOrders.length} remaining orders`);
                
                // Group remaining orders by store to create nodes for VRP
                const storeStops = remainingRegionOrders.reduce((acc, order) => {
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

                console.log(`[Route Planning] Region ${region} - Unique stores: ${Object.keys(storeStops).length}`);
                
                const nodes = Object.values(storeStops).map(store => ({
                    id: store.storeId, // VRP works with store IDs
                    location: store.location, demand: store.totalDemand, priority: store.priority,
                }));

                console.log(`[Route Planning] Region ${region} - Nodes for VRP: ${nodes.length}`);
                
                // ===== STEP 3: RUN CLARKE-WRIGHT FOR THIS REGION =====
                const calculatedTrips = calculateSavingsMatrixRoutes(nodes, depotLocation, vehicle.capacity);
                
                console.log(`[Route Planning] Region ${region} - Calculated trips: ${calculatedTrips.length}`);
                
                // For each trip, create a full RoutePlan with all associated orders
                for (const tripStoreIds of calculatedTrips) {
                    const stopsForThisTrip = [];
                    const processedOrderIds = new Set(); // Track processed orders to avoid duplicates
                    
                    for (const storeId of tripStoreIds) {
                        const storeData = storeStops[storeId];
                        if (storeData) {
                            console.log(`[Route Planning] Region ${region} - Processing store ${storeData.storeName} with ${storeData.orderIds.length} orders`);
                            
                            storeData.orderIds.forEach(orderId => {
                                // Skip if already processed (shouldn't happen, but defensive)
                                if (processedOrderIds.has(orderId)) {
                                    console.warn(`[Route Planning] WARNING: Order ${orderId} already processed, skipping duplicate`);
                                    return;
                                }
                                
                                const orderData = remainingRegionOrders.find(o => o.id === orderId);
                                if (orderData) {
                                    stopsForThisTrip.push({
                                        orderId: orderData.id,
                                        storeId: orderData.storeId,
                                        storeName: orderData.storeName,
                                        address: orderData.address,
                                        location: orderData.location
                                    });
                                    routedOrderIdsThisVehicle.add(orderId);
                                    processedOrderIds.add(orderId);
                                }
                            });
                        }
                    }
                    
                    if (stopsForThisTrip.length > 0) {
                        console.log(`[Route Planning] Creating route plan for region ${region} with ${stopsForThisTrip.length} stops`);
                        console.log(`[Route Planning] Stop order IDs:`, stopsForThisTrip.map(s => s.orderId.slice(-8)));
                        const newRoutePlan = { driverId, vehicleId, date: deliveryDate, stops: stopsForThisTrip };
                        const createdRoute = await Route.createPlan(newRoutePlan);
                        console.log(`[Route Planning] Route plan created: ${createdRoute.id} for region ${region}`);
                        allCreatedRoutes.push(createdRoute);
                    }
                }
            }
            
            console.log(`[Route Planning] Vehicle ${vehicle.plateNumber} routed ${routedOrderIdsThisVehicle.size} orders`);

            // Update remaining orders for the next vehicle in the loop
            if (routedOrderIdsThisVehicle.size > 0) {
                totalRoutedOrders += routedOrderIdsThisVehicle.size;
                remainingOrders = remainingOrders.filter(o => !routedOrderIdsThisVehicle.has(o.id));
                
                // Update region clusters to remove routed orders
                for (const region of Object.keys(regionClusters)) {
                    regionClusters[region] = regionClusters[region].filter(o => 
                        !routedOrderIdsThisVehicle.has(o.id)
                    );
                }
            }
        }
        
        const message = `Berhasil membuat ${allCreatedRoutes.length} perjalanan untuk ${assignments.length} armada, menjadwalkan ${totalRoutedOrders} pesanan (dikelompokkan per wilayah).`;
        res.status(201).json({ success: true, message, routes: allCreatedRoutes });
}


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

const assignDriverVehicle = async (req, res) => {
    const { routeId } = req.params;
    const { driverId, vehicleId } = req.body;

    if (!driverId || !vehicleId) {
        return res.status(400).json({ message: "Driver ID dan Vehicle ID wajib diisi." });
    }

    try {
        // Validate vehicle exists and is idle
        const vehicle = await Vehicle.getById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ message: "Armada tidak ditemukan." });
        }
        if (vehicle.status !== 'Idle') {
            return res.status(400).json({ message: `Armada ${vehicle.plateNumber} sedang tidak idle dan tidak dapat diassign.` });
        }

        // Validate driver exists
        const driver = await User.getById(driverId);
        if (!driver || driver.role !== 'Driver') {
            return res.status(404).json({ message: "Driver tidak ditemukan." });
        }

        // Get route and validate
        const route = await Route.getById(routeId);
        if (!route) {
            return res.status(404).json({ message: "Rute tidak ditemukan." });
        }

        // Update route with driver and vehicle
        const success = await Route.assignDriverVehicle(routeId, driverId, vehicleId);
        
        if (success) {
            res.json({ 
                message: `Berhasil assign ${driver.name} dan ${vehicle.plateNumber} ke rute.`,
                route: await Route.getById(routeId)
            });
        } else {
            res.status(500).json({ message: "Gagal mengassign driver dan armada." });
        }
    } catch (error) {
        console.error(`Error assigning driver/vehicle to route ${routeId}:`, error);
        res.status(500).json({ message: error.message || 'Gagal mengassign driver dan armada.' });
    }
};

const unassignDriverVehicle = async (req, res) => {
    const { routeId } = req.params;

    try {
        // Get route and validate
        const route = await Route.getById(routeId);
        if (!route) {
            return res.status(404).json({ message: "Rute tidak ditemukan." });
        }

        // Check if route is assigned
        if (!route.driverId || !route.vehicleId) {
            return res.status(400).json({ message: "Rute belum ditugaskan ke driver dan armada." });
        }

        // Check if route has already departed
        if (route.assignmentStatus === 'departed' || route.assignmentStatus === 'completed') {
            return res.status(400).json({ message: "Tidak dapat membatalkan penugasan rute yang sudah berangkat atau selesai." });
        }

        // Unassign driver and vehicle
        const success = await Route.unassignDriverVehicle(routeId);
        
        if (success) {
            res.json({ 
                message: `Berhasil membatalkan penugasan rute.`,
                route: await Route.getById(routeId)
            });
        } else {
            res.status(500).json({ message: "Gagal membatalkan penugasan." });
        }
    } catch (error) {
        console.error(`Error unassigning driver/vehicle from route ${routeId}:`, error);
        res.status(500).json({ message: error.message || 'Gagal membatalkan penugasan.' });
    }
};


module.exports = {
    createPlan,
    getRoutePlans,
    getRoutePlanById,
    updateStopStatus,
    deleteRoutePlan,
    moveOrder,
    assignDriverVehicle,
    unassignDriverVehicle,
};

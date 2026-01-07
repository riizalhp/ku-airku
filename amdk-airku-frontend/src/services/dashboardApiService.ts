import { getOrders } from './orderApiService';
import { getStores } from './storeApiService';
import { getUsers } from './userApiService';
import { getDeliveryRoutes, getSalesRoutes } from './routeApiService';
import { getVisits } from './visitApiService';
import { getVehicles } from './vehicleApiService';
import { getSurveys } from './surveyApiService';
import { Order, Store, User, RoutePlan, SalesVisitRoutePlan, Visit, SurveyResponse, Vehicle } from '../types';

interface DashboardData {
    orders: Order[];
    stores: Store[];
    users: User[];
    routes: RoutePlan[];
    salesRoutes: SalesVisitRoutePlan[];
    visits: Visit[];
    surveys: SurveyResponse[];
    vehicles: Vehicle[];
}

export const getDashboardData = async (): Promise<DashboardData> => {
    // Uses the migrated service functions which now point to Supabase
    const [orders, stores, users, routes, salesRoutes, visits, surveys, vehicles] = await Promise.all([
        getOrders(),
        getStores(),
        getUsers(),
        getDeliveryRoutes(),
        getSalesRoutes(),
        getVisits(),
        getSurveys(),
        getVehicles(),
    ]);

    return {
        orders,
        stores,
        users,
        routes,
        salesRoutes,
        visits,
        surveys,
        vehicles,
    };
};
import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ICONS } from '../../constants';
import { Dashboard } from './Dashboard';
import { UserManagement } from './UserManagement';
import { StoreManagement } from './StoreManagement';
import { ProductManagement } from './ProductManagement';
import { OrderManagement } from './OrderManagement';
import { FleetManagement } from './FleetManagement';
import { VehicleManagement } from './VehicleManagement';
import { SurveyReports } from './SurveyReports';
import { VisitSchedule } from './VisitSchedule';
import { ReportsView } from './ReportsView';
import { useAppContext } from '../../hooks/useAppContext';
import { TripHistory } from './TripHistory';

// Menu items are ordered based on the admin's typical workflow.
const navItems: { path: string; label: string; icon: React.ReactNode }[] = [
    // --- Group 1: Overview & Analysis ---
    { path: '', label: 'Dashboard', icon: <ICONS.dashboard /> },
    { path: 'reports', label: 'Laporan', icon: <ICONS.fileText /> },
    
    // --- Group 2: Daily Operations ---
    { path: 'fleet', label: 'Pantau Muatan', icon: <ICONS.fleet /> },
    { path: 'trip-history', label: 'Riwayat Perjalanan', icon: <ICONS.history /> },
    
    // --- Group 3: Sales & Data Entry ---
    { path: 'orders', label: 'Manajemen Pesanan', icon: <ICONS.orders /> },
    { path: 'schedule', label: 'Jadwal Kunjungan', icon: <ICONS.calendar /> },
    { path: 'surveys', label: 'Laporan Survei', icon: <ICONS.survey /> },
    
    // --- Group 4: Master Data Management ---
    { path: 'stores', label: 'Manajemen Toko', icon: <ICONS.store /> },
    { path: 'products', label: 'Manajemen Produk', icon: <ICONS.product /> },
    { path: 'vehicles', label: 'Manajemen Armada', icon: <ICONS.fleet /> },
    { path: 'users', label: 'Manajemen Pengguna', icon: <ICONS.users /> },
];


export const AdminView: React.FC = () => {
    const { logout, currentUser } = useAppContext();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Get current page from URL
    const currentPath = location.pathname.replace('/admin/', '').replace('/admin', '');
    const activePage = navItems.find(item => item.path === currentPath)?.label || 'Dashboard';

    const sidebarContent = (
        <>
            <div className="p-6 text-2xl font-bold border-b border-blue-900">
                KU AIRKU
            </div>
            <nav className="flex-1 mt-6 space-y-2">
                {navItems.map(item => {
                    const isActive = currentPath === item.path || 
                                   (currentPath === '' && item.path === '');
                    return (
                        <button
                            key={item.path}
                            onClick={() => {
                                navigate(`/admin/${item.path}`);
                                setIsSidebarOpen(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition duration-200 ${
                                isActive
                                ? 'bg-brand-primary' 
                                : 'hover:bg-brand-primary hover:bg-opacity-50'
                            }`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-blue-900">
                <div className="px-4 py-2 mb-2">
                  <p className="text-sm font-semibold">{currentUser?.name}</p>
                  <p className="text-xs text-blue-300">{currentUser?.role}</p>
                </div>
                 <button onClick={logout} className="w-full flex items-center space-x-3 px-4 py-3 text-left transition duration-200 hover:bg-brand-primary hover:bg-opacity-50 rounded-md">
                    <ICONS.logout />
                    <span>Keluar</span>
                </button>
            </div>
        </>
    );

    return (
        <div className="flex min-h-screen bg-brand-background">
             {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 bg-brand-dark text-white flex-col flex-shrink-0 sticky top-0 min-h-screen" style={{ backgroundColor: '#03045E' }}>
                {sidebarContent}
            </aside>

            {/* Mobile Sidebar (Overlay) */}
            {isSidebarOpen && (
                <div className="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)}></div>
            )}
            <aside className={`md:hidden fixed top-0 left-0 h-full w-64 bg-brand-dark text-white flex flex-col z-40 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ backgroundColor: '#03045E' }}>
                {sidebarContent}
            </aside>

            <main className="flex-1 flex flex-col overflow-y-auto">
                {/* Mobile Header */}
                <header className="md:hidden flex justify-between items-center p-4 bg-white shadow-md sticky top-0 z-20">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600 p-2">
                        <ICONS.menu />
                    </button>
                    <span className="text-lg font-bold text-brand-dark">
                        {activePage}
                    </span>
                    <div className="w-8"></div> {/* Spacer */}
                </header>

                <div className="flex-1">
                    <Routes>
                        <Route index element={<Dashboard />} />
                        <Route path="reports" element={<ReportsView />} />
                        <Route path="trip-history" element={<TripHistory />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="stores" element={<StoreManagement />} />
                        <Route path="products" element={<ProductManagement />} />
                        <Route path="orders" element={<OrderManagement />} />
                        <Route path="vehicles" element={<VehicleManagement />} />
                        <Route path="fleet" element={<FleetManagement />} />
                        <Route path="schedule" element={<VisitSchedule />} />
                        <Route path="surveys" element={<SurveyReports />} />
                        <Route path="*" element={<Navigate to="/admin" replace />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};
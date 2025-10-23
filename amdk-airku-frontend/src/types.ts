export enum Role {
  ADMIN = 'Admin',
  SALES = 'Sales',
  DRIVER = 'Driver',
}

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  password?: string;
}

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Store {
  id: string;
  name:string;
  address: string;
  location: Coordinate | null;
  region: string;
  owner: string;
  phone: string;
  subscribedSince: string;
  lastOrder: string;
  isPartner: boolean;
  partnerCode?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number; // Total physical stock
  reservedStock: number; // Stock allocated to pending/routed orders
  capacityUnit: number; // Kapasitas untuk produk homogen (default 1.0)
  capacityConversionHeterogeneous?: number; // Konversi untuk produk heterogen
}

export enum VehicleStatus {
  DELIVERING = 'Sedang Mengirim',
  REPAIR = 'Dalam Perbaikan',
  IDLE = 'Idle',
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  capacity: number; // in gallons/units
  status: VehicleStatus;
}

export enum OrderStatus {
  PENDING = 'Pending',
  ROUTED = 'Routed',
  DELIVERING = 'Delivering',
  DELIVERED = 'Delivered',
  FAILED = 'Failed',
}

export interface OrderItem {
    productId: string;
    quantity: number;
    specialPrice?: number;
    originalPrice: number;
}

export interface Order {
  id: string;
  storeId: string;
  storeName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  orderDate: string;
  desiredDeliveryDate?: string;
  location: Coordinate;
  assignedVehicleId: string | null;
  orderedBy: { id: string; name: string; role: string; };
  priority?: boolean;
}

export enum VisitStatus {
    UPCOMING = 'Akan Datang',
    COMPLETED = 'Selesai',
    SKIPPED = 'Dilewati/Gagal',
}

export interface Visit {
  id: string;
  storeId: string;
  salesPersonId: string;
  visitDate: string; // YYYY-MM-DD
  purpose: string;
  status: VisitStatus;
  notes?: string;
  proofOfVisitImage?: string;
}

export interface SoughtProduct {
    brand: string;
    variant: string;
}

export interface CompetitorPrice {
    brand: string;
    variant: string;
    price: number;
}

export interface CompetitorVolume {
    brand: string;
    variant: string;
    volume: string; // e.g., "50 dus/bulan"
}

export interface SurveyResponse {
    id: string;
    salesPersonId: string;
    surveyDate: string;
    storeName: string;
    storeAddress: string;
    storePhone: string;
    mostSoughtProducts: SoughtProduct[];
    popularAirkuVariants: string[];
    competitorPrices: CompetitorPrice[];
    competitorVolumes: CompetitorVolume[];
    feedback: string;
    proofOfSurveyImage?: string;
}

export interface RouteStop {
  id: string; // Added from backend
  orderId: string;
  storeId: string;
  storeName: string;
  address: string;
  location: Coordinate;
  status: 'Pending' | 'Completed' | 'Failed';
  proofOfDeliveryImage?: string;
  failureReason?: string;
  distanceFromPrev?: number;
}

export interface RoutePlan {
  id: string;
  driverId: string;
  vehicleId: string;
  date: string;
  stops: RouteStop[];
  region: string;
}

export interface SalesVisitStop {
    visitId: string;
    storeId: string;
    storeName: string;
    address: string;
    purpose: string;
    location: Coordinate;
    status: VisitStatus;
    notes?: string; // For skip reason
    proofOfVisitImage?: string;
    distanceFromPrev?: number; // Jarak dari titik sebelumnya dalam KM
}

export interface SalesVisitRoutePlan {
    id: string;
    salesPersonId: string;
    date: string;
    stops: SalesVisitStop[];
}

export interface AppContextType {
  currentUser: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface FeedbackTheme {
    theme: string;
    quotes: string[];
}

export interface FeedbackAnalysisResult {
    summary: string;
    sentiment: 'Sangat Positif' | 'Positif' | 'Netral' | 'Negatif' | 'Sangat Negatif' | string;
    themes: FeedbackTheme[];
    totalAnalyzed: number;
}

// ============================================
// Capacity System Types
// ============================================

export interface CapacityDetail {
  productId: string;
  productName: string;
  quantity: number;
  conversionRate: number;
  capacityNeeded: number;
  isHomogeneous: boolean;
}

export interface CapacityValidationResult {
  totalCapacityUsed: number;
  remainingCapacity: number;
  isHomogeneous: boolean;
  canFit: boolean;
  utilizationPercentage: number;
  capacityDetails: CapacityDetail[];
  recommendation?: string;
}

export interface CapacityRecommendation {
  capacityUnit: number;
  capacityConversionHeterogeneous: number;
  explanation: string;
  sizeInLiter?: number;
}

export interface CapacityRecommendationResponse {
  productName: string;
  recommendation: CapacityRecommendation;
  guide: {
    capacityUnit: string;
    capacityConversionHeterogeneous: string;
    example: string;
  };
}

export interface OrderCapacityValidation extends CapacityValidationResult {
  orderId: string;
  vehicleId: string;
  vehicleName: string;
  vehicleCapacity: number;
}

export interface MultipleOrdersCapacityValidation extends CapacityValidationResult {
  vehicleId: string;
  vehicleName: string;
  vehicleCapacity: number;
  ordersCount: number;
  productTypes: number;
}
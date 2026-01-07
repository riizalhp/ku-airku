import api from './api';
import { 
  CapacityRecommendationResponse, 
  OrderCapacityValidation, 
  MultipleOrdersCapacityValidation 
} from '../types';

/**
 * Service untuk mengakses API Capacity System
 */

/**
 * Mendapatkan rekomendasi kapasitas berdasarkan nama produk
 * @param productName - Nama produk (misal: "240ml", "120ml", "19L")
 * @returns Rekomendasi kapasitas
 */
export const getCapacityRecommendation = async (
  productName: string
): Promise<CapacityRecommendationResponse> => {
  const response = await api.get<CapacityRecommendationResponse>(
    `/products/capacity-recommendation?productName=${encodeURIComponent(productName)}`
  );
  return response.data;
};

/**
 * Validasi apakah single order bisa dimuat dalam armada tertentu
 * @param orderId - ID order yang akan divalidasi
 * @param vehicleId - ID armada yang akan digunakan
 * @returns Hasil validasi kapasitas
 */
export const validateOrderCapacity = async (
  orderId: string,
  vehicleId: string
): Promise<OrderCapacityValidation> => {
  const response = await api.post<OrderCapacityValidation>(
    '/orders/validate-capacity',
    { orderId, vehicleId }
  );
  return response.data;
};

/**
 * Validasi apakah multiple orders bisa dimuat dalam 1 armada
 * @param orderIds - Array ID orders yang akan divalidasi
 * @param vehicleId - ID armada yang akan digunakan
 * @returns Hasil validasi kapasitas untuk multiple orders
 */
export const validateMultipleOrdersCapacity = async (
  orderIds: string[],
  vehicleId: string
): Promise<MultipleOrdersCapacityValidation> => {
  const response = await api.post<MultipleOrdersCapacityValidation>(
    '/orders/validate-multiple-capacity',
    { orderIds, vehicleId }
  );
  return response.data;
};

/**
 * Helper function untuk menghitung persentase utilisasi kapasitas
 * @param used - Kapasitas yang digunakan
 * @param total - Total kapasitas armada
 * @returns Persentase (0-100)
 */
export const calculateUtilizationPercentage = (
  used: number,
  total: number
): number => {
  if (total === 0) return 0;
  return Math.round((used / total) * 100 * 100) / 100;
};

/**
 * Helper function untuk format capacity display
 * @param capacity - Nilai kapasitas
 * @returns String yang sudah diformat
 */
export const formatCapacity = (capacity: number): string => {
  return capacity.toFixed(2);
};

/**
 * Helper function untuk mendapatkan warna status berdasarkan utilisasi
 * @param percentage - Persentase utilisasi (0-100)
 * @returns Warna (green, yellow, orange, red)
 */
export const getUtilizationColor = (percentage: number): string => {
  if (percentage <= 60) return 'green';
  if (percentage <= 80) return 'yellow';
  if (percentage <= 100) return 'orange';
  return 'red';
};

/**
 * Helper function untuk mendapatkan status icon berdasarkan canFit
 * @param canFit - Boolean apakah bisa dimuat
 * @returns Emoji atau icon string
 */
export const getCapacityStatusIcon = (canFit: boolean): string => {
  return canFit ? '✅' : '❌';
};

/**
 * Helper function untuk auto-calculate conversion berdasarkan ukuran produk
 * Ini adalah client-side fallback, server juga akan melakukan ini
 * @param productName - Nama produk
 * @returns Estimasi conversion rate
 */
export const estimateConversionRate = (productName: string): number => {
  // Ekstrak angka dari nama produk
  const sizeMatch = productName.match(/(\d+(?:\.\d+)?)\s*(ml|l|liter)/i);
  
  if (!sizeMatch) {
    return 1.0; // Default
  }

  const sizeValue = parseFloat(sizeMatch[1]);
  const sizeUnit = sizeMatch[2].toLowerCase();

  // Konversi ke liter
  let sizeInLiter = sizeValue;
  if (sizeUnit === 'ml') {
    sizeInLiter = sizeValue / 1000;
  }

  // Baseline: 19L (gallon) = 1.0
  const baselineSize = 19;
  const conversionRate = sizeInLiter / baselineSize;

  return Math.round(conversionRate * 100) / 100;
};

export default {
  getCapacityRecommendation,
  validateOrderCapacity,
  validateMultipleOrdersCapacity,
  calculateUtilizationPercentage,
  formatCapacity,
  getUtilizationColor,
  getCapacityStatusIcon,
  estimateConversionRate,
};

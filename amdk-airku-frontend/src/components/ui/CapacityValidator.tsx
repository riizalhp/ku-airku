import React, { useState, useEffect } from 'react';
import { 
  validateMultipleOrdersCapacity,
  getCapacityStatusIcon,
  formatCapacity
} from '../../services/capacityApiService';
import { 
  Order, 
  Vehicle, 
  MultipleOrdersCapacityValidation,
  CapacityDetail
} from '../../types';

interface CapacityValidatorProps {
  selectedOrders: Order[];
  vehicleId: string | null;
  vehicles: Vehicle[];
  onValidationComplete?: (result: MultipleOrdersCapacityValidation | null) => void;
}

export const CapacityValidator: React.FC<CapacityValidatorProps> = ({ 
  selectedOrders, 
  vehicleId, 
  vehicles,
  onValidationComplete 
}) => {
  const [validationResult, setValidationResult] = useState<MultipleOrdersCapacityValidation | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedVehicle = vehicles.find(v => v.id === vehicleId);

  useEffect(() => {
    // Auto-validate saat ada perubahan
    if (selectedOrders.length > 0 && vehicleId) {
      handleValidate();
    } else {
      setValidationResult(null);
    }
  }, [selectedOrders, vehicleId]);

  const handleValidate = async () => {
    if (!vehicleId || selectedOrders.length === 0) {
      setError('Pilih armada dan minimal 1 order untuk validasi.');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const orderIds = selectedOrders.map(o => o.id);
      const result = await validateMultipleOrdersCapacity(orderIds, vehicleId);
      setValidationResult(result);
      onValidationComplete?.(result);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memvalidasi kapasitas.');
      setValidationResult(null);
      onValidationComplete?.(null);
    } finally {
      setIsValidating(false);
    }
  };

  if (!selectedVehicle) return null;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">📦 Validasi Kapasitas</h3>
          <p className="text-sm text-gray-600">
            Armada: <span className="font-semibold">{selectedVehicle.model} ({selectedVehicle.plateNumber})</span>
          </p>
        </div>
        <button
          onClick={handleValidate}
          disabled={isValidating || selectedOrders.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm font-medium"
        >
          {isValidating ? 'Validasi...' : '🔄 Validasi Ulang'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">❌ {error}</p>
        </div>
      )}

      {/* Loading State */}
      {isValidating && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600 mt-2">Menghitung kapasitas...</p>
        </div>
      )}

      {/* Validation Result */}
      {validationResult && !isValidating && (
        <div className="space-y-4">
          {/* Summary Card */}
          <div className={`border-2 rounded-lg p-4 ${
            validationResult.canFit 
              ? 'bg-green-50 border-green-300' 
              : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{getCapacityStatusIcon(validationResult.canFit)}</span>
              <span className={`text-lg font-bold ${
                validationResult.canFit ? 'text-green-800' : 'text-red-800'
              }`}>
                {validationResult.canFit ? 'DAPAT DIMUAT' : 'TIDAK DAPAT DIMUAT'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600">Jumlah Order:</p>
                <p className="font-bold text-gray-800">{validationResult.ordersCount} order</p>
              </div>
              <div>
                <p className="text-gray-600">Jenis Produk:</p>
                <p className="font-bold text-gray-800">{validationResult.productTypes} jenis</p>
              </div>
              <div>
                <p className="text-gray-600">Tipe Muatan:</p>
                <p className="font-bold text-gray-800">
                  {validationResult.isHomogeneous ? '🟢 Homogen' : '🔵 Heterogen'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Utilisasi:</p>
                <p className={`font-bold ${
                  validationResult.utilizationPercentage > 100 ? 'text-red-600' : 'text-gray-800'
                }`}>
                  {validationResult.utilizationPercentage}%
                </p>
              </div>
            </div>
          </div>

          {/* Capacity Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium text-gray-700">
              <span>Kapasitas Terpakai</span>
              <span>{formatCapacity(validationResult.totalCapacityUsed)} / {validationResult.vehicleCapacity}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
              <div 
                className={`h-full flex items-center justify-center text-xs font-bold text-white transition-all duration-300 ${
                  validationResult.utilizationPercentage <= 60 ? 'bg-green-500' :
                  validationResult.utilizationPercentage <= 80 ? 'bg-yellow-500' :
                  validationResult.utilizationPercentage <= 100 ? 'bg-orange-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${Math.min(validationResult.utilizationPercentage, 100)}%` }}
              >
                {validationResult.utilizationPercentage > 10 && `${validationResult.utilizationPercentage}%`}
              </div>
            </div>
            {validationResult.canFit ? (
              <p className="text-sm text-green-700">
                ✅ Sisa kapasitas: <strong>{formatCapacity(validationResult.remainingCapacity)}</strong> ({(100 - validationResult.utilizationPercentage).toFixed(1)}% kosong)
              </p>
            ) : (
              <p className="text-sm text-red-700">
                ❌ Kelebihan kapasitas: <strong>{formatCapacity(Math.abs(validationResult.remainingCapacity))}</strong>
              </p>
            )}
          </div>

          {/* Details Table */}
          {validationResult.capacityDetails && validationResult.capacityDetails.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Produk</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700">Qty</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700">Konversi</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700">Kapasitas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {validationResult.capacityDetails.map((detail: CapacityDetail, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-800">{detail.productName}</td>
                      <td className="px-3 py-2 text-right text-gray-800">{detail.quantity}</td>
                      <td className="px-3 py-2 text-right text-gray-600">{detail.conversionRate}</td>
                      <td className="px-3 py-2 text-right font-medium text-gray-800">
                        {formatCapacity(detail.capacityNeeded)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-bold">
                    <td colSpan={3} className="px-3 py-2 text-right">Total:</td>
                    <td className="px-3 py-2 text-right text-gray-900">
                      {formatCapacity(validationResult.totalCapacityUsed)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Recommendation */}
          <div className={`rounded-lg p-3 text-sm ${
            validationResult.canFit 
              ? 'bg-blue-50 border border-blue-200 text-blue-800' 
              : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
          }`}>
            <p className="font-medium mb-1">💡 Rekomendasi:</p>
            <p>{validationResult.recommendation}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!validationResult && !isValidating && !error && selectedOrders.length > 0 && (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">Klik "Validasi Ulang" untuk mengecek kapasitas</p>
        </div>
      )}

      {selectedOrders.length === 0 && (
        <div className="text-center py-6 text-gray-400">
          <p className="text-sm">Pilih order untuk memulai validasi kapasitas</p>
        </div>
      )}
    </div>
  );
};

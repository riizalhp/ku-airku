import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { ICONS } from '../../constants';
import axios from 'axios';

interface ProductInput {
    productType: string;
    quantity: number;
}

interface CalculationResult {
    isHomogeneous: boolean;
    vehicleType: string;
    maxCapacity: number;
    products: Array<{
        productType: string;
        requestedQuantity: number;
        approvedQuantity: number;
        conversionRate: number;
        loadEquivalent: number;
        isReduced: boolean;
    }>;
    totalLoadEquivalent: number;
    remainingCapacity: number;
    utilizationPercentage: number;
    canFit: boolean;
    message: string;
}

export const CapacityCalculator: React.FC = () => {
    const [vehicleType, setVehicleType] = useState<'L300' | 'Cherry Box'>('L300');
    const [products, setProducts] = useState<ProductInput[]>([
        { productType: '240ml', quantity: 0 }
    ]);
    const [result, setResult] = useState<CalculationResult | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const productTypes = ['240ml', '120ml', '600ml', '330ml', '19L'];

    const handleAddProduct = () => {
        setProducts([...products, { productType: '240ml', quantity: 0 }]);
    };

    const handleRemoveProduct = (index: number) => {
        setProducts(products.filter((_, i) => i !== index));
    };

    const handleProductChange = (index: number, field: 'productType' | 'quantity', value: string | number) => {
        const newProducts = [...products];
        newProducts[index] = {
            ...newProducts[index],
            [field]: field === 'quantity' ? parseInt(value as string) || 0 : value
        };
        setProducts(newProducts);
    };

    const handleCalculate = async () => {
        setIsCalculating(true);
        setError(null);
        setResult(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:3001/api/capacity/calculate',
                {
                    products: products.filter(p => p.quantity > 0),
                    vehicleType
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setResult(response.data.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal menghitung kapasitas');
        } finally {
            setIsCalculating(false);
        }
    };

    const handleReset = () => {
        setProducts([{ productType: '240ml', quantity: 0 }]);
        setResult(null);
        setError(null);
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-brand-dark">Kalkulator Kapasitas Kendaraan</h1>
                    <p className="text-gray-600 mt-1">Hitung kapasitas muatan berdasarkan jenis produk dan kendaraan</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <Card>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">📦 Input Muatan</h2>
                    
                    {/* Vehicle Type Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipe Kendaraan
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setVehicleType('L300')}
                                className={`p-3 border-2 rounded-lg text-sm font-medium transition ${
                                    vehicleType === 'L300'
                                        ? 'border-brand-primary bg-brand-primary text-white'
                                        : 'border-gray-300 text-gray-700 hover:border-brand-primary'
                                }`}
                            >
                                <div className="font-bold">L300</div>
                                <div className="text-xs opacity-80">Kapasitas: 200 unit</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setVehicleType('Cherry Box')}
                                className={`p-3 border-2 rounded-lg text-sm font-medium transition ${
                                    vehicleType === 'Cherry Box'
                                        ? 'border-brand-primary bg-brand-primary text-white'
                                        : 'border-gray-300 text-gray-700 hover:border-brand-primary'
                                }`}
                            >
                                <div className="font-bold">Cherry Box</div>
                                <div className="text-xs opacity-80">Kapasitas: 170 unit</div>
                            </button>
                        </div>
                    </div>

                    {/* Products List */}
                    <div className="space-y-3 mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Produk yang Dimuat
                        </label>
                        {products.map((product, index) => (
                            <div key={index} className="flex gap-2">
                                <select
                                    value={product.productType}
                                    onChange={(e) => handleProductChange(index, 'productType', e.target.value)}
                                    className="flex-1 p-2 border rounded-lg"
                                >
                                    {productTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    value={product.quantity}
                                    onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                    placeholder="Jumlah"
                                    className="w-32 p-2 border rounded-lg"
                                    min="0"
                                />
                                {products.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveProduct(index)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                    >
                                        <ICONS.trash width={20} height={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={handleAddProduct}
                        className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-brand-primary hover:text-brand-primary transition mb-4"
                    >
                        + Tambah Produk
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={handleCalculate}
                            disabled={isCalculating || products.every(p => p.quantity === 0)}
                            className="flex-1 bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-dark transition disabled:bg-gray-400"
                        >
                            {isCalculating ? 'Menghitung...' : '🧮 Hitung Kapasitas'}
                        </button>
                        <button
                            onClick={handleReset}
                            className="bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition"
                        >
                            Reset
                        </button>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            ⚠️ {error}
                        </div>
                    )}
                </Card>

                {/* Result Section */}
                <Card>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 Hasil Perhitungan</h2>
                    
                    {!result ? (
                        <div className="text-center py-12 text-gray-500">
                            <div className="text-4xl mb-2">📦</div>
                            <p>Masukkan data dan klik "Hitung Kapasitas"</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Status Badge */}
                            <div className={`p-4 rounded-lg ${result.canFit ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">{result.canFit ? '✅' : '⚠️'}</span>
                                    <span className="font-bold text-lg">
                                        {result.isHomogeneous ? 'Muatan Homogen' : 'Muatan Heterogen'}
                                    </span>
                                </div>
                                <p className="text-sm">{result.message}</p>
                            </div>

                            {/* Capacity Overview */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <div className="text-xs text-blue-700 font-medium">Total Beban</div>
                                    <div className="text-2xl font-bold text-blue-900">{result.totalLoadEquivalent}</div>
                                    <div className="text-xs text-blue-600">setara 240ml</div>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <div className="text-xs text-purple-700 font-medium">Sisa Kapasitas</div>
                                    <div className="text-2xl font-bold text-purple-900">{result.remainingCapacity}</div>
                                    <div className="text-xs text-purple-600">unit tersisa</div>
                                </div>
                            </div>

                            {/* Utilization Bar */}
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Utilisasi Kapasitas</span>
                                    <span className="font-bold">{result.utilizationPercentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                    <div
                                        className={`h-4 rounded-full transition-all ${
                                            result.utilizationPercentage > 90
                                                ? 'bg-red-500'
                                                : result.utilizationPercentage > 75
                                                ? 'bg-yellow-500'
                                                : 'bg-green-500'
                                        }`}
                                        style={{ width: `${Math.min(result.utilizationPercentage, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Products Detail */}
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-2">Detail Per Produk:</h3>
                                <div className="space-y-2">
                                    {result.products.map((product, index) => (
                                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-medium">{product.productType}</span>
                                                {product.isReduced && (
                                                    <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">
                                                        Dikurangi
                                                    </span>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                                <div>
                                                    <span className="font-medium">Diminta:</span> {product.requestedQuantity} unit
                                                </div>
                                                <div>
                                                    <span className="font-medium">Disetujui:</span> {product.approvedQuantity} unit
                                                </div>
                                                <div>
                                                    <span className="font-medium">Konversi:</span> {product.conversionRate}x
                                                </div>
                                                <div>
                                                    <span className="font-medium">Beban:</span> {product.loadEquivalent.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                                <p className="font-semibold mb-1">💡 Catatan:</p>
                                <ul className="list-disc list-inside space-y-0.5">
                                    <li><strong>Homogen</strong>: Hanya 1 jenis produk, menggunakan kapasitas spesifik</li>
                                    <li><strong>Heterogen</strong>: 2+ jenis produk, menggunakan conversion rate</li>
                                    <li>Jika melebihi kapasitas, jumlah akan dikurangi secara proporsional</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

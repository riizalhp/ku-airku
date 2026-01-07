import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../ui/Card';
import { ICONS } from '../../constants';
import { Product } from '../../types';
import { Modal } from '../ui/Modal';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/productApiService';
import { getCapacityRecommendation, estimateConversionRate } from '../../services/capacityApiService';

export const ProductManagement: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const initialFormState: Omit<Product, 'id' | 'reservedStock'> = { 
        sku: '', 
        name: '', 
        price: 0, 
        stock: 0, 
        capacityUnit: 1,
        capacityConversionHeterogeneous: 1 
    };
    const [currentProduct, setCurrentProduct] = useState<Omit<Product, 'id' | 'reservedStock'> | Product>(initialFormState);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [apiError, setApiError] = useState<string | null>(null);
    const [autoCalculate, setAutoCalculate] = useState(true);
    const [capacityPreview, setCapacityPreview] = useState<string>('');

    const { data: products = [], isLoading } = useQuery<Product[]>({
      queryKey: ['products'],
      queryFn: getProducts,
    });

    const createMutation = useMutation({
        mutationFn: createProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setIsModalOpen(false);
            alert('Produk baru berhasil ditambahkan!');
        },
        onError: (error: any) => setApiError(error.response?.data?.message || 'Gagal membuat produk.'),
    });

    const updateMutation = useMutation({
        mutationFn: updateProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setIsModalOpen(false);
            alert('Data produk berhasil diperbarui!');
        },
        onError: (error: any) => setApiError(error.response?.data?.message || 'Gagal memperbarui produk.'),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            alert('Produk berhasil dihapus.');
        },
        onError: (error: any) => alert(error.response?.data?.message || 'Gagal menghapus produk.'),
    });

    const filteredProducts = useMemo(() => {
        return [...products].reverse().filter(product => {
            const term = searchTerm.toLowerCase();
            return product.name.toLowerCase().includes(term) ||
                   product.sku.toLowerCase().includes(term);
        });
    }, [products, searchTerm]);

    const openModalForAdd = () => {
        setIsEditing(false);
        setCurrentProduct(initialFormState);
        setApiError(null);
        setIsModalOpen(true);
    };

    const openModalForEdit = (product: Product) => {
        setIsEditing(true);
        setCurrentProduct(product);
        setApiError(null);
        setIsModalOpen(true);
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const isNumericField = ['price', 'stock', 'capacityUnit', 'capacityConversionHeterogeneous'].includes(name);
        setCurrentProduct(prev => ({ 
            ...prev, 
            [name]: isNumericField ? parseFloat(value) || 0 : value 
        }));
    };

    // Auto-calculate capacity saat nama produk berubah
    useEffect(() => {
        if (autoCalculate && currentProduct.name && !isEditing) {
            const estimated = estimateConversionRate(currentProduct.name);
            setCurrentProduct(prev => ({ 
                ...prev, 
                capacityConversionHeterogeneous: estimated 
            }));
        }
    }, [currentProduct.name, autoCalculate, isEditing]);

    // Update preview capacity
    useEffect(() => {
        if (currentProduct.capacityConversionHeterogeneous) {
            const vehicleCapacity = 200; // Contoh kapasitas armada
            const maxUnitsHomogen = Math.floor(vehicleCapacity / (currentProduct.capacityUnit || 1));
            const maxUnitsHeterogen = Math.floor(vehicleCapacity / (currentProduct.capacityConversionHeterogeneous || 1));
            
            setCapacityPreview(
                `Armada kapasitas ${vehicleCapacity}: \n` +
                `• Homogen (1 produk): ${maxUnitsHomogen} unit\n` +
                `• Heterogen (campur): ${maxUnitsHeterogen} unit`
            );
        }
    }, [currentProduct.capacityUnit, currentProduct.capacityConversionHeterogeneous]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setApiError(null);
        if (currentProduct.name && currentProduct.sku && currentProduct.price > 0) {
            if (isEditing) {
                updateMutation.mutate(currentProduct as Product);
            } else {
                createMutation.mutate(currentProduct as Omit<Product, 'id' | 'reservedStock'>);
            }
        }
    };

    const handleDelete = (productId: string) => {
        if (window.confirm('Anda yakin ingin menghapus produk ini?')) {
            deleteMutation.mutate(productId);
        }
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-brand-dark">Manajemen Produk</h1>
                <button
                    onClick={openModalForAdd}
                    className="flex items-center gap-2 bg-brand-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-brand-dark transition duration-300"
                >
                    <ICONS.plus />
                    Tambah Produk
                </button>
            </div>

             <Card>
                <div className="max-w-md">
                    <label htmlFor="searchProduct" className="block text-sm font-medium text-gray-700">Cari Produk</label>
                    <input
                        id="searchProduct"
                        type="text"
                        placeholder="Masukkan nama produk atau SKU..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                </div>
            </Card>

            <Card className="!p-0">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-700">
                        <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                            <tr>
                                <th scope="col" className="px-6 py-3">SKU</th>
                                <th scope="col" className="px-6 py-3">Nama Produk</th>
                                <th scope="col" className="px-6 py-3">Harga</th>
                                <th scope="col" className="px-6 py-3">Stok Tersedia</th>
                                <th scope="col" className="px-6 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={5} className="text-center p-4">Memuat produk...</td></tr>
                            ) : filteredProducts.map((product: Product) => (
                                <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono text-gray-500">{product.sku}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4">Rp {product.price.toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{product.stock - product.reservedStock}</span>
                                            <span className="text-xs text-gray-500">({product.stock} Total, {product.reservedStock} Dipesan)</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 flex space-x-2">
                                        <button onClick={() => openModalForEdit(product)} className="text-blue-600 hover:text-blue-800 p-1"><ICONS.edit width={20} height={20} /></button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            disabled={deleteMutation.isPending}
                                            className="text-red-600 hover:text-red-800 p-1 disabled:text-gray-400"
                                        >
                                            <ICONS.trash width={20} height={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {!isLoading && filteredProducts.length === 0 && (
                        <p className="text-center text-gray-500 py-6">Tidak ada produk ditemukan.</p>
                    )}
                </div>
            </Card>

            <Modal title={isEditing ? "Edit Produk" : "Tambah Produk Baru"} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {apiError && <p className="text-sm text-red-600 bg-red-100 p-2 rounded">{apiError}</p>}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Produk</label>
                        <input type="text" name="name" id="name" value={currentProduct.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                    </div>
                    <div>
                        <label htmlFor="sku" className="block text-sm font-medium text-gray-700">SKU</label>
                        <input type="text" name="sku" id="sku" value={currentProduct.sku} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Harga (Rp)</label>
                            <input type="number" name="price" id="price" value={currentProduct.price} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                        </div>
                        <div>
                            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stok Fisik Total</label>
                            <input type="number" name="stock" id="stock" value={currentProduct.stock} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                        </div>
                    </div>
                    {/* Pengaturan Kapasitas */}
                    <div className="border-t pt-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-700">⚙️ Pengaturan Kapasitas</h3>
                            <label className="flex items-center gap-2 text-sm">
                                <input 
                                    type="checkbox" 
                                    checked={autoCalculate}
                                    onChange={(e) => setAutoCalculate(e.target.checked)}
                                    disabled={isEditing}
                                    className="rounded"
                                />
                                <span className="text-gray-600">Hitung Otomatis</span>
                            </label>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                            <p className="font-medium mb-1">💡 Cara Kerja:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li><strong>Homogen</strong>: Armada angkut 1 jenis produk saja (gunakan Capacity Unit)</li>
                                <li><strong>Heterogen</strong>: Armada angkut berbagai produk (gunakan Konversi Heterogen)</li>
                            </ul>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="capacityUnit" className="block text-sm font-medium text-gray-700">
                                    Capacity Unit
                                    <span className="text-xs text-gray-500 block mt-0.5">(Untuk produk homogen)</span>
                                </label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    name="capacityUnit" 
                                    id="capacityUnit" 
                                    value={currentProduct.capacityUnit} 
                                    onChange={handleInputChange} 
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500" 
                                    required 
                                />
                            </div>
                            <div>
                                <label htmlFor="capacityConversionHeterogeneous" className="block text-sm font-medium text-gray-700">
                                    Konversi Heterogen
                                    <span className="text-xs text-gray-500 block mt-0.5">(Untuk produk campur)</span>
                                </label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    name="capacityConversionHeterogeneous" 
                                    id="capacityConversionHeterogeneous" 
                                    value={currentProduct.capacityConversionHeterogeneous || 1} 
                                    onChange={handleInputChange} 
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500" 
                                    disabled={autoCalculate && !isEditing}
                                    required 
                                />
                            </div>
                        </div>

                        {capacityPreview && (
                            <div className="bg-green-50 p-3 rounded-lg">
                                <p className="text-xs font-medium text-green-800 mb-1">📊 Preview Kapasitas:</p>
                                <pre className="text-xs text-green-700 whitespace-pre-line">{capacityPreview}</pre>
                            </div>
                        )}

                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                            <strong>Contoh:</strong> Produk 240ml = 1.0, Produk 120ml = 0.5 (setengah ukuran)
                        </div>
                    </div>
                    {isEditing && 'reservedStock' in currentProduct &&
                         <p className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded-md">Stok dipesan saat ini: {currentProduct.reservedStock}. Mengubah stok fisik tidak akan memengaruhi stok yang sudah dipesan.</p>
                    }
                    <div className="flex justify-end pt-4">
                         <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg mr-2 hover:bg-gray-300">Batal</button>
                        <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-dark disabled:bg-gray-400">
                            {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : (isEditing ? "Simpan Perubahan" : "Tambah Produk")}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
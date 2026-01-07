import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../ui/Card';
import { Pagination, ItemsPerPageSelector } from '../ui/Pagination';
import { ICONS } from '../../constants';
import { Product } from '../../types';
import { Modal } from '../ui/Modal';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/productApiService';
import { estimateConversionRate } from '../../services/capacityApiService';

export const ProductManagement: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const initialFormState: Omit<Product, 'id' | 'reservedStock'> = { 
        sku: '', 
        name: '', 
        price: 0, 
        stock: 0, 
        capacityConversionHeterogeneous: 1 
    };
    const [currentProduct, setCurrentProduct] = useState<Omit<Product, 'id' | 'reservedStock'> | Product>(initialFormState);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
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

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredProducts.slice(startIndex, endIndex);
    }, [filteredProducts, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

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
        const isNumericField = ['price', 'stock', 'capacityConversionHeterogeneous'].includes(name);
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
            // Heterogeneous capacity menggunakan conversion rate
            const l300Capacity = 200;
            const cherryBoxCapacity = 170;
            const maxUnitsHeterogenL300 = Math.floor(l300Capacity / (currentProduct.capacityConversionHeterogeneous || 1));
            const maxUnitsHeterogenCherryBox = Math.floor(cherryBoxCapacity / (currentProduct.capacityConversionHeterogeneous || 1));
            
            setCapacityPreview(
                `📦 Kapasitas Heterogen (Produk Campur):\n` +
                `• L300 (200 cap): ${maxUnitsHeterogenL300} unit\n` +
                `• Cherry Box (170 cap): ${maxUnitsHeterogenCherryBox} unit\n\n` +
                `💡 Kapasitas Homogen tergantung jenis armada & produk (lihat kalkulator)`
            );
        }
    }, [currentProduct.capacityConversionHeterogeneous]);

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

            <div className="flex justify-end mb-4">
                <ItemsPerPageSelector
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={(value) => {
                        setItemsPerPage(value);
                        setCurrentPage(1);
                    }}
                />
            </div>

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
                            ) : paginatedProducts.map((product: Product) => (
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
                     {!isLoading && paginatedProducts.length === 0 && (
                        <p className="text-center text-gray-500 py-6">Tidak ada produk ditemukan.</p>
                    )}
                </div>
            </Card>

            {!isLoading && filteredProducts.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredProducts.length}
                />
            )}

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
                            <p className="font-medium mb-1">💡 Tentang Kapasitas:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li><strong>Homogen</strong>: Kapasitas tergantung jenis armada & produk (sudah di-hardcode di sistem)</li>
                                <li><strong>Heterogen</strong>: Gunakan nilai konversi di bawah untuk produk campur</li>
                                <li>Contoh: Air 240ml = 1.0, Air 120ml = 0.571, Galon 19L = 3.33</li>
                            </ul>
                        </div>

                        <div>
                            <label htmlFor="capacityConversionHeterogeneous" className="block text-sm font-medium text-gray-700">
                                Konversi Kapasitas (Heterogen)
                                <span className="text-xs text-gray-500 block mt-0.5">Nilai konversi relatif terhadap 240ml (=1.0)</span>
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

                        {capacityPreview && (
                            <div className="bg-green-50 p-3 rounded-lg">
                                <p className="text-xs font-medium text-green-800 mb-1">📊 Preview Kapasitas:</p>
                                <pre className="text-xs text-green-700 whitespace-pre-line">{capacityPreview}</pre>
                            </div>
                        )}
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
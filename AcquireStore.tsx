import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../ui/Card';
import { ICONS } from '../../constants';
import { createStore, classifyRegion } from '../../services/storeApiService';

const parseCoordinatesFromURL = (url: string): { lat: number; lng: number } | null => {
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match && match[1] && match[2]) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    return null;
};

export const AcquireStore: React.FC = () => {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({ 
        name: '', 
        owner: '', 
        phone: '', 
        address: '', 
        googleMapsLink: '',
        isPartner: false, 
        partnerCode: '' 
    });
    const [apiError, setApiError] = useState('');
    const [detectedRegion, setDetectedRegion] = useState('');
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
    
    const classifyMutation = useMutation({ 
        mutationFn: classifyRegion, 
        onSuccess: (data) => { 
            setDetectedRegion(data.region); 
            if (data.region === 'Bukan di Kulon Progo') {
                setApiError('Lokasi di luar wilayah layanan.');
            } else {
                setApiError('');
            }
        }, 
        onError: () => setApiError('Gagal mendeteksi wilayah.') 
    });
    
    const createStoreMutation = useMutation({ 
        mutationFn: createStore, 
        onSuccess: () => { 
            alert('Toko baru berhasil dibuat!'); 
            queryClient.invalidateQueries({queryKey: ['stores']}); 
            setForm({ 
                name: '', 
                owner: '', 
                phone: '', 
                address: '', 
                googleMapsLink: '',
                isPartner: false, 
                partnerCode: '' 
            }); 
            setDetectedRegion('');
            setCoordinates(null);
        }, 
        onError: (err: any) => setApiError(err.response?.data?.message || 'Gagal membuat toko.') 
    });
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        
        setForm(prev => ({
            ...prev,
            [name]: newValue
        }));
    };
    
    const handleClassify = () => { 
        const coords = parseCoordinatesFromURL(form.googleMapsLink); 
        if (coords) {
            setCoordinates(coords);
            classifyMutation.mutate(coords); 
        } else {
            setApiError('Link Google Maps tidak valid.');
            setCoordinates(null);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); 
        setApiError('');
        
        if (!coordinates || !detectedRegion || detectedRegion === 'Bukan di Kulon Progo') { 
            setApiError('Lokasi tidak valid atau belum dideteksi.'); 
            return; 
        }
        
        if (form.isPartner && !form.partnerCode) { 
            setApiError('Kode Mitra wajib diisi.'); 
            return; 
        }
        
        createStoreMutation.mutate({ 
            ...form, 
            location: coordinates, 
            region: detectedRegion 
        });
    };

    return (
        <Card>
            <h2 className="text-xl font-bold mb-4">Akuisisi Toko Baru</h2>
            <Card className="bg-blue-50 border border-blue-200 mb-4">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 text-brand-primary pt-1">
                        <ICONS.mapPin />
                    </div>
                    <div>
                        <h3 className="text-md font-bold text-brand-dark">Informasi Pembagian Wilayah</h3>
                        <p className="text-sm text-gray-700 mt-1">
                            Titik penentu wilayah <strong>Timur</strong> dan <strong>Barat</strong> adalah garis bujur (longitude) kantor PDAM Tirta Binangun di <strong>110.1486773</strong>.
                            Deteksi wilayah otomatis akan mengklasifikasikan lokasi toko berdasarkan titik ini.
                        </p>
                    </div>
                </div>
            </Card>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    name="name"
                    placeholder="Nama Toko" 
                    value={form.name} 
                    onChange={handleInputChange} 
                    className="w-full p-2 border rounded" 
                    required
                />
                <input 
                    type="text" 
                    name="owner"
                    placeholder="Nama Pemilik" 
                    value={form.owner} 
                    onChange={handleInputChange} 
                    className="w-full p-2 border rounded" 
                    required
                />
                <input 
                    type="text" 
                    name="phone"
                    placeholder="Nomor Telepon" 
                    value={form.phone} 
                    onChange={handleInputChange} 
                    className="w-full p-2 border rounded" 
                    required
                />
                <input 
                    type="text" 
                    name="address"
                    placeholder="Alamat" 
                    value={form.address} 
                    onChange={handleInputChange} 
                    className="w-full p-2 border rounded" 
                    required
                />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link Google Maps</label>
                    <div className="flex gap-2">
                        <input 
                            type="url" 
                            name="googleMapsLink"
                            placeholder="Tempel link Google Maps di sini" 
                            value={form.googleMapsLink} 
                            onChange={handleInputChange} 
                            className="flex-1 p-2 border rounded" 
                            required
                        />
                        <button 
                            type="button" 
                            onClick={handleClassify} 
                            disabled={classifyMutation.isPending || !form.googleMapsLink} 
                            className="bg-brand-secondary text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-400"
                        >
                            {classifyMutation.isPending ? 'Menganalisis...' : 'Deteksi Wilayah'}
                        </button>
                    </div>
                    {coordinates && (
                        <div className="mt-2">
                            <p className="text-xs text-gray-600">
                                Koordinat Terdeteksi: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                            </p>
                        </div>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Wilayah</label>
                    <div className={`w-full p-2 border rounded font-semibold ${
                        detectedRegion === 'Bukan di Kulon Progo'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-900'
                    }`}>
                        {classifyMutation.isPending ? 'Menganalisis...' : detectedRegion || 'Tempel link Google Maps untuk deteksi otomatis'}
                    </div>
                </div>
                <div className="pt-4 border-t">
                    <div className="flex items-center space-x-3">
                        <input 
                            type="checkbox" 
                            id="isPartner" 
                            name="isPartner"
                            checked={form.isPartner} 
                            onChange={handleInputChange} 
                            className="h-4 w-4" 
                        /> 
                        <label htmlFor="isPartner">Jadikan Mitra</label>
                    </div>
                    {form.isPartner && (
                        <input 
                            type="text" 
                            name="partnerCode"
                            placeholder="Kode Mitra" 
                            value={form.partnerCode} 
                            onChange={handleInputChange} 
                            className="mt-2 w-full p-2 border rounded" 
                            required={form.isPartner}
                        />
                    )}
                </div>
                {apiError && <p className="text-sm text-red-600">{apiError}</p>}
                <button 
                    type="submit" 
                    className="w-full bg-brand-primary text-white font-bold py-3 rounded-lg disabled:bg-gray-400" 
                    disabled={
                        createStoreMutation.isPending || 
                        !detectedRegion || 
                        detectedRegion === 'Bukan di Kulon Progo' ||
                        (form.isPartner && !form.partnerCode)
                    }
                >
                    {createStoreMutation.isPending ? 'Menyimpan...' : 'Tambah Toko'}
                </button>
            </form>
        </Card>
    );
};
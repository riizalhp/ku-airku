import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { SalesVisitStop } from '../../types';
import { ICONS } from '../../constants';

interface SalesRouteMapProps {
  stops: SalesVisitStop[];
  depot: { lat: number, lng: number };
}

// Fix for default marker icon issue with bundlers like Vite/Webpack
const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

const depotIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const stopIcon = (index: number) => new L.DivIcon({
    html: `<div class="w-6 h-6 bg-yellow-500 text-black rounded-full flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">${index + 1}</div>`,
    className: 'bg-transparent border-0',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

// Icon untuk lokasi tidak valid
const invalidLocationIcon = new L.DivIcon({
    html: `<div class="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">!</div>`,
    className: 'bg-transparent border-0',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

const RecenterAutomatically = ({bounds}: {bounds: L.LatLngBounds}) => {
    const map = useMap();
    React.useEffect(() => {
        if(bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [bounds, map]);
    return null;
}

export const SalesRouteMap: React.FC<SalesRouteMapProps> = ({ stops, depot }) => {
  // Pisahkan stops dengan dan tanpa koordinat valid
  const stopsWithCoords = stops.filter(stop => 
    stop.location && 
    typeof stop.location.lat === 'number' && 
    typeof stop.location.lng === 'number' &&
    stop.location.lat !== 0 && 
    stop.location.lng !== 0
  );
  
  const stopsWithoutCoords = stops.filter(stop => 
    !stop.location || 
    typeof stop.location.lat !== 'number' || 
    typeof stop.location.lng !== 'number' ||
    (stop.location.lat === 0 && stop.location.lng === 0)
  );
  
  const hasMissingCoords = stops.length > stopsWithCoords.length;
  const noStopsToShow = stops.length > 0 && stopsWithCoords.length === 0;

  // Buat path positions untuk semua stops dengan koordinat valid
  const pathPositions: L.LatLngExpression[] = stopsWithCoords.length > 0
    ? [
        [depot.lat, depot.lng],
        ...stopsWithCoords.map(s => [s.location.lat, s.location.lng] as [number, number]),
        [depot.lat, depot.lng], // Return to depot to complete the route
      ]
    : [[depot.lat, depot.lng]];

  // Hitung bounds untuk semua titik, termasuk depot
  let allPositions = [[depot.lat, depot.lng]];
  if (stopsWithCoords.length > 0) {
    allPositions = [
      ...allPositions,
      ...stopsWithCoords.map(s => [s.location.lat, s.location.lng] as [number, number])
    ];
  }
  
  // Jika tidak ada stops dengan koordinat, gunakan posisi depot saja
  const bounds = L.latLngBounds(allPositions.length > 0 ? allPositions : [[depot.lat, depot.lng]]);

  return (
    <div className="relative h-[500px] w-full rounded-lg overflow-hidden">
        <MapContainer center={[depot.lat, depot.lng]} zoom={13} style={{ height: '100%', width: '100%' }} className="z-0">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterAutomatically bounds={bounds} />

            <Marker position={[depot.lat, depot.lng]} icon={depotIcon}>
                <Popup>Gudang (PDAM Tirta Binangun)</Popup>
            </Marker>
            
            {/* Tampilkan semua stops dengan koordinat valid */}
            {stopsWithCoords.map((stop, index) => (
                <Marker key={stop.visitId} position={[stop.location.lat, stop.location.lng]} icon={stopIcon(index)}>
                    <Popup>
                        <div className="font-bold">{stop.storeName}</div>
                        <div className="text-sm text-gray-600">{stop.address}</div>
                        <div className="text-xs text-gray-400 border-t mt-2 pt-1">
                            Tujuan Kunjungan: {stop.purpose}
                        </div>
                        <div className="text-xs text-gray-400">
                            Koordinat: {stop.location.lat.toFixed(6)}, {stop.location.lng.toFixed(6)}
                        </div>
                    </Popup>
                </Marker>
            ))}
            
            {/* Tampilkan stops tanpa koordinat valid dengan marker khusus */}
            {stopsWithoutCoords.map((stop, index) => (
                <Marker 
                    key={stop.visitId} 
                    position={[depot.lat, depot.lng]} // Tempatkan di depot sebagai fallback
                    icon={invalidLocationIcon}
                >
                    <Popup>
                        <div className="font-bold text-red-600">{stop.storeName}</div>
                        <div className="text-sm text-gray-600">{stop.address}</div>
                        <div className="text-xs text-red-500 border-t mt-2 pt-1">
                            Tujuan Kunjungan: {stop.purpose}
                        </div>
                        <div className="text-xs text-red-500">
                            Lokasi tidak tersedia
                        </div>
                    </Popup>
                </Marker>
            ))}

            {stopsWithCoords.length > 0 && (
                <Polyline positions={pathPositions} color="#0077B6" weight={4} opacity={0.7} />
            )}
        </MapContainer>
        
        {/* Hapus pesan error yang menyembunyikan peta */}
        {noStopsToShow && (
             <div className="absolute top-0 left-0 right-0 z-[1000] p-4 pointer-events-none">
                 <div className="p-3 rounded-lg shadow-xl text-white flex items-center gap-3 max-w-md mx-auto pointer-events-auto bg-red-500/90">
                    <ICONS.mapPin className="h-6 w-6 flex-shrink-0" />
                    <div className="text-left">
                        <h3 className="text-sm font-bold">Perhatian</h3>
                        <p className="text-xs">Beberapa lokasi tidak memiliki koordinat yang valid.</p>
                    </div>
                 </div>
            </div>
        )}

        {hasMissingCoords && !noStopsToShow && (
             <div className="absolute top-0 left-0 right-0 z-[1000] p-4 pointer-events-none">
                 <div className="p-3 rounded-lg shadow-xl text-white flex items-center gap-3 max-w-md mx-auto pointer-events-auto bg-yellow-500/90">
                    <ICONS.mapPin className="h-6 w-6 flex-shrink-0" />
                    <div className="text-left">
                        <h3 className="text-sm font-bold">Data Tidak Lengkap</h3>
                        <p className="text-xs">{stopsWithoutCoords.length} dari {stops.length} lokasi tidak memiliki koordinat valid.</p>
                    </div>
                 </div>
            </div>
        )}
    </div>
  );
};
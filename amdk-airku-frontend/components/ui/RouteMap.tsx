
import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

interface StopWithLocation {
  id: string;
  storeName: string;
  address: string;
  location: { lat: number; lng: number };
}

interface RouteMapProps {
  stops: StopWithLocation[];
  depot: { lat: number; lng: number };
}

// Fix for default marker icon issue
const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = defaultIcon;

const depotIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const stopIcon = (index: number) => new L.DivIcon({
    html: `<div class="w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center font-bold text-xs border-2 border-white shadow-md">${index + 1}</div>`,
    className: 'bg-transparent border-0',
    iconSize: [24, 24], iconAnchor: [12, 12]
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

export const RouteMap: React.FC<RouteMapProps> = ({ stops, depot }) => {
  const stopsWithCoords = stops.filter(stop => stop.location && typeof stop.location.lat === 'number' && typeof stop.location.lng === 'number');
  
  if (stopsWithCoords.length === 0) {
      return (
          <div className="relative h-[400px] w-full rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">Tidak ada data lokasi untuk ditampilkan.</p>
          </div>
      );
  }

  const pathPositions: L.LatLngExpression[] = [
        [depot.lat, depot.lng],
        ...stopsWithCoords.map(s => [s.location.lat, s.location.lng] as [number, number]),
        [depot.lat, depot.lng],
      ];

  const bounds = L.latLngBounds(pathPositions.slice(0, pathPositions.length - 1));

  return (
    <div className="relative h-[400px] w-full rounded-lg overflow-hidden border">
        <MapContainer center={[depot.lat, depot.lng]} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }} className="z-0">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterAutomatically bounds={bounds} />

            <Marker position={[depot.lat, depot.lng]} icon={depotIcon}>
                <Popup>Gudang (PDAM Tirta Binangun)</Popup>
            </Marker>
            
            {stopsWithCoords.map((stop, index) => (
                <Marker key={stop.id || index} position={[stop.location.lat, stop.location.lng]} icon={stopIcon(index)}>
                    <Popup>
                        <div className="font-bold">{stop.storeName}</div>
                        <div className="text-sm text-gray-600">{stop.address}</div>
                    </Popup>
                </Marker>
            ))}

            <Polyline positions={pathPositions} color="#0077B6" weight={4} opacity={0.7} />
        </MapContainer>
    </div>
  );
};

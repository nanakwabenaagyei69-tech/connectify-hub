import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const purpleIcon = L.divIcon({
  className: "links-marker",
  html: `<div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#a855f7,#d946ef);box-shadow:0 0 0 4px rgba(168,85,247,.25),0 4px 14px rgba(168,85,247,.5);border:2px solid white;"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

export type MapEvent = {
  id: string;
  title: string;
  location_name: string;
  latitude: number;
  longitude: number;
  starts_at: string;
};

export default function EventsMap({ events }: { events: MapEvent[] }) {
  const center: [number, number] = events[0] ? [events[0].latitude, events[0].longitude] : [20, 0];
  return (
    <MapContainer center={center} zoom={events.length ? 3 : 2} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; OpenStreetMap, &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {events.map((e) => (
        <Marker key={e.id} position={[e.latitude, e.longitude]} icon={purpleIcon}>
          <Popup>
            <div style={{ fontSize: 12 }}>
              <div style={{ fontWeight: 700 }}>{e.title}</div>
              <div>{e.location_name}</div>
              <div>{new Date(e.starts_at).toLocaleString()}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
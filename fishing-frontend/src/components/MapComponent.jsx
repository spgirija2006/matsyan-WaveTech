import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const LocationSelector = ({ onSelect }) => {
  const fetchWeather = async (lat, lon) => {
    const apiKey = "64b724dbc5a98a4d05d27e6fecdd245a"; // Keep this secret in production
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const temperature = data.main.temp;
      const windSpeed = data.wind.speed;

      onSelect({
        latitude: lat,
        longitude: lon,
        sea_surface_temperature: temperature,
        wind_speed: windSpeed
      });
    } catch (error) {
      console.error("Weather fetch error:", error);
    }
  };

  useMapEvents({
    click(e) {
      fetchWeather(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
};

const MapComponent = ({ coordinates, onCoordinateChange }) => {
  return (
    <MapContainer center={[coordinates.latitude, coordinates.longitude]} zoom={6} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <LocationSelector onSelect={onCoordinateChange} />
      <Marker position={[coordinates.latitude, coordinates.longitude]} />
    </MapContainer>
  );
};

export default MapComponent;

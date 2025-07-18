// UnifiedMap.jsx
import { useEffect, useState } from 'react';
import {
  MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const apiKey = "64b724dbc5a98a4d05d27e6fecdd245a";

// 🔴 Red = Low catch
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// 🟡 Orange = Medium catch
const yellowIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// 🟢 Green = High catch
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ⚓ Harbor
const harbor = {
  name: 'Chennai Port',
  position: [13.0827, 80.2707],
};

// ✨ Icon based on prediction
const getIcon = (catchRate) => {
  if (catchRate === 'High') return greenIcon;
  if (catchRate === 'Medium') return yellowIcon;
  return redIcon;
};

// 📍 Click handler
const LocationSelector = ({ onSelect }) => {
  useMapEvents({
    click: async (e) => {
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;

      try {
        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
        );
        const weather = await weatherRes.json();
        const temp = weather.main.temp;
        const wind = weather.wind.speed;

        onSelect({
          latitude: lat,
          longitude: lon,
          sea_surface_temperature: temp,
          wind_speed: wind,
        });
      } catch (err) {
        console.error("Weather fetch failed", err);
      }
    },
  });

  return null;
};

function UnifiedMap({ coordinates, onCoordinateChange }) {
  const [gridPoints, setGridPoints] = useState([]);

  const generateSeaGrid = () => {
    const coords = [];
    for (let lat = 8.0; lat <= 14.0; lat += 1.5) {
      for (let lon = 77.5; lon <= 81.5; lon += 1.5) {
        coords.push({ latitude: lat, longitude: lon });
      }
    }
    return coords;
  };

  useEffect(() => {
    const fetchGridData = async () => {
      const grid = generateSeaGrid();
      const updated = [];

      for (const point of grid) {
        try {
          const weatherRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${point.latitude}&lon=${point.longitude}&units=metric&appid=${apiKey}`
          );
          const weather = await weatherRes.json();
          const temp = weather.main.temp;
          const wind = weather.wind.speed;
          const condition = weather.weather[0].description;

          const predictRes = await fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sea_surface_temperature: temp, wind_speed: wind }),
          });

          const prediction = await predictRes.json();
          updated.push({
            latitude: point.latitude,
            longitude: point.longitude,
            catchRate: prediction.catch_rate,
            weather: {
              temperature: temp,
              wind: wind,
              condition: condition,
            },
          });
        } catch (error) {
          console.error("Prediction failed:", error);
        }
      }

      setGridPoints(updated);
    };

    fetchGridData();
  }, []);

  return (
    <MapContainer center={[11.5, 79.5]} zoom={6.8} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <LocationSelector onSelect={onCoordinateChange} />

      {/* Harbor marker */}
      <Marker position={harbor.position} icon={redIcon}>
        <Popup>
          <strong>{harbor.name}</strong><br />
          Base Port
        </Popup>
      </Marker>

      {/* Clicked marker */}
      <Marker position={[coordinates.latitude, coordinates.longitude]} icon={blueIcon}>
        <Popup>
          <strong>Your Selected Point</strong><br />
          Lat: {coordinates.latitude}, Lon: {coordinates.longitude}
        </Popup>
      </Marker>

      {/* ML Predictions */}
      {gridPoints.map((point, idx) => (
        <Marker
          key={idx}
          position={[point.latitude, point.longitude]}
          icon={getIcon(point.catchRate)}
        >
          <Popup>
            <strong>Catch: {point.catchRate}</strong><br />
            🌡️ {point.weather.temperature}°C<br />
            ☁️ {point.weather.condition}<br />
            💨 {point.weather.wind} m/s
          </Popup>
        </Marker>
      ))}

      {/* Route lines */}
      {gridPoints.map((point, idx) => (
        <Polyline
          key={`route-${idx}`}
          positions={[harbor.position, [point.latitude, point.longitude]]}
          pathOptions={{ color: 'blue', dashArray: '5, 10' }}
        />
      ))}
    </MapContainer>
  );
}

export default UnifiedMap;

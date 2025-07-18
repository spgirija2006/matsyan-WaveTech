import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  Polyline,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React from 'react';
import '../MapStyle.css';

const apiKey = "64b724dbc5a98a4d05d27e6fecdd245a";

// Marker icon generator
const getIcon = (catchRate) => {
  const colorMap = {
    High: 'green',
    Medium: 'orange',
    Low: 'red',
    Harbor: 'blue',
  };
  const color = colorMap[catchRate] || 'gray';
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'custom-bounce'
  });
};

const getPolylineColor = (rate) => {
  return rate === 'High' ? 'green' : rate === 'Medium' ? 'orange' : 'red';
};

const harborLatLng = L.latLng(13.0827, 80.2707);

const LocationSelector = ({ onNewPoint, clickedPoints, setClickedPoints }) => {
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
        const condition = weather.weather[0].description;

        const predictRes = await fetch('http://127.0.0.1:5000/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sea_surface_temperature: temp, wind_speed: wind }),
        });

        const prediction = await predictRes.json();

        const clickedLatLng = L.latLng(lat, lon);
        const distanceKm = (harborLatLng.distanceTo(clickedLatLng) / 1000).toFixed(2);

        const pointData = {
          latitude: lat,
          longitude: lon,
          catchRate: prediction.catch_rate,
          temperature: temp,
          windSpeed: wind,
          condition: condition,
          distance: distanceKm,
        };

        const newList = [...clickedPoints.slice(-4), pointData];
        setClickedPoints(newList);
        if (onNewPoint) onNewPoint(pointData);
      } catch (err) {
        console.error("Failed to fetch prediction for clicked point", err);
      }
    },
  });

  return (
    <>
      {clickedPoints.map((point, idx) => (
        <React.Fragment key={`clicked-${idx}`}>
          <Marker
            position={[point.latitude, point.longitude]}
            icon={getIcon(point.catchRate)}
          >
            <Tooltip>
              <b>Catch Rate:</b> {point.catchRate}<br />
              🌡 Temp: {point.temperature.toFixed(1)}°C<br />
              🌊 Condition: {point.condition}<br />
              💨 Wind: {point.windSpeed} m/s<br />
              📏 Distance: {point.distance} km
            </Tooltip>
          </Marker>

          <Polyline
            positions={[[13.0827, 80.2707], [point.latitude, point.longitude]]}
            pathOptions={{ color: getPolylineColor(point.catchRate), dashArray: '6, 6' }}
          />
        </React.Fragment>
      ))}
    </>
  );
};

const UnifiedMap = () => {
  const [gridPoints, setGridPoints] = useState([]);
  const [clickedPoints, setClickedPoints] = useState([]);

  const harbor = { lat: 13.0827, lng: 80.2707 };

  const generateCoastalSeaZones = () => {
    return [
      { latitude: 13.0, longitude: 80.5 },
      { latitude: 13.1, longitude: 80.8 },
      { latitude: 12.9, longitude: 80.7 },
      { latitude: 13.2, longitude: 80.6 },
      { latitude: 12.8, longitude: 80.4 },
      { latitude: 13.0, longitude: 80.9 },
      { latitude: 13.3, longitude: 80.7 },
      { latitude: 12.7, longitude: 80.5 },
      { latitude: 13.15, longitude: 80.65 },
    ];
  };

  useEffect(() => {
    const fetchGridData = async () => {
      const grid = generateCoastalSeaZones();
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

          const zoneLatLng = L.latLng(point.latitude, point.longitude);
          const distanceKm = (harborLatLng.distanceTo(zoneLatLng) / 1000).toFixed(2);

          updated.push({
            latitude: point.latitude,
            longitude: point.longitude,
            catchRate: prediction.catch_rate,
            temperature: temp,
            windSpeed: wind,
            condition: condition,
            distance: distanceKm,
          });
        } catch (error) {
          console.error("Prediction failed:", error);
        }
      }

      const priority = { High: 1, Medium: 2, Low: 3 };
      updated.sort((a, b) => priority[a.catchRate] - priority[b.catchRate]);

      setGridPoints(updated.slice(0, 5)); // Show top 5 only
    };

    fetchGridData();
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: '300px', padding: '1rem', background: '#f8f8f8', overflowY: 'auto', height: '100vh' }}>
        <h3>🖱️ Clicked Zones</h3>
        {clickedPoints.length === 0 && <p>No zones clicked yet</p>}
        {clickedPoints.map((pt, i) => (
          <div key={i} style={{ marginBottom: '1rem', borderBottom: '1px solid #ccc' }}>
            <b>📍 {pt.latitude.toFixed(2)}, {pt.longitude.toFixed(2)}</b><br />
            🐟 <b>{pt.catchRate}</b><br />
            🌡 {pt.temperature.toFixed(1)}°C<br />
            💨 {pt.windSpeed} m/s<br />
            🌊 {pt.condition}<br />
            📏 {pt.distance} km from harbor
          </div>
        ))}
      </div>

      <MapContainer center={[13.0, 80.5]} zoom={8} style={{ height: '100vh', flex: 1 }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <Marker position={[harbor.lat, harbor.lng]} icon={getIcon("Harbor")}>
          <Tooltip>🛥️ Harbor: Chennai</Tooltip>
        </Marker>

        {gridPoints.map((point, idx) => (
          <Marker
            key={`grid-${idx}`}
            position={[point.latitude, point.longitude]}
            icon={getIcon(point.catchRate)}
          >
            <Tooltip>
              <b>Catch Rate:</b> {point.catchRate}<br />
              🌡 Temp: {point.temperature.toFixed(1)}°C<br />
              🌊 Condition: {point.condition}<br />
              💨 Wind: {point.windSpeed} m/s<br />
              📏 Distance: {point.distance} km
            </Tooltip>
          </Marker>
        ))}

        {gridPoints.map((point, idx) => (
          <Polyline
            key={`line-${idx}`}
            positions={[[harbor.lat, harbor.lng], [point.latitude, point.longitude]]}
            pathOptions={{ color: 'blue', dashArray: '6, 6' }}
          />
        ))}

        <LocationSelector
          clickedPoints={clickedPoints}
          setClickedPoints={setClickedPoints}
        />
      </MapContainer>
    </div>
  );
};

export default UnifiedMap;

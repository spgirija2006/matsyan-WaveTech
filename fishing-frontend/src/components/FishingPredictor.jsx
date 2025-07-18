import axios from 'axios';

const FishingPredictor = ({ data }) => {
  const handleSubmit = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/predict", data);
      alert(`Predicted Catch Rate: ${response.data.catch_rate}`);
    } catch (error) {
      console.error("Prediction error:", error);
      alert("Prediction failed");
    }
  };

  return (
    <div>
      <h4>📍 Location: {data.latitude.toFixed(2)}, {data.longitude.toFixed(2)}</h4>
      <p>🌡 Temperature: {data.sea_surface_temperature} °C</p>
      <p>💨 Wind Speed: {data.wind_speed} m/s</p>
      <button onClick={handleSubmit}>Predict</button>
    </div>
  );
};

export default FishingPredictor;

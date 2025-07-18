from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load model and encoder
model = joblib.load("fishing_model.pkl")
le = joblib.load("label_encoder.pkl")

@app.route('/')
def home():
    return "🎣 Fishing Model API is running!"

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    
    sst = data.get('sea_surface_temperature')
    wind = data.get('wind_speed')

    if sst is None or wind is None:
        return jsonify({'error': 'Missing input data'}), 400

    features = np.array([[sst, wind]])
    prediction = model.predict(features)
    label = le.inverse_transform(prediction)[0]

    return jsonify({'catch_rate': label})

if __name__ == '__main__':
    app.run(debug=True)

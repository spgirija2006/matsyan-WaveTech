🎣 Fishing Route Optimizer – WaveTech Matsyan
A full-stack web application that recommends optimal fishing zones based on real-time weather conditions and machine learning predictions using a React frontend and Flask backend.

📂 Project Structure
bash
Copy
Edit
matsyan-WaveTech/
├── fishing-frontend/       # React frontend for map-based UI
└── fishing-backend/        # Flask backend with ML prediction API
🌐 Frontend – React (fishing-frontend)
🧭 Features
Interactive map (Leaflet.js) showing:

🐟 Top 5 recommended fishing zones

📍 Harbor marker

📈 Route polylines

🌦 Live weather info from OpenWeatherMap API

Harbor name search (via Nominatim)

Color-coded zone markers based on catch rate

Tooltip with:

Weather info

Distance from harbor

Predicted catch rate

🚀 Setup Instructions

cd fishing-frontend
npm install
npm start

App will run at: http://localhost:3000

⚠️ Note: Uses react-scripts. You may see deprecation warnings – safe to ignore for now.

🧠 Backend – Flask (fishing-backend)
⚙️ Features
/predict API endpoint to return catch rate predictions based on:

Temperature

Wind speed

Uses a trained Random Forest Classifier from scikit-learn

CORS enabled for frontend-backend communication

⚙️ Setup Instructions

cd fishing-backend
python -m venv venv
venv\Scripts\activate      # For Windows
pip install -r requirements.txt
python app.py


✅ app.py automatically enables debug mode. Ensure to replace with a production server (e.g., Gunicorn) for deployment.

📡 APIs Used
🌦 OpenWeatherMap API – for live sea/weather data
📍 Nominatim OpenStreetMap – harbor name geocoding

⚠️ Common Issues
npm start error: If you see Missing script: start, make sure you're inside fishing-frontend folder which has a valid package.json.

ML Warning:


X does not have valid feature names, but RandomForestClassifier was fitted with feature names
This is just a warning and doesn't affect predictions.

🎓 Future Improvements
Add user login and route history

Integrate tide data

Add mobile app version (React Native or Flutter)


Team Matsyan – Empowering sustainable fishing with AI and IoT.

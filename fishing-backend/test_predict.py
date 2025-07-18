import requests

url = "http://127.0.0.1:5000/predict"

# Sample input
data = {
    "sea_surface_temperature": 29.5,
    "wind_speed": 3.5
}

response = requests.post(url, json=data)

print("Server response:", response.json())

import pandas as pd
import numpy as np

# Simulate catch_rate logic
def simulate_catch_rate(temp, wind):
    if temp > 28 and wind < 4:
        return 'High'
    elif temp < 26 or wind > 10:
        return 'Low'
    else:
        return 'Medium'

# Generate data
np.random.seed(42)
num_rows = 200
data = {
    'time': pd.date_range(start='2023-01-01', periods=num_rows, freq='D'),
    'latitude': np.random.uniform(13.0, 14.5, num_rows),
    'longitude': np.random.uniform(79.5, 81.0, num_rows),
    'sea_surface_temperature': np.round(np.random.uniform(24, 31, num_rows), 2),
    'wind_speed': np.round(np.random.uniform(2, 12, num_rows), 2)
}

df = pd.DataFrame(data)
df['catch_rate'] = df.apply(
    lambda row: simulate_catch_rate(row['sea_surface_temperature'], row['wind_speed']),
    axis=1
)

# Save to CSV
df.to_csv('synthetic_fishing_data.csv', index=False)
print("✅ Saved as synthetic_fishing_data.csv")

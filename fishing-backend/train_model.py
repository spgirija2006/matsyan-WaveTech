import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib

# 1. Load dataset
df = pd.read_csv("synthetic_fishing_data.csv")

# 2. Features and target
X = df[["sea_surface_temperature", "wind_speed"]]
y = df["catch_rate"]

# 3. Encode labels
le = LabelEncoder()
y_encoded = le.fit_transform(y)

# 4. Split dataset
X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

# 5. Train model
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_train, y_train)

# 6. Evaluate model (optional)
y_pred = clf.predict(X_test)
print("Classification Report:\n")
print(classification_report(y_test, y_pred, target_names=le.classes_))

# 7. Save model and encoder
joblib.dump(clf, "fishing_model.pkl")
joblib.dump(le, "label_encoder.pkl")

print("✅ Model and label encoder saved successfully!")

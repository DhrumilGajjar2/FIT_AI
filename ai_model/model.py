import os
import json
import pandas as pd
import joblib
import sys
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler

# ✅ Ensure UTF-8 encoding
sys.stdout.reconfigure(encoding="utf-8")

# ✅ Define Paths
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(CURRENT_DIR, "knn_model.pkl")
FEATURES_PATH = os.path.join(CURRENT_DIR, "feature_columns.pkl")
SCALER_PATH = os.path.join(CURRENT_DIR, "scaler.pkl")
DATA_PATH = os.path.join(CURRENT_DIR, "datasets", "ai_diet_workout_dataset.csv")

# ✅ Load Model, Features & Dataset
try:
    if not all(os.path.exists(path) for path in [MODEL_PATH, FEATURES_PATH, SCALER_PATH, DATA_PATH]):
        raise FileNotFoundError("Model, features, or dataset not found!")

    knn = joblib.load(MODEL_PATH)
    feature_columns = joblib.load(FEATURES_PATH)
    scaler = joblib.load(SCALER_PATH)
    df = pd.read_csv(DATA_PATH).dropna()
except Exception as e:
    print(json.dumps({"error": f"Model loading failed: {str(e)}"}))
    sys.exit(1)

def clean_numeric(value):
    """ Convert string numbers like '105g' or '45 min' to float/int """
    try:
        if pd.isna(value) or value == "":
            return None
        return float(str(value).split()[0])  # Extract numeric part
    except ValueError:
        return None  # Invalid conversion

def recommend(user_data):
    try:
        user_data["healthCondition"] = user_data.get("healthCondition", "none")

        user_df = pd.DataFrame([[  
            user_data["age"], user_data["weight"], user_data["height"],
            user_data["goal"], user_data["activityLevel"], user_data["healthCondition"]
        ]], columns=["age", "weight", "height", "goal", "activity_level", "health_condition"])

        user_df = pd.get_dummies(user_df, columns=["goal", "activity_level", "health_condition"], drop_first=False)
        user_df = user_df.reindex(columns=feature_columns, fill_value=0)
        user_df_scaled = scaler.transform(user_df)

        _, index = knn.kneighbors(user_df_scaled)
        match = df.iloc[index[0][0]]

        recommendation = {
            "calories": clean_numeric(match["calories"]),
            "protein": clean_numeric(match["protein"]),
            "carbs": clean_numeric(match["carbs"]),
            "fats": clean_numeric(match["fats"]),
            "meal_plan": {
                "breakfast": match["breakfast"],
                "lunch": match["lunch"],
                "dinner": match["dinner"],
                "snacks": match["snacks"]
            },
            "workout_plan": {
                "workout_type": match["workout_type"],
                "duration": clean_numeric(match["duration"]),
                "exercises": match["exercises"]
            }
        }

        print(json.dumps({"recommendation": recommendation}))

    except Exception as e:
        print(json.dumps({"error": f"Prediction failed: {str(e)}"}))

if __name__ == "__main__":
    try:
        input_data = sys.stdin.read().strip()
        if not input_data:
            raise ValueError("No input data received.")

        user_data = json.loads(input_data)
        recommend(user_data)
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON format received."}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

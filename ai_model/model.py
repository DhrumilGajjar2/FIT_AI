import os
import sys
import json
import pandas as pd
import joblib
from sklearn.neighbors import NearestNeighbors

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FEATURES_PATH = os.path.join(CURRENT_DIR, "feature_columns.pkl")
SCALER_PATH = os.path.join(CURRENT_DIR, "scaler.pkl")
MODEL_PATH = os.path.join(CURRENT_DIR, "knn_model.pkl")  # Still used for storage, but not reused
DATA_PATH = os.path.join(CURRENT_DIR, "datasets", "ai_diet_workout_dataset.csv")


def clean_numeric(value):
    """Convert string numbers like '105g' or '45 min' to float, return None if invalid."""
    try:
        if pd.isna(value) or value == "":
            return None
        numeric_str = ''.join(c for c in str(value) if c.isdigit() or c == '.')
        return float(numeric_str) if numeric_str else None
    except Exception:
        return None


def load_artifacts():
    if not all(os.path.exists(p) for p in [FEATURES_PATH, SCALER_PATH, DATA_PATH]):
        raise FileNotFoundError("Necessary model/data files are missing.")

    feature_columns = joblib.load(FEATURES_PATH)
    scaler = joblib.load(SCALER_PATH)
    df = pd.read_csv(DATA_PATH)

    # Fill missing strings for categorical columns
    df["health_condition"] = df["health_condition"].fillna("none")
    df["diet_type"] = df["diet_type"].fillna("none")

    return feature_columns, scaler, df


def recommend(user_data, feature_columns, scaler, df):
    try:
        # Input validation / defaults
        diet_preference = user_data.get("dietPreference", "veg").lower()
        if diet_preference not in ["veg", "non-veg"]:
            raise ValueError("Invalid dietPreference. Allowed: 'veg', 'non-veg'.")

        # Filter dataset by diet_type
        filtered_df = df[df["diet_type"].str.lower() == diet_preference].copy()
        if filtered_df.empty:
            raise ValueError("No data available for the specified diet preference.")

        # Validate essential user inputs
        for key in ["age", "weight", "height", "goal", "activityLevel"]:
            if key not in user_data:
                raise ValueError(f"Missing required input: {key}")

        # Prepare user input
        user_df = pd.DataFrame([[user_data["age"],
                                 user_data["weight"],
                                 user_data["height"],
                                 user_data["goal"],
                                 user_data["activityLevel"],
                                 user_data.get("healthCondition", "none")]],
                               columns=["age", "weight", "height", "goal", "activity_level", "health_condition"])

        user_df = pd.get_dummies(user_df, columns=["goal", "activity_level", "health_condition"], drop_first=False)
        user_df = user_df.reindex(columns=feature_columns, fill_value=0)
        user_scaled = scaler.transform(user_df)

        # Prepare filtered dataset
        fit_df = filtered_df[["age", "weight", "height", "goal", "activity_level", "health_condition"]]
        fit_df = pd.get_dummies(fit_df, columns=["goal", "activity_level", "health_condition"], drop_first=False)
        fit_df = fit_df.reindex(columns=feature_columns, fill_value=0)
        fit_scaled = scaler.transform(fit_df)

        if fit_scaled.shape[0] == 0:
            raise ValueError("No matching records found after filtering and encoding.")

        # Train a temporary KNN model on filtered data
        knn_temp = NearestNeighbors(n_neighbors=1)
        knn_temp.fit(fit_scaled)
        distances, indices = knn_temp.kneighbors(user_scaled)

        nearest_index = indices[0][0]
        match = filtered_df.iloc[nearest_index]

        recommendation = {
            "calories": clean_numeric(match.get("calories")),
            "protein": clean_numeric(match.get("protein")),
            "carbs": clean_numeric(match.get("carbs")),
            "fats": clean_numeric(match.get("fats")),
            "meal_plan": {
                "breakfast": match.get("breakfast"),
                "lunch": match.get("lunch"),
                "dinner": match.get("dinner"),
                "snacks": match.get("snacks")
            },
            "workout_plan": {
                "workout_type": match.get("workout_type"),
                "duration": clean_numeric(match.get("duration")),
                "exercises": match.get("exercises")
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
        feature_columns, scaler, df = load_artifacts()
        recommend(user_data, feature_columns, scaler, df)

    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON format received."}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

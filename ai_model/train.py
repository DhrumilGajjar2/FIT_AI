import os
import pandas as pd
import joblib
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(CURRENT_DIR, "datasets")
DATA_PATH = os.path.join(DATASET_DIR, "ai_diet_workout_dataset.csv")
FEATURES_PATH = os.path.join(CURRENT_DIR, "feature_columns.pkl")
SCALER_PATH = os.path.join(CURRENT_DIR, "scaler.pkl")
MODEL_PATH = os.path.join(CURRENT_DIR, "knn_model.pkl")


def main():
    try:
        os.makedirs(DATASET_DIR, exist_ok=True)

        if not os.path.exists(DATA_PATH):
            raise FileNotFoundError(f"🚨 Dataset not found at: {DATA_PATH}")

        df = pd.read_csv(DATA_PATH).dropna()

        # Fill missing categorical with 'none'
        df["health_condition"] = df["health_condition"].fillna("none")
        df["diet_type"] = df["diet_type"].fillna("none")

        # Robust numeric extraction (supports decimals like .5)
        numeric_columns = ["calories", "protein", "carbs", "fats", "duration"]
        for col in numeric_columns:
            if col in df.columns:
                extracted = df[col].astype(str).str.extract(r'(\d*\.\d+|\d+)')
                df[col] = extracted.astype(float)

        # Use only diet_type 'veg' and 'non-veg' to keep consistent
        df = df[df['diet_type'].str.lower().isin(['veg', 'non-veg'])]

        # Features for modeling
        feature_cols = ["age", "weight", "height", "goal", "activity_level", "health_condition"]
        missing_cols = [col for col in feature_cols if col not in df.columns]
        if missing_cols:
            raise ValueError(f"❌ Missing columns: {', '.join(missing_cols)}")

        X = df[feature_cols]

        # One-hot encode categorical variables consistently
        X = pd.get_dummies(X, columns=["goal", "activity_level", "health_condition"], drop_first=False)

        # Save the feature columns order expected by the model
        feature_columns = X.columns.tolist()

        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # Train KNN model on scaled features
        knn_model = NearestNeighbors(n_neighbors=1)
        knn_model.fit(X_scaled)

        # Save scaler, features, and model for later use
        joblib.dump(feature_columns, FEATURES_PATH)
        joblib.dump(scaler, SCALER_PATH)
        joblib.dump(knn_model, MODEL_PATH)

        print("✅ Scaler, feature columns, and KNN model saved successfully.")

    except Exception as e:
        print(f"❌ Training failed: {str(e)}")


if __name__ == "__main__":
    main()

import os
import pandas as pd
import joblib
from sklearn.preprocessing import StandardScaler

# ✅ Fix Path Issues
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(CURRENT_DIR, "datasets")
DATA_PATH = os.path.join(DATASET_DIR, "ai_diet_workout_dataset.csv")
FEATURES_PATH = os.path.join(CURRENT_DIR, "feature_columns.pkl")
SCALER_PATH = os.path.join(CURRENT_DIR, "scaler.pkl")

try:
    os.makedirs(DATASET_DIR, exist_ok=True)

    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"🚨 Dataset not found at: {DATA_PATH}")

    df = pd.read_csv(DATA_PATH).dropna()

    df["health_condition"] = df["health_condition"].fillna("none")
    df["diet_type"] = df["diet_type"].fillna("none")

    numeric_columns = ["calories", "protein", "carbs", "fats", "duration"]
    for col in numeric_columns:
        if col in df.columns:
            df[col] = df[col].astype(str).str.extract(r'(\d+\.?\d*)').astype(float)

    # ✅ Only keep the columns used during prediction
    feature_cols = ["age", "weight", "height", "goal", "activity_level", "health_condition"]
    missing_cols = [col for col in feature_cols if col not in df.columns]
    if missing_cols:
        raise ValueError(f"❌ Missing columns: {', '.join(missing_cols)}")

    X = df[feature_cols]
    X = pd.get_dummies(X, columns=["goal", "activity_level", "health_condition"], drop_first=False)

    scaler = StandardScaler()
    scaler.fit(X)

    joblib.dump(X.columns.tolist(), FEATURES_PATH)
    joblib.dump(scaler, SCALER_PATH)

    print("✅ Scaler and feature columns saved successfully.")
except Exception as e:
    print(f"❌ Training failed: {str(e)}")

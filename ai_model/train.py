import os
import pandas as pd
import joblib
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler

# ✅ Fix Path Issues
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = CURRENT_DIR  # Fix model directory path
DATASET_DIR = os.path.join(CURRENT_DIR, "datasets")  # Fix dataset path
DATA_PATH = os.path.join(DATASET_DIR, "ai_diet_workout_dataset.csv")
MODEL_PATH = os.path.join(MODEL_DIR, "knn_model.pkl")
FEATURES_PATH = os.path.join(MODEL_DIR, "feature_columns.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")

try:
    # ✅ Ensure Folders Exist
    os.makedirs(MODEL_DIR, exist_ok=True)
    os.makedirs(DATASET_DIR, exist_ok=True)

    # ✅ Ensure Dataset Exists
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"🚨 Dataset not found at: {DATA_PATH}")

    # ✅ Load Dataset
    df = pd.read_csv(DATA_PATH)
    df.dropna(inplace=True)

    # ✅ Fill Missing Health Condition as "none"
    df["health_condition"] = df["health_condition"].fillna("none")

    # ✅ Clean Numeric Columns (Remove 'g', 'ml', 'kg', etc.)
    numeric_columns = ["calories", "protein", "carbs", "fats", "duration"]
    for col in numeric_columns:
        df[col] = df[col].astype(str).str.extract(r'(\d+\.?\d*)').astype(float)

    # ✅ Select Features
    feature_cols = ["age", "weight", "height", "goal", "activity_level", "health_condition"]
    X = df[feature_cols]

    # ✅ Convert Categorical Data with One-Hot Encoding
    X = pd.get_dummies(X, columns=["goal", "activity_level", "health_condition"], drop_first=False)

    # ✅ Scale Numeric Features for Better Distance Calculation
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # ✅ Save Feature Column Names & Scaler
    feature_columns = X.columns.tolist()
    joblib.dump(feature_columns, FEATURES_PATH)
    joblib.dump(scaler, SCALER_PATH)

    # ✅ Train Optimized KNN Model
    knn = NearestNeighbors(n_neighbors=3, metric="manhattan")
    knn.fit(X_scaled)

    # ✅ Save Model
    joblib.dump(knn, MODEL_PATH)

    print(f"✅ Model trained & saved successfully in: {MODEL_DIR}")
except Exception as e:
    print(f"❌ Training failed: {str(e)}")

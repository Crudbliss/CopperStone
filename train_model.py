import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, confusion_matrix
import json
import sys
import os

# Create admin/images directory if it doesn't exist
os.makedirs(os.path.join("admin", "images"), exist_ok=True)

try:
    # 1. Load the dataset (server.js creates current_dataset.csv)
    df = pd.read_csv("current_dataset.csv")

    # 2. Separate Features (q1-q28) and Target
    X = df.drop(columns=['target_quadrant'])
    y = df['target_quadrant']

    # 3. Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # ==========================================
    # MODEL 1: RANDOM FOREST (Feature Importance)
    # ==========================================
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_train, y_train)
    rf_predictions = rf.predict(X_test)
    rf_accuracy = accuracy_score(y_test, rf_predictions)

    # Plot Feature Importance
    importances = rf.feature_importances_
    feature_names = X.columns
    feature_importance_df = pd.DataFrame({'Feature': feature_names, 'Importance': importances})
    feature_importance_df = feature_importance_df.sort_values(by='Importance', ascending=False)
    
    # Save top 5 to metrics
    top_5 = feature_importance_df.head(5).to_dict('records')

    plt.figure(figsize=(10, 6))
    sns.barplot(x='Importance', y='Feature', data=feature_importance_df)
    plt.title('Random Forest Feature Importance')
    plt.tight_layout()
    plt.savefig(os.path.join("admin", "images", "feature_importance.png"))
    plt.close()

    # ==========================================
    # MODEL 2: FUZZY K-NEAREST NEIGHBORS (FKNN)
    # ==========================================
    knn = KNeighborsClassifier(n_neighbors=5, weights='distance')
    knn.fit(X_train, y_train)
    knn_predictions = knn.predict(X_test)
    knn_accuracy = accuracy_score(y_test, knn_predictions)

    # ==========================================
    # VALIDATION: CONFUSION MATRIX
    # ==========================================
    classes = knn.classes_
    plt.figure(figsize=(8, 6))
    cm = confusion_matrix(y_test, rf_predictions, labels=classes)
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=classes, yticklabels=classes)
    plt.title('Confusion Matrix (Random Forest)')
    plt.ylabel('Actual Mode')
    plt.xlabel('Predicted Mode')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(os.path.join("admin", "images", "confusion_matrix.png"))
    plt.close()

    # ==========================================
    # JSON OUTPUT FOR NODE.JS
    # ==========================================
    output = {
        "rf_accuracy": float(rf_accuracy * 100),
        "fknn_accuracy": float(knn_accuracy * 100),
        "top_features": top_5,
        "sample_size": len(X),
        "test_size": len(X_test)
    }

    print("---JSON_START---")
    print(json.dumps(output))
    print("---JSON_END---")

except Exception as e:
    print(f"Error occurred: {str(e)}", file=sys.stderr)
    sys.exit(1)

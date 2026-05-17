import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import confusion_matrix, classification_report

# 1. Generate Dummy Data
def generate_dummy_data(filename="dummy_dataset.csv", num_samples=100):
    np.random.seed(42)
    data = []
    
    for _ in range(num_samples):
        # Generate random scores between 0.1 and 1.0
        quiz = round(np.random.uniform(0.1, 1.0), 2)
        group = round(np.random.uniform(0.1, 1.0), 2)
        research = round(np.random.uniform(0.1, 1.0), 2)
        seatwork = round(np.random.uniform(0.1, 1.0), 2)
        
        # Determine logical "Target Quadrant" based on dominant scores
        # This simulates a human teacher grading them accurately
        hierarchical = quiz
        distributed = research
        individual = seatwork
        collective = group
        
        # X-axis dominance
        if hierarchical > distributed:
            x_trait = "Hierarchical"
        else:
            x_trait = "Distributed"
            
        # Y-axis dominance
        if individual > collective:
            y_trait = "Individual"
        else:
            y_trait = "Collective"
            
        target_quadrant = f"{x_trait}-{y_trait}"
        
        # Add some random noise to occasionally make the teacher's label imperfect
        if np.random.random() < 0.1:
            traits = ["Hierarchical-Individual", "Distributed-Individual", "Hierarchical-Collective", "Distributed-Collective"]
            traits.remove(target_quadrant)
            target_quadrant = np.random.choice(traits)
            
        data.append([quiz, group, research, seatwork, target_quadrant])
        
    df = pd.DataFrame(data, columns=["Quiz_Score", "Group_Score", "Research_Score", "Seatwork_Score", "Target_Quadrant"])
    df.to_csv(filename, index=False)
    print(f"Generated {num_samples} dummy records in {filename}\n")
    return df

# Run the process
print("=== PHASE 1: Data Generation ===")
df = generate_dummy_data()
print(df.head(), "\n")

print("=== PHASE 2: Training the AI ===")
# Features (Inputs) and Labels (Outputs)
X = df[["Quiz_Score", "Group_Score", "Research_Score", "Seatwork_Score"]]
y = df["Target_Quadrant"]

# Split data: 80% for training the AI, 20% for testing the AI
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Algorithm 1: KNN (Simulating FKNN logic)
knn = KNeighborsClassifier(n_neighbors=5)
knn.fit(X_train, y_train)
knn_predictions = knn.predict(X_test)

# Algorithm 2: Random Forest
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)
rf_predictions = rf.predict(X_test)

print("Models trained successfully!\n")

print("=== PHASE 3: Validation (Confusion Matrix) ===")
print("KNN Confusion Matrix:")
print(confusion_matrix(y_test, knn_predictions))
print("\nKNN Classification Report:")
print(classification_report(y_test, knn_predictions))

print("-" * 40)

print("Random Forest Confusion Matrix:")
print(confusion_matrix(y_test, rf_predictions))
print("\nRandom Forest Classification Report:")
print(classification_report(y_test, rf_predictions))

print("\nSuccess! The AI has learned the patterns from the dummy dataset.")

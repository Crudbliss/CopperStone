# New System Architecture: FKNN via Questionnaire Integration

## Objective
To seamlessly merge the 20-item behavioral questionnaire from `draft-questionnaire.pdf` with the 14,000-row `student_performance.csv` dataset, creating a robust, unified Fuzzy K-Nearest Neighbors (FKNN) AI model.

## The Core Challenge
For an AI (FKNN) to make a prediction, the **Input Data** (what the student does in the UI) must mathematically match the **Training Data** (what the AI learned from). 
* The student will answer 20 behavioral questions resulting in 4 quadrant scores.
* The dataset contains columns like `ExamScore`, `StudyHours`, and `Extracurricular`.

To fix this, we will use a **Feature Synthesis Bridge**. We will translate the Kaggle dataset into "Theoretical Questionnaire Scores" so that both the UI and the AI speak the exact same language.

---

## Step 1: The UI (Input Data)
We will completely scrap the academic sliders (Quiz, Group, Research, Seatwork).
Instead, when a student opens the assessment, they will see the **20 Situational Questions** from the PDF.
* They answer each on a Likert scale (1 = Strongly Disagree, 5 = Strongly Agree).
* The UI calculates their total score for each of the 4 quadrants:
  * **HI_Score** (Hierarchical Individual) - Max 25
  * **HC_Score** (Hierarchical Collective) - Max 25
  * **DI_Score** (Distributed Individual) - Max 25
  * **DC_Score** (Distributed Collective) - Max 25

This creates the student's Input Vector: `[HI_Score, HC_Score, DI_Score, DC_Score]`.

---

## Step 2: The Training Data Synthesis (The Brain)
To make the 14,000 rows from `student_performance.csv` match the student's input vector, we will write a Python script that calculates how each of those 14,000 students *would have answered* the questionnaire based on their Kaggle stats.

We will use logical mapping formulas (scaled to a max of 25 points to match the questionnaire):
1. **HI_Score (Solo + Structured):** High `StudyHours`, High `ExamScore`, Low `Extracurricular`.
2. **HC_Score (Group + Structured):** High `Attendance`, High `Discussions`, High `AssignmentCompletion`.
3. **DI_Score (Solo + Free):** High `OnlineCourses`, High `Resources`, Low `Discussions`.
4. **DC_Score (Group + Free):** High `Extracurricular`, High `EduTech`, High `Motivation`.

The script will generate a new dataset with the headers:
`HI_Score, HC_Score, DI_Score, DC_Score, Target_Quadrant` (Derived from the `LearningStyle` column).

---

## Step 3: The AI Evaluation (FKNN)
When the student submits their 20 answers, the backend receives their `[HI, HC, DI, DC]` scores.
1. The FKNN algorithm compares their 4 scores against the 14,000 synthetic rows in the database.
2. It calculates the **Euclidean Distance** to find the 5 closest historical students.
3. It applies **Fuzzy Logic** weighting to determine their final membership percentages (e.g., 60% Hierarchical-Collective, 40% Distributed-Collective).
4. The X/Y coordinates are generated, and the dashboard scatter plots update flawlessly.

## Why this is the perfect plan for defense:
1. **It uses your PDF strictly as designed.**
2. **It leverages 14,000 rows of real data** (impressive for ML).
3. **It demonstrates Advanced Feature Engineering** (showing the panel you know how to synthesize and map disjointed datasets into a unified AI architecture).

import pandas as pd
import numpy as np

# Read the excel file
df = pd.read_excel('Modes of Learning Assessment (Responses) (1).xlsx')

# The questions start at column index 5
questions = df.columns.tolist()[5:]

# Mappings (0-indexed based on the questions list)
# HI: 2, 8, 11, 13, 20, 23, 25
# HC: 4, 7, 12, 16, 19, 21, 24
# DI: 3, 6, 9, 15, 18, 22, 26
# DC: 1, 5, 10, 14, 17, 27, 28

hi_indices = [1, 7, 10, 12, 19, 22, 24]
hc_indices = [3, 6, 11, 15, 18, 20, 23]
di_indices = [2, 5, 8, 14, 17, 21, 25]
dc_indices = [0, 4, 9, 13, 16, 26, 27]

# Scoring map
score_map = {
    'Strongly Agree': 4,
    'Agree': 3,
    'Somewhat Agree': 2,
    'Disagree': 1
}

# Apply mapping to score columns
for i, col in enumerate(questions):
    df[col] = df[col].map(score_map).fillna(2) # Default to 2 if missing or unknown

# Function to calculate dominant quadrant
def get_quadrant(row):
    scores = {
        'Hierarchical Individual': sum([row[questions[i]] for i in hi_indices]),
        'Hierarchical Collective': sum([row[questions[i]] for i in hc_indices]),
        'Distributed Individual': sum([row[questions[i]] for i in di_indices]),
        'Distributed Collective': sum([row[questions[i]] for i in dc_indices])
    }
    # Return the key with the maximum score
    return max(scores, key=scores.get)

df['target_quadrant'] = df.apply(get_quadrant, axis=1)

# Keep only the q1...q28 and target_quadrant
output_df = pd.DataFrame()
for i, col in enumerate(questions):
    output_df[f'q{i+1}'] = df[col]

output_df['target_quadrant'] = df['target_quadrant']

# Save to CSV
output_df.to_csv('system_dataset.csv', index=False)
print(f"Generated system_dataset.csv with {len(output_df)} rows and {len(output_df.columns)} columns.")

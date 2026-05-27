import pandas as pd

def process_file(filename):
    print(f"Processing {filename}...")
    df = pd.read_csv(filename)
    
    # 1. Reorder columns to match the new UI sequence
    new_col_order = [
        'q17', 'q18', 'q19', 'q20',
        'q21', 'q22', 'q23', 'q24',
        'q25', 'q26', 'q27', 'q28',
        'q1', 'q2', 'q3', 'q4',
        'q5', 'q6', 'q7', 'q8',
        'q9', 'q10', 'q11', 'q12',
        'q13', 'q14', 'q15', 'q16',
        'target_quadrant'
    ]
    
    df = df[new_col_order]
    
    # 2. Rename columns sequentially back to q1..q28
    rename_mapping = {new_col_order[i]: f'q{i+1}' for i in range(28)}
    df = df.rename(columns=rename_mapping)
    
    # 3. Clamp values from 1-5 to 1-4
    q_cols = [f'q{i+1}' for i in range(28)]
    df[q_cols] = df[q_cols].clip(lower=1, upper=4)
    
    # Save back
    df.to_csv(filename, index=False)
    print(f"Saved {filename} with 1-4 clamping and reordering.")

process_file('student_28q-800.csv')
process_file('student_28q-500.csv')
process_file('current_dataset.csv')

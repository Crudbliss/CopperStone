import csv

input_file = 'student_performance.csv'
output_file = 'copperstone_ai_training_data.csv'

# Mapping Dictionary for LearningStyle (VARK) to Target_Quadrant
# 0: Visual -> Hierarchical-Individual
# 1: Reading/Writing -> Distributed-Individual
# 2: Auditory -> Hierarchical-Collective
# 3: Kinesthetic -> Distributed-Collective
quadrant_map = {
    '0': 'Hierarchical-Individual',
    '1': 'Distributed-Individual',
    '2': 'Hierarchical-Collective',
    '3': 'Distributed-Collective'
}

with open(input_file, 'r', encoding='utf-8') as infile, open(output_file, 'w', newline='', encoding='utf-8') as outfile:
    reader = csv.DictReader(infile)
    
    # Define our CopperStone headers
    fieldnames = ['Quiz_Score', 'Group_Score', 'Research_Score', 'Seatwork_Score', 'Target_Quadrant']
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()
    
    count = 0
    for row in reader:
        try:
            # Quiz Score (ExamScore 0-100) -> 0.0 to 1.0
            quiz = float(row['ExamScore']) / 100.0
            
            # Seatwork Score (AssignmentCompletion 0-100) -> 0.0 to 1.0
            seatwork = float(row['AssignmentCompletion']) / 100.0
            
            # Research Score (StudyHours max 44) -> 0.0 to 1.0
            study_hours = float(row['StudyHours'])
            research = min(study_hours / 44.0, 1.0)
            
            # Group Score (Extracurricular 0/1 + Discussions 0/1) -> 0.0 to 1.0
            extra = float(row['Extracurricular'])
            disc = float(row['Discussions'])
            group = (extra + disc) / 2.0
            
            # Target Quadrant
            vark = row['LearningStyle'].strip()
            quadrant = quadrant_map.get(vark, 'Hierarchical-Individual') # default fallback
            
            # Write row
            writer.writerow({
                'Quiz_Score': round(quiz, 4),
                'Group_Score': round(group, 4),
                'Research_Score': round(research, 4),
                'Seatwork_Score': round(seatwork, 4),
                'Target_Quadrant': quadrant
            })
            count += 1
            
        except Exception as e:
            continue

print(f"Successfully converted {count} rows! Output saved to {output_file}")

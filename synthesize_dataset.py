import csv

input_file = 'student_performance.csv'
output_file = 'synthetic_training_data.csv'

quadrant_map = {
    '0': 'Hierarchical-Individual',
    '1': 'Distributed-Individual',
    '2': 'Hierarchical-Collective',
    '3': 'Distributed-Collective'
}

with open(input_file, 'r', encoding='utf-8') as infile, open(output_file, 'w', newline='', encoding='utf-8') as outfile:
    reader = csv.DictReader(infile)
    
    fieldnames = ['hi_score', 'hc_score', 'di_score', 'dc_score', 'target_quadrant']
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()
    
    count = 0
    for row in reader:
        try:
            # Stats normalized to 0-1
            exam = float(row['ExamScore']) / 100.0
            study = min(float(row['StudyHours']) / 44.0, 1.0)
            extra = float(row['Extracurricular'])
            disc = float(row['Discussions'])
            att = float(row['Attendance']) / 100.0
            assign = float(row['AssignmentCompletion']) / 100.0
            online = min(float(row['OnlineCourses']) / 20.0, 1.0)
            resources = min(float(row['Resources']) / 2.0, 1.0)
            edutech = float(row['EduTech'])
            motivation = min(float(row['Motivation']) / 2.0, 1.0)

            # Synthesize max 25 scores per quadrant
            hi_raw = (exam + study + (1 - extra)) / 3.0
            hi_score = hi_raw * 25
            
            hc_raw = (att + disc + assign) / 3.0
            hc_score = hc_raw * 25
            
            di_raw = (online + resources + (1 - disc)) / 3.0
            di_score = di_raw * 25
            
            dc_raw = (extra + edutech + motivation) / 3.0
            dc_score = dc_raw * 25

            # Target
            vark = row['LearningStyle'].strip()
            quadrant = quadrant_map.get(vark, 'Hierarchical-Individual')
            
            # Clamp scores between 5 and 25 (min 5 questions * 1 point = 5)
            hi_final = max(5, min(25, round(hi_score)))
            hc_final = max(5, min(25, round(hc_score)))
            di_final = max(5, min(25, round(di_score)))
            dc_final = max(5, min(25, round(dc_score)))

            writer.writerow({
                'hi_score': hi_final,
                'hc_score': hc_final,
                'di_score': di_final,
                'dc_score': dc_final,
                'target_quadrant': quadrant
            })
            count += 1
            
        except Exception as e:
            continue

print(f"Synthesized {count} rows! Output saved to {output_file}")

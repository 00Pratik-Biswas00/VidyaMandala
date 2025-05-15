# ml-services/learning_plan/planner.py
import random

# Dummy data: MCQs per topic
mcq_data = {
    "Python": [
        {"q": "What is the output of print(2 ** 3)?", "options": ["6", "8", "9", "5"], "answer": "8"},
        {"q": "Which keyword is used for function in Python?", "options": ["function", "define", "def", "fun"], "answer": "def"},
        {"q": "What is a correct syntax to output 'Hello World'?", "options": ["echo('Hello')", "print('Hello World')", "p('Hello')", "write('Hello')"], "answer": "print('Hello World')"},
        {"q": "Which one is a Python data type?", "options": ["float", "real", "num", "decimal"], "answer": "float"},
        {"q": "Which symbol is used for comments in Python?", "options": ["//", "#", "--", "/* */"], "answer": "#"},
        {"q": "What is the output of print(len('abc'))?", "options": ["1", "2", "3", "4"], "answer": "3"},
        {"q": "Which one is not a Python loop?", "options": ["while", "foreach", "for", "do-while"], "answer": "do-while"},
        {"q": "What will print(3 == 3) return?", "options": ["True", "False", "None", "Error"], "answer": "True"},
        {"q": "Which is used to define a block in Python?", "options": ["Braces", "Tabs", "Indentation", "Parentheses"], "answer": "Indentation"},
        {"q": "Which module is used for regular expressions?", "options": ["regex", "re", "match", "rx"], "answer": "re"}
    ],
    # Add more topics as needed
}

# Dummy metadata
course_metadata = {
    "Python": [
        {"lesson": "Introduction to Python", "time": 60},
        {"lesson": "Variables and Data Types", "time": 90},
        {"lesson": "Control Structures", "time": 120},
        {"lesson": "Functions", "time": 100},
        {"lesson": "Modules", "time": 80},
    ]
}

def get_mcq_questions(topic: str):
    return random.sample(mcq_data[topic], 5)

def evaluate_mcq_score(topic: str, answers: list):
    correct_answers = [q["answer"] for q in mcq_data[topic] if q in answers]
    correct_count = sum(1 for ans in answers if ans["answer"] == mcq_data[topic][ans["index"]]["answer"])
    return correct_count / 5  # return score out of 1.0

def generate_learning_plan(score: float, months: int, hours_per_day: int):
    total_study_time = months * 30 * hours_per_day * 60  # in minutes

    lessons = course_metadata["Python"]
    adjusted_lessons = []

    for lesson in lessons:
        time = lesson["time"]
        if score > 0.8:
            time *= 0.5
        elif score > 0.6:
            time *= 0.75
        adjusted_lessons.append({**lesson, "adjusted_time": int(time)})

    # Now distribute lessons across days
    daily_plan = []
    day_plan = []
    available_time = hours_per_day * 60

    for lesson in adjusted_lessons:
        if lesson["adjusted_time"] <= available_time:
            day_plan.append(lesson)
            available_time -= lesson["adjusted_time"]
        else:
            daily_plan.append(day_plan)
            day_plan = [lesson]
            available_time = hours_per_day * 60 - lesson["adjusted_time"]
    
    if day_plan:
        daily_plan.append(day_plan)

    return daily_plan

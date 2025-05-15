from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import random
from fastapi import APIRouter

learning_plan_router = APIRouter()

# ---- Data Models ----
class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    answer: str

class GeneratePlanRequest(BaseModel):
    months: int
    hours: int
    score: int

class GeneratePlanResponse(BaseModel):
    score: int
    plan: str

# ---- Dummy Questions ----
quiz_questions = [
    QuizQuestion(
        id=1,
        question="What is the time complexity of binary search?",
        options=["O(n)", "O(log n)", "O(n log n)", "O(1)"],
        answer="O(log n)"
    ),
    QuizQuestion(
        id=2,
        question="Which data structure uses LIFO?",
        options=["Queue", "Stack", "Linked List", "Array"],
        answer="Stack"
    ),
    QuizQuestion(
        id=3,
        question="Which language is known as the backbone of web development?",
        options=["Java", "Python", "HTML", "C++"],
        answer="HTML"
    ),
    QuizQuestion(
        id=4,
        question="Which keyword is used to define a function in Python?",
        options=["function", "fun", "def", "define"],
        answer="def"
    ),
    QuizQuestion(
        id=5,
        question="Which protocol is used to fetch web pages?",
        options=["FTP", "SMTP", "HTTP", "SSH"],
        answer="HTTP"
    ),
    QuizQuestion(
        id=6,
        question="Which operator is used for exponentiation in Python?",
        options=["^", "**", "//", "%"],
        answer="**"
    ),
    QuizQuestion(
        id=7,
        question="What does CSS stand for?",
        options=["Colorful Style Sheets", "Cascading Style Sheets", "Creative Style Sheets", "Computer Style Sheets"],
        answer="Cascading Style Sheets"
    ),
    QuizQuestion(
        id=8,
        question="Which of these is a JavaScript framework?",
        options=["Laravel", "Django", "React", "Flask"],
        answer="React"
    ),
    QuizQuestion(
        id=9,
        question="What does 'pip' stand for in Python?",
        options=["Python Install Package", "Pip Installs Packages", "Packages in Python", "Program in Python"],
        answer="Pip Installs Packages"
    ),
    QuizQuestion(
        id=10,
        question="Which is not a programming language?",
        options=["Python", "HTML", "Java", "C#"],
        answer="HTML"
    ),
]

# ---- Routes ----

@learning_plan_router.get("/quiz")
def get_quiz():
    selected_questions = random.sample(quiz_questions, 5)
    return {"questions": [q.dict() for q in selected_questions]}

@learning_plan_router.post("/generate-plan")
def generate_plan(req: GeneratePlanRequest):
    months = req.months
    hours_per_day = req.hours
    score = req.score

    if months <= 0 or hours_per_day <= 0:
        return GeneratePlanResponse(
            score=score,
            plan="Please enter valid months and daily hours to get a personalized plan."
        )

    # Full course topics
    course_content = [
        {"title": "Introduction to Programming", "base_hours": 4},
        {"title": "Variables and Data Types", "base_hours": 3},
        {"title": "Control Flow", "base_hours": 5},
        {"title": "Functions", "base_hours": 6},
        {"title": "Data Structures", "base_hours": 8},
        {"title": "Object-Oriented Programming", "base_hours": 10},
        {"title": "Error Handling", "base_hours": 4},
        {"title": "Modules and Packages", "base_hours": 3},
        {"title": "File Handling", "base_hours": 4},
        {"title": "Project: Mini Console App", "base_hours": 12},
    ]

    # Adjust topic hours based on score
    adjusted_content = []
    for topic in course_content:
        base = topic["base_hours"]
        if score >= 4:
            if base <= 5:
                adjusted_hours = max(int(base * 0.5), 1)
            else:
                adjusted_hours = base
        elif score >= 2:
            if base <= 5:
                adjusted_hours = int(base * 0.75)
            else:
                adjusted_hours = base
        else:
            adjusted_hours = base

        adjusted_content.append({
            "title": topic["title"],
            "minutes": adjusted_hours * 60  # convert to minutes
        })

    # Pomodoro settings
    pomodoro_study = 25
    pomodoro_break = 5
    pomodoro_total = pomodoro_study + pomodoro_break
    daily_minutes = hours_per_day * 60

    plan = []
    current_day = 1
    remaining_minutes = daily_minutes

    for topic in adjusted_content:
        title = topic["title"]
        topic_minutes = topic["minutes"]

        while topic_minutes > 0:
            if remaining_minutes < pomodoro_total:
                # Move to next day if not enough time for one Pomodoro
                current_day += 1
                remaining_minutes = daily_minutes

            study_time = min(pomodoro_study, topic_minutes)
            plan.append(
                f"### 📅 Day {current_day}\n\n\n\n"
                f"- 📓 Study: {title}\n"
                f"- ⏰ Duration: {study_time} mins\n"
                f"- 😌 Break: {pomodoro_break} mins\n\n" 
                f" ------\n\n"
                f" ------\n\n"
                )

            topic_minutes -= study_time
            remaining_minutes -= pomodoro_total

    # Join all into a single plan string
    plan_text = "\n".join(plan)

    return GeneratePlanResponse(score=score, plan=plan_text)

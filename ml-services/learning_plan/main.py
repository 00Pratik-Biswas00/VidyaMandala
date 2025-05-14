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
    hours = req.hours
    score = req.score

    if months <= 0 or hours <= 0:
        return GeneratePlanResponse(
            score=score,
            plan="Please enter valid months and daily hours to get a personalized plan."
        )

    intensity = "low"
    if score >= 4:
        intensity = "high"
    elif score >= 2:
        intensity = "medium"

    plan = ""

    if intensity == "high":
        plan = f"Great job scoring {score}/5! Based on your {months} months goal and {hours} hours/day availability, here's your plan:\n\n- Focus on advanced topics 5 days a week\n- Weekly mini-projects\n- Monthly assessments\n- Reserve weekends for revision or mock interviews"
    elif intensity == "medium":
        plan = f"You scored {score}/5. With {months} months and {hours} hrs/day, your plan is:\n\n- 3 days/week on core concepts\n- 2 days on practice (e.g., Leetcode, Codeforces)\n- Weekly recap sessions\n- Weekend project building"
    else:
        plan = f"You scored {score}/5. Let's start slow and steady.\n\n- Spend 3 days a week on basics\n- 1 day/week on real-world applications\n- Regular breaks and revision\n- Use videos and interactive lessons to build understanding"

    return GeneratePlanResponse(score=score, plan=plan)

# ml-services/learning_plan/main.py
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from . import planner

learning_plan_router = APIRouter()

class Answer(BaseModel):
    index: int
    answer: str

class LearningRequest(BaseModel):
    topic: str
    answers: List[Answer]
    months: int
    daily_hours: int

@learning_plan_router.get("/get-questions/{topic}")
def get_questions(topic: str):
    return planner.get_mcq_questions(topic)

@learning_plan_router.post("/generate-plan")
def generate_plan(request: LearningRequest):
    score = planner.evaluate_mcq_score(request.topic, request.answers)
    plan = planner.generate_learning_plan(score, request.months, request.daily_hours)
    return {"score": score, "plan": plan}

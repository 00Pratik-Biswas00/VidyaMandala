from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import random
from fastapi import APIRouter
from .planner import get_mcq_questions, get_course_topics_for_plan

learning_plan_router = APIRouter()

# ---- Data Models ----
class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    answer: str
    difficulty: Optional[str] = "medium"

class GeneratePlanRequest(BaseModel):
    courseId: str
    months: int
    hours: int
    score: int

class GeneratePlanResponse(BaseModel):
    score: int
    plan: str

# ---- Routes ----
@learning_plan_router.get("/quiz/{course_id}")
def get_quiz(course_id: str, authorization: str = Header(None)):
    """Get quiz questions for a specific course"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization token required")
    
    # Extract token from Authorization header
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    
    try:
        # Get course-specific MCQs from backend
        mcqs = get_mcq_questions(course_id, token, num_questions=5)
        return {"questions": mcqs}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get quiz: {str(e)}")

@learning_plan_router.post("/generate-plan")
def generate_plan(req: GeneratePlanRequest, authorization: str = Header(None)):
    """Generate a learning plan for a specific course"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization token required")
    
    # Extract token from Authorization header
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    
    months = req.months
    hours_per_day = req.hours
    score = req.score
    course_id = req.courseId

    if months <= 0 or hours_per_day <= 0:
        return GeneratePlanResponse(
            score=score,
            plan="Please enter valid months and daily hours to get a personalized plan."
        )

    try:
        # Get course-specific topics from backend
        course_content = get_course_topics_for_plan(course_id, token)
        
        if not course_content:
            return GeneratePlanResponse(
                score=score,
                plan="No topics found for this course. Please contact support."
            )
            
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
                    adjusted_hours = int(base * 0.75) or 1  # Ensure non-zero
                else:
                    adjusted_hours = base
            else:
                adjusted_hours = base or 1  # Ensure non-zero

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
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate plan: {str(e)}")
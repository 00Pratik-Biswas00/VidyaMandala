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
        # Get course-specific MCQs from backend (this now uses random.sample)
        mcqs = get_mcq_questions(course_id, token, num_questions=5)
        
        # If no MCQs found, return error
        if not mcqs:
            raise HTTPException(
                status_code=404, 
                detail=f"No quiz questions found for course: {course_id}"
            )
            
        # Format questions for frontend
        formatted_questions = []
        for i, mcq in enumerate(mcqs):
            formatted_questions.append({
                "id": i + 1,  # Ensure consistent numbering
                "question": mcq["question"],
                "options": mcq["options"],
                "answer": mcq["answer"],
                "difficulty": mcq.get("difficulty", "medium")
            })
            
        return {"questions": formatted_questions}
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
            # Ensure base is a positive number
            if not isinstance(base, (int, float)) or base <= 0:
                base = 1.0
                
            # Adjust hours based on quiz score
            if score >= 4:  # Excellent score (4-5) - faster learning pace
                adjusted_hours = max(base * 0.6, 0.5)  # Reduce time by 40% but minimum 30 mins
            elif score >= 2:  # Medium score (2-3) - standard pace
                adjusted_hours = max(base * 0.8, 0.75)  # Reduce time by 20% but minimum 45 mins
            else:  # Low score (0-1) - slower pace
                adjusted_hours = base  # Keep original time
            
            # Convert to minutes and ensure at least 15 minutes
            minutes = max(int(adjusted_hours * 60), 15)
            
            adjusted_content.append({
                "title": topic["title"],
                "minutes": minutes
            })
        
        # Pomodoro settings
        pomodoro_study = 25  # Standard pomodoro session length
        pomodoro_break = 5
        pomodoro_total = pomodoro_study + pomodoro_break
        daily_minutes = hours_per_day * 60
        
        # Calculate total days based on adjusted content
        total_minutes = sum(item["minutes"] for item in adjusted_content)
        total_pomodoros = total_minutes / pomodoro_study
        total_pomodoro_minutes = total_pomodoros * pomodoro_total
        estimated_days = max(1, round(total_pomodoro_minutes / daily_minutes))
        
        # Check if plan can fit within requested months
        max_days = months * 30
        if estimated_days > max_days:
            # If plan exceeds requested months, display warning
            warning = (f"⚠️ **Note:** Based on your course topics and daily commitment of {hours_per_day} hours, "
                      f"it would take approximately {estimated_days} days to complete this course, "
                      f"which exceeds your {months}-month timeframe.\n\n"
                      "The plan has been adjusted to fit your timeframe by focusing on the most important topics.\n\n")
        else:
            warning = ""

        plan = []
        current_day = 1
        remaining_minutes = daily_minutes

        for topic in adjusted_content:
            title = topic["title"]
            topic_minutes = topic["minutes"]
            
            # Skip to next topic if we've exceeded the maximum days
            if current_day > max_days:
                break

            while topic_minutes > 0:
                if remaining_minutes < pomodoro_total:
                    # Move to next day if not enough time for one Pomodoro
                    current_day += 1
                    remaining_minutes = daily_minutes
                    
                    # Stop if we've exceeded the maximum days
                    if current_day > max_days:
                        break

                study_time = min(pomodoro_study, topic_minutes)
                plan.append(
                    f"### 📅 Day {current_day}\n\n"
                    f"- 📓 **Study Topic:** {title}\n"
                    f"- ⏰ **Duration:** {study_time} mins\n"
                    f"- 😌 **Break:** {pomodoro_break} mins\n\n" 
                    f"*Remember to take notes and review what you've learned today.*\n\n"
                    f"------\n\n"
                )

                topic_minutes -= study_time
                remaining_minutes -= pomodoro_total

        # Join all into a single plan string
        plan_text = warning + "\n".join(plan)

        return GeneratePlanResponse(score=score, plan=plan_text)
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate plan: {str(e)}")
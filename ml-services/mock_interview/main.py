from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import asyncio
from mock_interview.interview import initialize_interview,select_question,process_question_answer,generate_final_report
import logging
from typing import List, Dict, Any

mock_interview_router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@mock_interview_router.post('/init-interview')
async def init_interview(data: str):
    """Initialize the quiz with an article URL"""
    try:
        course = data.get('course')
        
        if not course:
            raise HTTPException(status_code=400, detail="Course is required")
        
        result = await initialize_interview(course)
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in Generating Question: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@mock_interview_router.post('/select-question')
async def select_questions(data: Dict[str, Any]):
    """Select a question from Questions List"""
    try:
        questions_list = data.get('questions')
        selected_question = await select_question(questions_list)
        logger.info(selected_question)
        return selected_question
    
    except Exception as e:
        logger.error(f"Error in selecting Question: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@mock_interview_router.post('/submit-answer')
async def submit_answer(data: Dict[str, Any]):
    """Submit an answer and get feedback"""
    try:
        selected_question = data.get('question')
        user_answer = data.get('answer')
        interaction_history = data.get('interaction_history', [])
        
        if not all([selected_question, user_answer is not None]):
            raise HTTPException(status_code=400, detail="Missing required fields")
        
        result = await process_question_answer(
            selected_question, 
            user_answer, 
            interaction_history
        )
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in submit_answer: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@mock_interview_router.post('/generate-report')
async def get_final_report(data: Dict[str, Any]):
    """Generate final report"""
    try:
        interaction_history = data.get('interaction_history', [])
        
        if not interaction_history:
            raise HTTPException(status_code=400, detail="No interaction history provided")
        
        result = await generate_final_report(interaction_history)
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_final_report: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

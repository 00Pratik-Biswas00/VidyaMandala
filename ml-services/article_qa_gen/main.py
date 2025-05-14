from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import asyncio
from article_qa_gen.article_qa import run_quiz_flow, process_question_answer, generate_final_report, select_question
import logging
from typing import List, Dict, Any

article_quiz_router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@article_quiz_router.post('/init-quiz')
async def init_quiz(data: Dict[str, Any]):
    """Initialize the quiz with an article URL"""
    try:
        article_url = data.get('url')
        
        if not article_url:
            raise HTTPException(status_code=400, detail="URL is required")
        
        result = await run_quiz_flow(article_url)
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in init_quiz: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@article_quiz_router.post('/select-question')
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

@article_quiz_router.post('/submit-answer')
async def submit_answer(data: Dict[str, Any]):
    """Submit an answer and get feedback"""
    try:
        questions_list = data.get('questions', [])
        selected_question = data.get('question')
        user_answer = data.get('answer')
        interaction_history = data.get('interaction_history', [])
        
        if not all([questions_list, selected_question, user_answer is not None]):
            raise HTTPException(status_code=400, detail="Missing required fields")
        
        result = await process_question_answer(
            questions_list, 
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

@article_quiz_router.post('/generate-report')
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

# from flask import request, jsonify, Blueprint
# import asyncio
# from functools import wraps
# from article_qa_gen.article_qa import run_quiz_flow, process_question_answer, generate_final_report, select_question
# import logging

# article_quiz_blueprint = Blueprint('article', __name__)

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)


# @article_quiz_blueprint.route('/init-quiz', methods=['POST'])
# def init_quiz():
#     """Initialize the quiz with an article URL"""
#     try:
#         data = request.get_json()
#         article_url = data.get('url')
        
#         if not article_url:
#             return jsonify({"error": "URL is required"}), 400
        
#         # Run async function in a separate thread
#         result = asyncio.run(run_quiz_flow(article_url))
#         return jsonify(result)
    
#     except Exception as e:
#         logger.error(f"Error in init_quiz: {str(e)}")
#         return jsonify({"error": str(e)}), 500

# @article_quiz_blueprint.route('/select-question', methods=['POST'])
# def select_questions():
#     """Select a question from Questions List"""
#     try:
#         data = request.get_json()
#         questions_list = data.get('questions')
#         selected_question = asyncio.run(select_question(questions_list))
#         print(selected_question)
#         return jsonify(selected_question)
    
#     except Exception as e:
#         logger.error(f"Error in selecting Question: {str(e)}")
#         return jsonify({"error": str(e)}), 500

# @article_quiz_blueprint.route('/submit-answer', methods=['POST'])
# def submit_answer():
#     """Submit an answer and get feedback"""
#     try:
#         data = request.get_json()
#         questions_list = data.get('questions', [])
#         selected_question = data.get('question')
#         user_answer = data.get('answer')
#         interaction_history = data.get('interaction_history', [])
        
#         if not all([questions_list, selected_question, user_answer is not None]):
#             return jsonify({"error": "Missing required fields"}), 400
        
#         # Run async function in a separate thread
#         result = asyncio.run(
#             process_question_answer(questions_list, selected_question, user_answer, interaction_history)
#         )
#         return jsonify(result)
    
#     except Exception as e:
#         logger.error(f"Error in submit_answer: {str(e)}")
#         return jsonify({"error": str(e)}), 500

# @article_quiz_blueprint.route('/generate-report', methods=['POST'])
# def get_final_report():
#     """Generate final report"""
#     try:
#         data = request.get_json()
#         interaction_history = data.get('interaction_history', [])
        
#         if not interaction_history:
#             return jsonify({"error": "No interaction history provided"}), 400
        
#         # Run async function in a separate thread
#         result = asyncio.run(generate_final_report(interaction_history))
#         return jsonify(result)
    
#     except Exception as e:
#         logger.error(f"Error in get_final_report: {str(e)}")
#         return jsonify({"error": str(e)}), 500
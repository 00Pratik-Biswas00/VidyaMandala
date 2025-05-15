import os
import requests
from typing import Dict, List, Optional, Union
from datetime import datetime, timedelta
import json
from fastapi import HTTPException

class CourseDataFetcher:
    """Fetch course data from the backend for ML processing"""
    
    def __init__(self, backend_url: str = None):
        """Initialize with backend URL"""
        self.backend_url = backend_url or os.getenv("BACKEND_URL", "http://localhost:8000/api/v1")
    
    def get_course_data(self, course_id: str, auth_token: str) -> Dict:
        """Fetch course data from backend"""
        try:
            url = f"{self.backend_url}/ml-data/course/{course_id}"
            headers = {"Authorization": f"Bearer {auth_token}"}
            
            response = requests.get(url, headers=headers)
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Failed to fetch course data: {response.text}"
                )
                
            return response.json()["course"]
        
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error fetching course data: {str(e)}"
            )
    
    def get_course_mcqs(self, course_id: str, auth_token: str) -> List[Dict]:
        """Fetch MCQs for a specific course"""
        course_data = self.get_course_data(course_id, auth_token)
        return course_data.get("mcqs", [])
    
    def get_course_topics(self, course_id: str, auth_token: str) -> List[Dict]:
        """Fetch topics for a specific course"""
        course_data = self.get_course_data(course_id, auth_token)
        return course_data.get("topics", [])

def get_mcq_questions(course_id: str, auth_token: str, num_questions: int = 5) -> List[Dict]:
    """Get MCQ questions for a specific course"""
    data_fetcher = CourseDataFetcher()
    all_mcqs = data_fetcher.get_course_mcqs(course_id, auth_token)
    
    # If we have more MCQs than needed, randomly select a subset
    import random
    if len(all_mcqs) > num_questions:
        return random.sample(all_mcqs, num_questions)
    return all_mcqs

def get_course_topics_for_plan(course_id: str, auth_token: str) -> List[Dict]:
    """Get course topics formatted for learning plan generation"""
    data_fetcher = CourseDataFetcher()
    topics = data_fetcher.get_course_topics(course_id, auth_token)
    
    # Format topics for plan generation
    return [
        {
            "title": topic["title"],
            "base_hours": topic.get("baseHours", 1)
        }
        for topic in topics
    ]
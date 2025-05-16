from fastapi import APIRouter, HTTPException, Header, Depends
from typing import Dict, List, Any, Optional
import logging
import traceback
from .recommender import CourseRecommender

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize recommender engine
recommender = CourseRecommender()

recommender_router = APIRouter()

async def verify_token(authorization: Optional[str] = Header(None)):
    """Verify the JWT token"""
    if not authorization:
        logger.warning("Authorization token missing")
        raise HTTPException(status_code=401, detail="Authorization token required")
    
    # Remove 'Bearer ' prefix if present
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    
    # In a real application, we would validate the token here
    # For simplicity, we'll just return the token
    return token

@recommender_router.post("/recommend")
async def get_recommendations(
    data: Dict[str, Any],
    token: str = Depends(verify_token)
):
    """Get personalized course recommendations for a user"""
    try:
        user_id = data.get("userId")
        count = data.get("count", 6)
        
        logger.info(f"Recommendation request for user {user_id}")
        
        if not user_id:
            raise HTTPException(status_code=400, detail="userId is required")
            
        # If courses data is provided, update the recommender
        courses = data.get("courses")
        if courses:
            logger.info(f"Updating recommender with {len(courses)} courses")
            recommender.add_or_update_courses(courses)
            
        # Get recommendations
        recommendations = recommender.get_recommended_courses(user_id, count)
        
        return {
            "success": True,
            "recommendations": recommendations
        }
    except Exception as e:
        logger.error(f"Error getting recommendations: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")

@recommender_router.post("/track-activity")
async def track_user_activity(
    data: Dict[str, Any],
    token: str = Depends(verify_token)
):
    """Track user activity for recommendation purposes"""
    try:
        user_id = data.get("userId")
        activity_type = data.get("activityType")
        course_id = data.get("courseId")
        search_query = data.get("searchQuery")
        timestamp = data.get("timestamp")
        
        logger.info(f"Tracking activity for user {user_id}: {activity_type}")
        
        if not user_id or not activity_type:
            raise HTTPException(status_code=400, detail="userId and activityType are required")
            
        # Track the activity
        recommender.add_user_activity(
            user_id=user_id,
            activity_type=activity_type,
            course_id=course_id,
            search_query=search_query,
            timestamp=timestamp
        )
        
        return {"success": True, "message": "Activity tracked successfully"}
    except Exception as e:
        logger.error(f"Error tracking activity: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to track activity: {str(e)}")

@recommender_router.post("/initialize")
async def initialize_recommender(
    data: Dict[str, Any] = {},
    token: str = Depends(verify_token)
):
    """Initialize the recommender with courses provided directly"""
    try:
        # If courses are provided in the request, use them
        courses = data.get("courses", [])
        if courses:
            logger.info(f"Initializing recommender with {len(courses)} courses")
            count = recommender.add_or_update_courses(courses)
            return {
                "success": True, 
                "message": f"Recommender initialized with {count} courses"
            }
        else:
            # If no courses provided, see if we have any stored
            count = len(recommender.course_data)
            if count > 0:
                logger.info(f"Recommender already has {count} courses")
                return {
                    "success": True,
                    "message": f"Recommender already initialized with {count} courses"
                }
            else:
                logger.warning("No courses provided for initialization")
                return {
                    "success": False,
                    "message": "No courses provided for initialization"
                }
    except Exception as e:
        logger.error(f"Error initializing recommender: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to initialize recommender: {str(e)}")

@recommender_router.get("/status")
async def get_status():
    """Get status information about the recommender"""
    try:
        return {
            "success": True,
            "courses_count": len(recommender.course_data),
            "users_count": len(recommender.user_activity_data),
            "has_vectors": recommender.course_vectors is not None
        }
    except Exception as e:
        logger.error(f"Error getting status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")
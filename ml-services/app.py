from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from dotenv import load_dotenv
from block_diagram_generator.main import block_diagram_router
from article_qa_gen.main import article_quiz_router
from pdf_qa_summary_gen.main import pdf_summary_router
from learning_plan.main import learning_plan_router
from mock_interview.main import mock_interview_router
from course_recommender.main import recommender_router

load_dotenv()


app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# @app.get("/")
# async def root():
#     """Root endpoint for API health check"""
#     return {"status": "API is running"}

# @app.get("/health")
# async def health_check():
#     """Health check endpoint"""
#     return {
#         "status": "ok",
#         "services": {
#             "recommender": True
#         }
#     }

# @app.get("/recommender/status")
# async def recommender_status():
#     """Status information about the recommender"""
#     return {
#         "success": True,
#         "courses_count": 0,
#         "users_count": 0,
#         "has_vectors": False
#     }

# @app.post("/recommender/initialize")
# async def initialize_recommender(data: dict = None):
#     """Initialize the recommender with course data"""
#     courses = data.get("courses", []) if data else []
#     course_count = len(courses)
    
#     return {
#         "success": True,
#         "message": f"Initialized recommender with {course_count} courses"
#     }

# @app.post("/recommender/recommend")
# async def get_recommendations(data: dict):
#     """Get dummy recommendations for demonstration"""
#     user_id = data.get("userId", "")
#     count = data.get("count", 6)
    
#     # Return empty recommendations for now
#     return {
#         "success": True,
#         "recommendations": []
#     }

# @app.post("/recommender/track-activity")
# async def track_user_activity(data: dict):
#     """Track user activity (view, search, enroll)"""
#     return {
#         "success": True,
#         "message": "Activity tracked"
#     }

# @app.get("/routes")
# async def list_routes():
#     """List all available routes for debugging"""
#     routes = []
#     for route in app.routes:
#         routes.append({
#             "path": route.path,
#             "methods": list(route.methods) if hasattr(route, "methods") else [],
#         })
#     return {"routes": routes}

# Include routers with prefixes
app.include_router(article_quiz_router, prefix="/article")
app.include_router(block_diagram_router, prefix="/block")
app.include_router(pdf_summary_router, prefix="/pdf")
app.include_router(learning_plan_router, prefix="/learning")
app.include_router(mock_interview_router, prefix='/interview')
app.include_router(recommender_router, prefix='/recommender')



if __name__ == "__main__":
    import uvicorn
    
    if not os.getenv("GOOGLE_API_KEY"):
        logger.warning("GOOGLE_API_KEY not found in .env file!")
        
    uvicorn.run(app, host="0.0.0.0", port=5000)

    # For hot reload use:   uvicorn app:app --host 0.0.0.0 --port 5000 --reload
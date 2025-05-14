import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import pymongo
import os
from dotenv import load_dotenv
import logging
from typing import List, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()

class CourseRecommender:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.course_embeddings = {}
        self.course_data = {}
        self.connect_to_db()
        
    def connect_to_db(self):
        """Connect to MongoDB and load course data"""
        try:
            mongo_uri = os.environ.get("MONGODB_URI")
            if not mongo_uri:
                raise ValueError("MONGODB_URI environment variable not set")
            
            self.client = pymongo.MongoClient(mongo_uri)
            self.db = self.client.get_database()
            logger.info("Connected to MongoDB successfully")
            self.refresh_course_data()
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    def refresh_course_data(self):
        """Load all courses and generate embeddings"""
        try:
            courses = list(self.db.courses.find({}))
            logger.info(f"Loaded {len(courses)} courses from database")
            
            self.course_data = {str(course['_id']): course for course in courses}
            
            # Generate embeddings for all courses
            for course_id, course in self.course_data.items():
                # Create text representation of course for embedding
                course_text = f"{course['title']} {course['category']} " + \
                            " ".join([topic['title'] for topic in course.get('topics', [])])
                self.course_embeddings[course_id] = self.model.encode(course_text)
                
            logger.info(f"Generated embeddings for {len(self.course_embeddings)} courses")
        except Exception as e:
            logger.error(f"Error refreshing course data: {e}")
            raise
    
    def get_user_enrolled_courses(self, user_id: str) -> List[str]:
        """Get courses in which a user is enrolled"""
        try:
            user = self.db.users.find_one({"_id": pymongo.ObjectId(user_id)})
            if not user or 'enrolledCourses' not in user:
                return []
            
            enrolled_courses = [str(course_id) for course_id in user['enrolledCourses']]
            return enrolled_courses
        except Exception as e:
            logger.error(f"Error fetching user enrolled courses: {e}")
            return []
    
    def get_similar_courses(self, course_id: str, num_recommendations: int = 5) -> List[Dict[str, Any]]:
        """Get similar courses based on content similarity"""
        try:
            if course_id not in self.course_embeddings:
                logger.warning(f"Course ID {course_id} not found in embeddings")
                return []
            
            # Calculate similarity with all courses
            similarities = {}
            for other_id, embedding in self.course_embeddings.items():
                if other_id != course_id:
                    similarity = cosine_similarity(
                        [self.course_embeddings[course_id]],
                        [embedding]
                    )[0][0]
                    similarities[other_id] = similarity
            
            # Sort by similarity score
            similar_courses = sorted(similarities.items(), key=lambda x: x[1], reverse=True)
            top_courses = similar_courses[:num_recommendations]
            
            # Format response
            recommended_courses = []
            for course_id, score in top_courses:
                course = self.course_data[course_id]
                recommended_courses.append({
                    "id": course_id,
                    "title": course["title"],
                    "category": course["category"],
                    "enrolled": course["enrolled"],
                    "duration": course["duration"],
                    "language": course["language"],
                    "placeholderImage": course.get("placeholderImage"),
                    "similarity_score": round(float(score), 3)
                })
            
            return recommended_courses
        except Exception as e:
            logger.error(f"Error getting similar courses: {e}")
            return []
    
    def get_collaborative_recommendations(self, user_id: str, num_recommendations: int = 5) -> List[Dict[str, Any]]:
        """Get recommendations based on what other similar users enrolled in"""
        try:
            user_courses = self.get_user_enrolled_courses(user_id)
            if not user_courses:
                return []
            
            # Find users with similar enrollments
            similar_users = []
            all_users = list(self.db.users.find({}))
            
            for other_user in all_users:
                other_user_id = str(other_user['_id'])
                if other_user_id == user_id:
                    continue
                    
                other_courses = [str(c) for c in other_user.get('enrolledCourses', [])]
                
                # Calculate Jaccard similarity between course sets
                intersection = len(set(user_courses) & set(other_courses))
                union = len(set(user_courses) | set(other_courses))
                
                if union > 0 and intersection > 0:
                    similarity = intersection / union
                    similar_users.append((other_user_id, similarity, other_courses))
            
            # Sort by similarity
            similar_users.sort(key=lambda x: x[1], reverse=True)
            similar_users = similar_users[:10]  # Take top 10 similar users
            
            # Count course frequencies among similar users
            course_counts = {}
            for _, similarity, other_courses in similar_users:
                for course_id in other_courses:
                    if course_id not in user_courses:  # Don't recommend courses user already has
                        if course_id in self.course_data:  # Make sure course exists
                            if course_id not in course_counts:
                                course_counts[course_id] = 0
                            course_counts[course_id] += similarity  # Weight by similarity
            
            # Sort by weighted count
            recommended_course_ids = sorted(course_counts.items(), key=lambda x: x[1], reverse=True)
            recommended_course_ids = recommended_course_ids[:num_recommendations]
            
            # Format response
            recommendations = []
            for course_id, score in recommended_course_ids:
                if course_id in self.course_data:
                    course = self.course_data[course_id]
                    recommendations.append({
                        "id": course_id,
                        "title": course["title"],
                        "category": course["category"],
                        "enrolled": course["enrolled"],
                        "duration": course["duration"],
                        "language": course["language"],
                        "placeholderImage": course.get("placeholderImage"),
                        "recommendation_score": round(float(score), 3),
                        "recommendation_type": "collaborative"
                    })
            
            return recommendations
        except Exception as e:
            logger.error(f"Error in collaborative filtering: {e}")
            return []
    
    def get_learning_path_recommendations(self, user_id: str, num_recommendations: int = 5) -> List[Dict[str, Any]]:
        """Recommend next courses based on user's learning path progression"""
        try:
            user_courses = self.get_user_enrolled_courses(user_id)
            if not user_courses:
                return []
                
            # Get categories of enrolled courses
            user_categories = set()
            for course_id in user_courses:
                if course_id in self.course_data:
                    user_categories.add(self.course_data[course_id]['category'])
            
            # For each category, find progression path based on difficulty/enrollment count
            category_recommendations = {}
            
            for category in user_categories:
                # Find all courses in this category
                category_courses = []
                for course_id, course in self.course_data.items():
                    if course['category'] == category and course_id not in user_courses:
                        # Use enrolled count as a proxy for course popularity/difficulty
                        category_courses.append((course_id, course['enrolled']))
                
                # Sort by enrollment count (higher count suggests more advanced courses)
                category_courses.sort(key=lambda x: x[1], reverse=True)
                category_recommendations[category] = category_courses[:3]  # Top 3 per category
            
            # Flatten and prepare recommendations
            recommendations = []
            for category, courses in category_recommendations.items():
                for course_id, _ in courses:
                    if course_id in self.course_data:
                        course = self.course_data[course_id]
                        recommendations.append({
                            "id": course_id,
                            "title": course["title"],
                            "category": course["category"],
                            "enrolled": course["enrolled"],
                            "duration": course["duration"],
                            "language": course["language"],
                            "placeholderImage": course.get("placeholderImage"),
                            "recommendation_type": "learning_path"
                        })
            
            # Sort by enrolled count as a final ranking
            recommendations.sort(key=lambda x: x['enrolled'], reverse=True)
            return recommendations[:num_recommendations]
        except Exception as e:
            logger.error(f"Error in learning path recommendations: {e}")
            return []
    
    def get_recommendations(self, user_id: str, recently_viewed_course_id: str = None) -> Dict[str, Any]:
        """Get personalized course recommendations for a user"""
        try:
            # 1. Initialize default response structure
            response = {
                "content_based": [],
                "collaborative": [],
                "learning_path": [],
                "featured": []
            }
            
            # 2. Get content-based recommendations from recently viewed course
            if recently_viewed_course_id:
                response["content_based"] = self.get_similar_courses(
                    recently_viewed_course_id,
                    num_recommendations=5
                )
            
            # 3. Get collaborative filtering recommendations
            response["collaborative"] = self.get_collaborative_recommendations(
                user_id,
                num_recommendations=5
            )
            
            # 4. Get learning path recommendations
            response["learning_path"] = self.get_learning_path_recommendations(
                user_id,
                num_recommendations=5
            )
            
            # 5. Featured recommendations (most popular courses)
            popular_courses = sorted(
                self.course_data.values(),
                key=lambda x: x['enrolled'],
                reverse=True
            )[:5]
            
            response["featured"] = [
                {
                    "id": str(course["_id"]),
                    "title": course["title"],
                    "category": course["category"],
                    "enrolled": course["enrolled"],
                    "duration": course["duration"],
                    "language": course["language"],
                    "placeholderImage": course.get("placeholderImage"),
                    "recommendation_type": "featured"
                }
                for course in popular_courses
            ]
            
            return response
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            return {"error": str(e)}
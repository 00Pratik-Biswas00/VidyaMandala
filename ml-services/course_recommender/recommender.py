import logging
from typing import Dict, List, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

logger = logging.getLogger(__name__)

class CourseRecommender:
    def __init__(self):
        self.user_activity_data = {}  # User activity history
        self.course_data = {}  # Course metadata
        self.course_vectors = None  # TF-IDF vectors for content-based filtering
        self.vectorizer = None
        logger.info("CourseRecommender initialized")
    
    def add_or_update_courses(self, courses: List[Dict[str, Any]]):
        """Add or update course data for the recommender"""
        # Store courses by ID
        course_count = 0
        for course in courses:
            course_id = str(course.get('_id'))
            if not course_id:
                continue
                
            self.course_data[course_id] = {
                'id': course_id,
                'title': course.get('title', ''),
                'description': course.get('description', ''),
                'category': course.get('category', ''),
                'popularity': course.get('enrolled', 0)
            }
            course_count += 1
        
        # Rebuild the content vectors when courses are updated
        self._build_content_vectors()
        logger.info(f"Added/updated {course_count} courses, total courses: {len(self.course_data)}")
        return course_count
    
    def _build_content_vectors(self):
        """Build TF-IDF vectors for content-based recommendations"""
        if not self.course_data:
            logger.warning("No course data available to build vectors")
            return
            
        try:
            course_ids = []
            course_texts = []
            
            for course_id, data in self.course_data.items():
                # Combine text features for TF-IDF
                text = f"{data['title']} {data['description']} {data['category']}"
                course_ids.append(course_id)
                course_texts.append(text)
            
            # Create TF-IDF vectors
            self.vectorizer = TfidfVectorizer(stop_words='english')
            self.course_vectors = self.vectorizer.fit_transform(course_texts)
            self.course_id_to_idx = {course_id: idx for idx, course_id in enumerate(course_ids)}
            self.idx_to_course_id = {idx: course_id for idx, course_id in enumerate(course_ids)}
            logger.info(f"Built content vectors for {len(course_ids)} courses")
        except Exception as e:
            logger.error(f"Error building content vectors: {str(e)}")
    
    def add_user_activity(self, user_id: str, activity_type: str, course_id: Optional[str] = None, 
                          search_query: Optional[str] = None, timestamp: Optional[int] = None):
        """Track user activity for personalized recommendations"""
        if user_id not in self.user_activity_data:
            self.user_activity_data[user_id] = {
                "viewed": [],        # Course IDs user has viewed
                "enrolled": [],      # Course IDs user has enrolled in
                "searched": [],      # Search queries user has made
                "recent_activity": []  # Recent activities in chronological order
            }
        
        # Add specific activity data
        if activity_type == "view" and course_id:
            if course_id not in self.user_activity_data[user_id]["viewed"]:
                self.user_activity_data[user_id]["viewed"].append(course_id)
                
        elif activity_type == "enroll" and course_id:
            if course_id not in self.user_activity_data[user_id]["enrolled"]:
                self.user_activity_data[user_id]["enrolled"].append(course_id)
                
        elif activity_type == "search" and search_query:
            self.user_activity_data[user_id]["searched"].append(search_query)
        
        # Add to recent activity timeline
        activity = {
            "type": activity_type,
            "course_id": course_id,
            "search_query": search_query,
            "timestamp": timestamp or 0
        }
        self.user_activity_data[user_id]["recent_activity"].append(activity)
        
        # Keep only last 20 activities
        if len(self.user_activity_data[user_id]["recent_activity"]) > 20:
            self.user_activity_data[user_id]["recent_activity"] = \
                self.user_activity_data[user_id]["recent_activity"][-20:]
                
        logger.info(f"Tracked {activity_type} activity for user {user_id}")
    
    def get_recommended_courses(self, user_id: str, count: int = 6) -> List[Dict]:
        """Get personalized course recommendations for a user"""
        if not self.course_data:
            logger.warning(f"No course data available for recommendations")
            return []
            
        # If user has no activity history, return popular courses
        if user_id not in self.user_activity_data:
            logger.info(f"No activity data for user {user_id}, returning popular courses")
            return self._get_popular_courses(count)
        
        user_data = self.user_activity_data[user_id]
        
        # If user hasn't viewed or enrolled in any courses, return popular courses
        if not user_data.get("viewed") and not user_data.get("enrolled"):
            logger.info(f"User {user_id} has no course interactions, returning popular courses")
            return self._get_popular_courses(count)
        
        # Get course IDs the user has interacted with
        viewed_courses = user_data.get("viewed", [])
        enrolled_courses = user_data.get("enrolled", [])
        
        # Combine and get unique course IDs
        interacted_courses = list(set(viewed_courses + enrolled_courses))
        
        # Find similar courses
        similar_courses = {}
        for course_id in interacted_courses:
            if course_id in self.course_data:
                # Get similar courses for each course the user has interacted with
                course_similars = self._find_similar_courses(course_id)
                for similar_id, score in course_similars.items():
                    if similar_id in similar_courses:
                        similar_courses[similar_id] += score
                    else:
                        similar_courses[similar_id] = score
        
        # Remove courses the user has already interacted with
        for course_id in interacted_courses:
            if course_id in similar_courses:
                del similar_courses[course_id]
        
        # Sort courses by similarity score
        sorted_courses = sorted(similar_courses.items(), key=lambda x: x[1], reverse=True)
        
        # Get top N recommendations
        recommendations = []
        for course_id, _ in sorted_courses[:count]:
            if course_id in self.course_data:
                recommendations.append({
                    "id": course_id,
                    "score": similar_courses[course_id],
                    **self.course_data[course_id]
                })
        
        # If we don't have enough recommendations, supplement with popular courses
        if len(recommendations) < count:
            popular_courses = self._get_popular_courses(count - len(recommendations))
            # Only add popular courses that aren't already in recommendations
            rec_ids = [r["id"] for r in recommendations]
            for course in popular_courses:
                if course["id"] not in rec_ids:
                    recommendations.append(course)
                    if len(recommendations) >= count:
                        break
        
        logger.info(f"Generated {len(recommendations)} recommendations for user {user_id}")
        return recommendations[:count]
    
    def _find_similar_courses(self, course_id: str) -> Dict[str, float]:
        """Find courses similar to the given course based on content"""
        if not self.course_vectors or course_id not in self.course_id_to_idx:
            return {}
            
        try:
            course_idx = self.course_id_to_idx[course_id]
            course_vector = self.course_vectors[course_idx]
            
            # Calculate similarity with all courses
            similarities = cosine_similarity(course_vector, self.course_vectors).flatten()
            
            # Get indices sorted by similarity
            indices = similarities.argsort()[::-1]
            
            # Convert to dict of id -> similarity score
            similar_courses = {}
            for idx in indices[1:11]:  # Skip the first one (it's the course itself)
                similar_id = self.idx_to_course_id[idx]
                if similar_id != course_id:  # Extra check to ensure we don't include the input course
                    similar_courses[similar_id] = float(similarities[idx])
            
            return similar_courses
        except Exception as e:
            logger.error(f"Error finding similar courses for {course_id}: {str(e)}")
            return {}
    
    def _get_popular_courses(self, count: int = 6) -> List[Dict]:
        """Get the most popular courses"""
        if not self.course_data:
            return []
            
        # Sort courses by popularity (enrolled count)
        sorted_courses = sorted(
            self.course_data.values(), 
            key=lambda x: x.get("popularity", 0), 
            reverse=True
        )
        
        # Return the top N courses
        return [{"id": course["id"], **course} for course in sorted_courses[:count]]
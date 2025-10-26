"""
Database service layer - CRUD operations
Handles all database interactions
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from .connection import get_database
from .models import (
    User, 
    ScanHistory, 
    SearchHistory, 
    UserPreferences, 
    BreedPrediction,
    Pet,
    VaccinationRecord,
    UserFeedback,
    CommunityFeedback,
    VaccinationStatus,
    FeedbackType,
    FeedbackStatus
)


# ==================== User Operations ====================
class UserService:
    """User database operations"""
    
    @staticmethod
    async def create_user(user_data: User) -> Dict[str, Any]:
        """Create new user in database"""
        db = get_database()
        user_dict = user_data.model_dump()
        result = await db.users.insert_one(user_dict)
        user_dict["_id"] = str(result.inserted_id)
        return user_dict
    
    @staticmethod
    async def get_user_by_clerk_id(clerk_user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by Clerk ID"""
        db = get_database()
        user = await db.users.find_one({"clerk_user_id": clerk_user_id})
        if user:
            user["_id"] = str(user["_id"])
        return user
    
    @staticmethod
    async def update_user(clerk_user_id: str, update_data: Dict[str, Any]) -> bool:
        """Update user information"""
        db = get_database()
        update_data["last_login"] = datetime.utcnow()
        result = await db.users.update_one(
            {"clerk_user_id": clerk_user_id},
            {"$set": update_data}
        )
        return result.modified_count > 0
    
    @staticmethod
    async def increment_scan_count(clerk_user_id: str) -> bool:
        """Increment user's total scan count"""
        db = get_database()
        result = await db.users.update_one(
            {"clerk_user_id": clerk_user_id},
            {"$inc": {"total_scans": 1}}
        )
        return result.modified_count > 0
    
    @staticmethod
    async def add_favorite_breed(clerk_user_id: str, breed_name: str) -> bool:
        """Add breed to user's favorites"""
        db = get_database()
        result = await db.users.update_one(
            {"clerk_user_id": clerk_user_id},
            {"$addToSet": {"favorite_breeds": breed_name}}
        )
        return result.modified_count > 0
    
    @staticmethod
    async def remove_favorite_breed(clerk_user_id: str, breed_name: str) -> bool:
        """Remove breed from user's favorites"""
        db = get_database()
        result = await db.users.update_one(
            {"clerk_user_id": clerk_user_id},
            {"$pull": {"favorite_breeds": breed_name}}
        )
        return result.modified_count > 0


# ==================== Scan History Operations ====================
class ScanHistoryService:
    """Scan history database operations"""
    
    @staticmethod
    async def create_scan(scan_data: ScanHistory) -> Dict[str, Any]:
        """Save new scan to database"""
        db = get_database()
        scan_dict = scan_data.model_dump()
        result = await db.scan_history.insert_one(scan_dict)
        scan_dict["_id"] = str(result.inserted_id)
        return scan_dict
    
    @staticmethod
    async def get_user_scans(
        clerk_user_id: str,
        limit: int = 50,
        skip: int = 0
    ) -> List[Dict[str, Any]]:
        """Get user's scan history with pagination"""
        db = get_database()
        cursor = db.scan_history.find(
            {"user_id": clerk_user_id}
        ).sort("timestamp", -1).skip(skip).limit(limit)
        
        scans = []
        async for scan in cursor:
            scan["_id"] = str(scan["_id"])
            scans.append(scan)
        return scans
    
    @staticmethod
    async def get_scan_statistics(clerk_user_id: str) -> Dict[str, Any]:
        """Get user's scan statistics"""
        db = get_database()
        
        pipeline = [
            {"$match": {"user_id": clerk_user_id}},
            {"$group": {
                "_id": None,
                "total_scans": {"$sum": 1},
                "avg_confidence": {"$avg": "$confidence_score"},
                "crossbreed_count": {
                    "$sum": {"$cond": ["$is_crossbreed", 1, 0]}
                }
            }}
        ]
        
        result = await db.scan_history.aggregate(pipeline).to_list(1)
        return result[0] if result else {
            "total_scans": 0,
            "avg_confidence": 0,
            "crossbreed_count": 0
        }
    
    @staticmethod
    async def get_breed_frequency(clerk_user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get most frequently scanned breeds"""
        db = get_database()
        
        pipeline = [
            {"$match": {"user_id": clerk_user_id}},
            {"$group": {
                "_id": "$predicted_breed",
                "count": {"$sum": 1},
                "avg_confidence": {"$avg": "$confidence_score"}
            }},
            {"$sort": {"count": -1}},
            {"$limit": limit},
            {"$project": {
                "breed": "$_id",
                "count": 1,
                "avg_confidence": 1,
                "_id": 0
            }}
        ]
        
        return await db.scan_history.aggregate(pipeline).to_list(limit)
    
    @staticmethod
    async def get_scans_by_breed(clerk_user_id: str, breed_name: str) -> List[Dict[str, Any]]:
        """Get all scans for a specific breed"""
        db = get_database()
        
        cursor = db.scan_history.find({
            "user_id": clerk_user_id,
            "predicted_breed": breed_name
        }).sort("timestamp", -1)
        
        scans = []
        async for scan in cursor:
            scan["_id"] = str(scan["_id"])
            scans.append(scan)
        return scans
    
    @staticmethod
    async def get_user_scans_with_dates(
        clerk_user_id: str, 
        limit: int = 50, 
        skip: int = 0,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Get user's scan history with optional date filtering"""
        db = get_database()
        
        # Build query with optional date filtering
        query = {"user_id": clerk_user_id}
        if start_date or end_date:
            query["timestamp"] = {}
            if start_date:
                query["timestamp"]["$gte"] = start_date
            if end_date:
                query["timestamp"]["$lte"] = end_date
        
        cursor = db.scan_history.find(query).sort("timestamp", -1).skip(skip).limit(limit)
        
        scans = []
        async for scan in cursor:
            scan["_id"] = str(scan["_id"])
            scans.append(scan)
        return scans
    
    @staticmethod
    async def update_scan_feedback(
        scan_id: str,
        feedback: str,
        confirmed_breed: Optional[str] = None
    ) -> bool:
        """Update user feedback on a scan"""
        db = get_database()
        from bson import ObjectId
        
        update_data = {"user_feedback": feedback}
        if confirmed_breed:
            update_data["user_confirmed_breed"] = confirmed_breed
        
        result = await db.scan_history.update_one(
            {"_id": ObjectId(scan_id)},
            {"$set": update_data}
        )
        return result.modified_count > 0


# ==================== Search History Operations ====================
class SearchHistoryService:
    """Search history database operations"""
    
    @staticmethod
    async def create_search(search_data: SearchHistory) -> Dict[str, Any]:
        """Save new search to database"""
        db = get_database()
        search_dict = search_data.model_dump()
        result = await db.search_history.insert_one(search_dict)
        search_dict["_id"] = str(result.inserted_id)
        return search_dict
    
    @staticmethod
    async def get_user_searches(
        clerk_user_id: str,
        limit: int = 20,
        skip: int = 0
    ) -> List[Dict[str, Any]]:
        """Get user's search history with pagination"""
        db = get_database()
        cursor = db.search_history.find(
            {"user_id": clerk_user_id}
        ).sort("search_timestamp", -1).skip(skip).limit(limit)
        
        searches = []
        async for search in cursor:
            search["_id"] = str(search["_id"])
            searches.append(search)
        return searches
    
    @staticmethod
    async def get_recent_searches(clerk_user_id: str, limit: int = 10) -> List[str]:
        """Get recent unique breed searches"""
        db = get_database()
        
        pipeline = [
            {"$match": {"user_id": clerk_user_id}},
            {"$sort": {"search_timestamp": -1}},
            {"$group": {
                "_id": "$breed_searched",
                "latest_search": {"$first": "$search_timestamp"}
            }},
            {"$sort": {"latest_search": -1}},
            {"$limit": limit},
            {"$project": {"breed": "$_id", "_id": 0}}
        ]
        
        results = await db.search_history.aggregate(pipeline).to_list(limit)
        return [r["breed"] for r in results]
    
    @staticmethod
    async def get_popular_breeds(limit: int = 10) -> List[Dict[str, Any]]:
        """Get most searched breeds globally"""
        db = get_database()
        
        pipeline = [
            {"$group": {
                "_id": "$breed_searched",
                "search_count": {"$sum": 1},
                "unique_users": {"$addToSet": "$user_id"}
            }},
            {"$project": {
                "breed": "$_id",
                "search_count": 1,
                "user_count": {"$size": "$unique_users"},
                "_id": 0
            }},
            {"$sort": {"search_count": -1}},
            {"$limit": limit}
        ]
        
        return await db.search_history.aggregate(pipeline).to_list(limit)
    
    @staticmethod
    async def update_search_interaction(
        search_id: str,
        time_spent: Optional[int] = None,
        sections_viewed: Optional[List[str]] = None,
        is_bookmarked: Optional[bool] = None,
        rating: Optional[int] = None
    ) -> bool:
        """Update search interaction data"""
        db = get_database()
        from bson import ObjectId
        
        update_data = {}
        if time_spent is not None:
            update_data["time_spent_viewing"] = time_spent
        if sections_viewed is not None:
            update_data["sections_viewed"] = sections_viewed
        if is_bookmarked is not None:
            update_data["is_bookmarked"] = is_bookmarked
        if rating is not None:
            update_data["user_rating"] = rating
        
        if not update_data:
            return False
        
        result = await db.search_history.update_one(
            {"_id": ObjectId(search_id)},
            {"$set": update_data}
        )
        return result.modified_count > 0


# ==================== User Preferences Operations ====================
class UserPreferencesService:
    """User preferences database operations"""
    
    @staticmethod
    async def create_preferences(preferences_data: UserPreferences) -> Dict[str, Any]:
        """Create user preferences"""
        db = get_database()
        prefs_dict = preferences_data.model_dump()
        result = await db.user_preferences.insert_one(prefs_dict)
        prefs_dict["_id"] = str(result.inserted_id)
        return prefs_dict
    
    @staticmethod
    async def get_preferences(clerk_user_id: str) -> Optional[Dict[str, Any]]:
        """Get user preferences"""
        db = get_database()
        prefs = await db.user_preferences.find_one({"user_id": clerk_user_id})
        if prefs:
            prefs["_id"] = str(prefs["_id"])
        return prefs
    
    @staticmethod
    async def update_preferences(
        clerk_user_id: str,
        update_data: Dict[str, Any]
    ) -> bool:
        """Update user preferences"""
        db = get_database()
        update_data["updated_at"] = datetime.utcnow()
        result = await db.user_preferences.update_one(
            {"user_id": clerk_user_id},
            {"$set": update_data},
            upsert=True
        )
        return result.modified_count > 0 or result.upserted_id is not None


# ==================== Pet Operations ====================
class PetService:
    """Pet database operations"""
    
    @staticmethod
    async def create_pet(pet_data: dict) -> Dict[str, Any]:
        """Create new pet record"""
        from .models import Pet
        pet = Pet(**pet_data)
        db = get_database()
        pet_dict = pet.model_dump()
        result = await db.pets.insert_one(pet_dict)
        pet_dict["_id"] = str(result.inserted_id)
        return pet_dict
    
    @staticmethod
    async def get_user_pets(clerk_user_id: str) -> List[Dict[str, Any]]:
        """Get all pets for a user"""
        db = get_database()
        cursor = db.pets.find(
            {"user_id": clerk_user_id, "is_active": True}
        ).sort("created_at", -1)
        
        pets = []
        async for pet in cursor:
            pet["_id"] = str(pet["_id"])
            pets.append(pet)
        return pets
    
    @staticmethod
    async def get_pet_by_id(pet_id: str) -> Optional[Dict[str, Any]]:
        """Get specific pet by ID"""
        db = get_database()
        from bson import ObjectId
        try:
            pet = await db.pets.find_one({"_id": ObjectId(pet_id)})
            if pet:
                pet["_id"] = str(pet["_id"])
            return pet
        except:
            return None
    
    @staticmethod
    async def update_pet(pet_id: str, update_data: Dict[str, Any]) -> bool:
        """Update pet information"""
        db = get_database()
        from bson import ObjectId
        update_data["updated_at"] = datetime.utcnow()
        
        try:
            result = await db.pets.update_one(
                {"_id": ObjectId(pet_id)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except:
            return False
    
    @staticmethod
    async def delete_pet(pet_id: str) -> bool:
        """Soft delete pet (mark as inactive)"""
        db = get_database()
        from bson import ObjectId
        try:
            result = await db.pets.update_one(
                {"_id": ObjectId(pet_id)},
                {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except:
            return False


# ==================== Vaccination Operations ====================
class VaccinationService:
    """Vaccination record database operations"""
    
    @staticmethod
    async def create_vaccination(vaccination_data: dict) -> Dict[str, Any]:
        """Create new vaccination record"""
        from .models import VaccinationRecord
        vaccination = VaccinationRecord(**vaccination_data)
        db = get_database()
        vaccination_dict = vaccination.model_dump()
        result = await db.vaccinations.insert_one(vaccination_dict)
        vaccination_dict["_id"] = str(result.inserted_id)
        return vaccination_dict
    
    @staticmethod
    async def get_pet_vaccinations(
        user_id: str, 
        pet_id: str = None
    ) -> List[Dict[str, Any]]:
        """Get vaccinations for user's pets"""
        db = get_database()
        query = {"user_id": user_id}
        if pet_id:
            query["pet_id"] = pet_id
            
        cursor = db.vaccinations.find(query).sort("due_date", 1)
        
        vaccinations = []
        async for vaccination in cursor:
            vaccination["_id"] = str(vaccination["_id"])
            vaccinations.append(vaccination)
        return vaccinations
    
    @staticmethod
    async def get_upcoming_vaccinations(
        user_id: str, 
        days_ahead: int = 30
    ) -> List[Dict[str, Any]]:
        """Get upcoming vaccinations within specified days"""
        from datetime import timedelta
        db = get_database()
        
        end_date = datetime.utcnow() + timedelta(days=days_ahead)
        
        cursor = db.vaccinations.find({
            "user_id": user_id,
            "status": {"$in": ["upcoming", "scheduled"]},
            "due_date": {"$lte": end_date}
        }).sort("due_date", 1)
        
        vaccinations = []
        async for vaccination in cursor:
            vaccination["_id"] = str(vaccination["_id"])
            vaccinations.append(vaccination)
        return vaccinations
    
    @staticmethod
    async def get_overdue_vaccinations(user_id: str) -> List[Dict[str, Any]]:
        """Get overdue vaccinations"""
        db = get_database()
        
        cursor = db.vaccinations.find({
            "user_id": user_id,
            "status": {"$ne": "completed"},
            "due_date": {"$lt": datetime.utcnow()}
        }).sort("due_date", 1)
        
        vaccinations = []
        async for vaccination in cursor:
            vaccination["_id"] = str(vaccination["_id"])
            vaccinations.append(vaccination)
        return vaccinations
    
    @staticmethod
    async def update_vaccination_status(
        vaccination_id: str, 
        status: str,
        administered_date: datetime = None,
        notes: str = None
    ) -> bool:
        """Update vaccination status and details"""
        db = get_database()
        from bson import ObjectId
        
        update_data = {
            "status": status,
            "updated_at": datetime.utcnow()
        }
        
        if administered_date:
            update_data["administered_date"] = administered_date
        if notes:
            update_data["notes"] = notes
            
        try:
            result = await db.vaccinations.update_one(
                {"_id": ObjectId(vaccination_id)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except:
            return False
    
    @staticmethod
    async def get_vaccination_statistics(user_id: str) -> Dict[str, Any]:
        """Get vaccination statistics for user"""
        db = get_database()
        
        # Aggregate vaccination data
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {
                "_id": "$status",
                "count": {"$sum": 1}
            }}
        ]
        
        stats = {"completed": 0, "upcoming": 0, "overdue": 0, "scheduled": 0}
        
        async for result in db.vaccinations.aggregate(pipeline):
            stats[result["_id"]] = result["count"]
        
        # Calculate overdue count
        overdue_count = await db.vaccinations.count_documents({
            "user_id": user_id,
            "status": {"$ne": "completed"},
            "due_date": {"$lt": datetime.utcnow()}
        })
        
        stats["overdue"] = overdue_count
        stats["total"] = sum(stats.values())
        
        return stats


# ==================== Feedback Operations ====================
class FeedbackService:
    """User feedback database operations"""
    
    @staticmethod
    async def create_feedback(feedback_data: dict) -> Dict[str, Any]:
        """Create new feedback record"""
        from .models import UserFeedback
        feedback = UserFeedback(**feedback_data)
        db = get_database()
        feedback_dict = feedback.model_dump()
        result = await db.feedback.insert_one(feedback_dict)
        feedback_dict["_id"] = str(result.inserted_id)
        return feedback_dict
    
    @staticmethod
    async def get_user_feedback(
        user_id: str,
        limit: int = 20,
        skip: int = 0
    ) -> List[Dict[str, Any]]:
        """Get user's feedback history"""
        db = get_database()
        cursor = db.feedback.find(
            {"user_id": user_id}
        ).sort("submitted_at", -1).skip(skip).limit(limit)
        
        feedback_list = []
        async for feedback in cursor:
            feedback["_id"] = str(feedback["_id"])
            feedback_list.append(feedback)
        return feedback_list
    
    @staticmethod
    async def update_feedback_status(
        feedback_id: str,
        status: str,
        resolution_notes: str = None
    ) -> bool:
        """Update feedback status and resolution"""
        db = get_database()
        from bson import ObjectId
        
        update_data = {
            "status": status,
            "updated_at": datetime.utcnow()
        }
        
        if status == "resolved":
            update_data["resolved_at"] = datetime.utcnow()
        if resolution_notes:
            update_data["resolution_notes"] = resolution_notes
            
        try:
            result = await db.feedback.update_one(
                {"_id": ObjectId(feedback_id)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except:
            return False
    
    @staticmethod
    async def get_feedback_statistics() -> Dict[str, Any]:
        """Get overall feedback statistics"""
        db = get_database()
        
        # Aggregate feedback by status
        pipeline = [
            {"$group": {
                "_id": "$status",
                "count": {"$sum": 1}
            }}
        ]
        
        stats = {"pending": 0, "reviewed": 0, "in_progress": 0, "resolved": 0, "closed": 0}
        
        async for result in db.feedback.aggregate(pipeline):
            stats[result["_id"]] = result["count"]
        
        # Get average rating
        rating_pipeline = [
            {"$match": {"rating": {"$exists": True}}},
            {"$group": {
                "_id": None,
                "average_rating": {"$avg": "$rating"},
                "total_ratings": {"$sum": 1}
            }}
        ]
        
        rating_stats = {"average_rating": 0, "total_ratings": 0}
        async for result in db.feedback.aggregate(rating_pipeline):
            rating_stats = result
        
        stats.update(rating_stats)
        stats["total"] = sum([v for k, v in stats.items() if k not in ["average_rating", "total_ratings"]])
        
        return stats


# ==================== Community Feedback Operations ====================
class CommunityFeedbackService:
    """Community feedback and testimonials operations"""
    
    @staticmethod
    async def create_community_feedback(feedback_data: dict) -> Dict[str, Any]:
        """Create new community feedback"""
        from .models import CommunityFeedback
        feedback = CommunityFeedback(**feedback_data)
        db = get_database()
        feedback_dict = feedback.model_dump()
        result = await db.community_feedback.insert_one(feedback_dict)
        feedback_dict["_id"] = str(result.inserted_id)
        return feedback_dict
    
    @staticmethod
    async def get_approved_testimonials(
        limit: int = 10,
        featured_only: bool = False
    ) -> List[Dict[str, Any]]:
        """Get approved testimonials for public display"""
        db = get_database()
        
        query = {"is_approved": True}
        if featured_only:
            query["is_featured"] = True
            
        cursor = db.community_feedback.find(query).sort("approved_at", -1).limit(limit)
        
        testimonials = []
        async for testimonial in cursor:
            testimonial["_id"] = str(testimonial["_id"])
            testimonials.append(testimonial)
        return testimonials
    
    @staticmethod
    async def get_user_community_feedback(user_id: str) -> List[Dict[str, Any]]:
        """Get user's community feedback submissions"""
        db = get_database()
        cursor = db.community_feedback.find(
            {"user_id": user_id}
        ).sort("submitted_at", -1)
        
        feedback_list = []
        async for feedback in cursor:
            feedback["_id"] = str(feedback["_id"])
            feedback_list.append(feedback)
        return feedback_list
    
    @staticmethod
    async def vote_on_feedback(feedback_id: str, is_helpful: bool) -> bool:
        """Vote on community feedback"""
        db = get_database()
        from bson import ObjectId
        
        try:
            update_operation = {"$inc": {"total_votes": 1}}
            if is_helpful:
                update_operation["$inc"]["helpful_votes"] = 1
                
            result = await db.community_feedback.update_one(
                {"_id": ObjectId(feedback_id)},
                update_operation
            )
            return result.modified_count > 0
        except:
            return False

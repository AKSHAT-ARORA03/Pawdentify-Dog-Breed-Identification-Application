"""
Pydantic models for MongoDB collections
Data validation and schema definitions
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class DeviceType(str, Enum):
    """Device types for tracking"""
    MOBILE = "mobile"
    TABLET = "tablet"
    DESKTOP = "desktop"
    UNKNOWN = "unknown"


# ==================== User Model ====================
class User(BaseModel):
    """
    User model synchronized with Clerk authentication
    """
    clerk_user_id: str = Field(..., description="Unique Clerk user identifier")
    email: EmailStr = Field(..., description="User email address")
    username: Optional[str] = Field(None, description="Username")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: datetime = Field(default_factory=datetime.utcnow)
    
    # Profile information
    profile_image_url: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    
    # Statistics
    total_scans: int = Field(default=0, description="Total number of scans performed")
    favorite_breeds: List[str] = Field(default_factory=list, description="List of favorited breeds")
    
    # Subscription and features
    subscription_status: str = Field(default="free", description="Subscription tier: free, premium, pro")
    premium_features_access: bool = Field(default=False)
    
    class Config:
        json_schema_extra = {
            "example": {
                "clerk_user_id": "user_2abc123",
                "email": "john@example.com",
                "username": "john_doe",
                "total_scans": 15,
                "favorite_breeds": ["Golden_retriever", "German_shepherd"],
                "subscription_status": "free"
            }
        }


# ==================== Scan History Model ====================
class BreedPrediction(BaseModel):
    """Individual breed prediction with confidence"""
    breed_name: str
    confidence: float = Field(..., ge=0.0, le=1.0)


class ScanHistory(BaseModel):
    """
    Record of every dog breed identification scan
    """
    user_id: str = Field(..., description="Reference to user's Clerk ID")
    
    # Image information
    image_url: Optional[str] = Field(None, description="Stored image URL if saved")
    image_hash: Optional[str] = Field(None, description="Hash of the image for deduplication")
    
    # Prediction results
    predicted_breed: str = Field(..., description="Primary predicted breed")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Confidence of primary prediction")
    
    # Crossbreed information
    is_crossbreed: bool = Field(default=False, description="Flagged as potential crossbreed")
    secondary_breed: Optional[str] = Field(None, description="Secondary breed if crossbreed")
    top_predictions: List[BreedPrediction] = Field(default_factory=list, description="Top 5 predictions")
    
    # Metadata
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    device_type: DeviceType = Field(default=DeviceType.UNKNOWN)
    location: Optional[Dict[str, Any]] = Field(None, description="Optional location data")
    
    # User feedback
    user_feedback: Optional[str] = Field(None, description="User feedback: correct, incorrect, partially_correct")
    user_notes: Optional[str] = Field(None, description="User's notes or tags")
    user_confirmed_breed: Optional[str] = Field(None, description="If user corrects the prediction")
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_2abc123",
                "predicted_breed": "Golden_retriever",
                "confidence_score": 0.89,
                "is_crossbreed": False,
                "top_predictions": [
                    {"breed_name": "Golden_retriever", "confidence": 0.89},
                    {"breed_name": "Labrador_retriever", "confidence": 0.07}
                ],
                "user_feedback": "correct"
            }
        }


# ==================== Search History Model ====================
class SearchHistory(BaseModel):
    """
    Track breed searches in care guides section
    """
    user_id: str = Field(..., description="Reference to user's Clerk ID")
    
    # Search information
    breed_searched: str = Field(..., description="Breed name that was searched/viewed")
    search_query: str = Field(..., description="Actual text entered by user")
    
    # Interaction tracking
    search_timestamp: datetime = Field(default_factory=datetime.utcnow)
    time_spent_viewing: Optional[int] = Field(None, description="Time spent on page in seconds")
    sections_viewed: List[str] = Field(default_factory=list, description="Care sections opened")
    
    # Metadata
    device_type: DeviceType = Field(default=DeviceType.UNKNOWN)
    is_bookmarked: bool = Field(default=False)
    user_rating: Optional[int] = Field(None, ge=1, le=5, description="User rating 1-5")
    
    # Filters applied during search
    filters_applied: Optional[Dict[str, Any]] = Field(None, description="Search filters used")
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_2abc123",
                "breed_searched": "Golden_retriever",
                "search_query": "golden ret",
                "sections_viewed": ["Overview", "Health", "Nutrition"],
                "time_spent_viewing": 180,
                "is_bookmarked": True
            }
        }


# ==================== User Preferences Model ====================
class NotificationSettings(BaseModel):
    """Notification preferences"""
    email_notifications: bool = Field(default=True)
    scan_reminders: bool = Field(default=False)
    breed_updates: bool = Field(default=True)
    newsletter: bool = Field(default=False)


class PrivacySettings(BaseModel):
    """Privacy and data sharing preferences"""
    save_scan_history: bool = Field(default=True)
    save_search_history: bool = Field(default=True)
    allow_analytics: bool = Field(default=True)
    public_profile: bool = Field(default=False)


class UserPreferences(BaseModel):
    """
    User preferences and settings
    """
    user_id: str = Field(..., description="Reference to user's Clerk ID", unique=True)
    
    # Notification settings
    notifications: NotificationSettings = Field(default_factory=NotificationSettings)
    
    # Privacy settings
    privacy: PrivacySettings = Field(default_factory=PrivacySettings)
    
    # Display preferences
    preferred_language: str = Field(default="en", description="Language code")
    measurement_units: str = Field(default="imperial", description="imperial or metric")
    theme: str = Field(default="light", description="UI theme: light, dark, auto")
    
    # Content preferences
    favorite_breeds: List[str] = Field(default_factory=list)
    saved_comparisons: List[Dict[str, str]] = Field(default_factory=list, description="Saved breed comparisons")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_2abc123",
                "preferred_language": "en",
                "measurement_units": "imperial",
                "theme": "light",
                "notifications": {
                    "email_notifications": True,
                    "scan_reminders": False
                },
                "privacy": {
                    "save_scan_history": True,
                    "allow_analytics": True
                }
            }
        }

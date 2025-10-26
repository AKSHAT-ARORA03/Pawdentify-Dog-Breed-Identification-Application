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


class VaccinationStatus(str, Enum):
    """Vaccination status types"""
    COMPLETED = "completed"
    OVERDUE = "overdue"
    UPCOMING = "upcoming"
    SCHEDULED = "scheduled"


class FeedbackType(str, Enum):
    """User feedback types"""
    GENERAL = "general"
    BUG_REPORT = "bug_report"
    FEATURE_REQUEST = "feature_request"
    BREED_CORRECTION = "breed_correction"
    APP_REVIEW = "app_review"


class FeedbackStatus(str, Enum):
    """Feedback processing status"""
    PENDING = "pending"
    REVIEWED = "reviewed"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


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


# ==================== Pet Model ====================
class Pet(BaseModel):
    """
    Pet model for vaccination tracking and care management
    """
    user_id: str = Field(..., description="Reference to user's Clerk ID")
    
    # Basic pet information
    name: str = Field(..., description="Pet's name")
    breed: str = Field(..., description="Primary breed name")
    secondary_breed: Optional[str] = Field(None, description="Secondary breed if mixed")
    
    # Physical characteristics
    age_years: Optional[int] = Field(None, ge=0, le=30, description="Age in years")
    age_months: Optional[int] = Field(None, ge=0, le=11, description="Additional months")
    weight_lbs: Optional[float] = Field(None, gt=0, description="Weight in pounds")
    color: Optional[str] = Field(None, description="Primary color/markings")
    
    # Medical information
    microchip_id: Optional[str] = Field(None, description="Microchip identification")
    veterinarian_name: Optional[str] = Field(None, description="Primary veterinarian")
    veterinarian_contact: Optional[str] = Field(None, description="Vet contact information")
    
    # Special needs and notes
    allergies: List[str] = Field(default_factory=list, description="Known allergies")
    medical_conditions: List[str] = Field(default_factory=list, description="Ongoing medical conditions")
    special_notes: Optional[str] = Field(None, description="Additional care notes")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True, description="Active pet profile")
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_2abc123",
                "name": "Buddy",
                "breed": "Golden_retriever",
                "age_years": 3,
                "age_months": 6,
                "weight_lbs": 65.5,
                "color": "Golden",
                "veterinarian_name": "Dr. Smith",
                "allergies": ["chicken", "wheat"],
                "medical_conditions": []
            }
        }


# ==================== Vaccination Record Model ====================
class VaccinationRecord(BaseModel):
    """
    Individual vaccination record for pets
    """
    user_id: str = Field(..., description="Reference to user's Clerk ID")
    pet_id: str = Field(..., description="Reference to pet")
    
    # Vaccination details
    vaccine_name: str = Field(..., description="Name of the vaccine (e.g., 'Rabies', 'DHPP')")
    vaccine_type: str = Field(..., description="Type category (core, non-core, lifestyle)")
    manufacturer: Optional[str] = Field(None, description="Vaccine manufacturer")
    lot_number: Optional[str] = Field(None, description="Vaccine lot number")
    
    # Dates and scheduling
    administered_date: Optional[datetime] = Field(None, description="Date vaccine was given")
    due_date: datetime = Field(..., description="Date vaccine is due")
    next_due_date: Optional[datetime] = Field(None, description="Next scheduled date")
    
    # Status and tracking
    status: VaccinationStatus = Field(default=VaccinationStatus.UPCOMING)
    is_core_vaccine: bool = Field(default=True, description="Required vs optional vaccine")
    frequency_months: int = Field(default=12, description="How often vaccine is needed in months")
    
    # Administration details
    veterinarian_name: Optional[str] = Field(None, description="Administering veterinarian")
    clinic_name: Optional[str] = Field(None, description="Veterinary clinic")
    clinic_contact: Optional[str] = Field(None, description="Clinic contact information")
    
    # Reaction and notes
    adverse_reactions: Optional[str] = Field(None, description="Any adverse reactions noted")
    notes: Optional[str] = Field(None, description="Additional notes")
    
    # Reminders
    reminder_sent: bool = Field(default=False, description="Whether reminder has been sent")
    reminder_date: Optional[datetime] = Field(None, description="When to send reminder")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_2abc123",
                "pet_id": "pet_123",
                "vaccine_name": "Rabies",
                "vaccine_type": "core",
                "administered_date": "2024-01-15T10:00:00Z",
                "due_date": "2025-01-15T00:00:00Z",
                "status": "completed",
                "is_core_vaccine": True,
                "frequency_months": 36,
                "veterinarian_name": "Dr. Smith",
                "clinic_name": "Happy Paws Veterinary"
            }
        }


# ==================== User Feedback Model ====================
class UserFeedback(BaseModel):
    """
    User feedback and support requests
    """
    user_id: str = Field(..., description="Reference to user's Clerk ID")
    
    # Feedback content
    feedback_type: FeedbackType = Field(..., description="Type of feedback")
    subject: str = Field(..., description="Feedback subject/title")
    message: str = Field(..., description="Detailed feedback message")
    
    # Context information
    app_version: Optional[str] = Field(None, description="App version when feedback was given")
    device_type: DeviceType = Field(default=DeviceType.UNKNOWN)
    page_url: Optional[str] = Field(None, description="Page where feedback was submitted")
    scan_id: Optional[str] = Field(None, description="Related scan if applicable")
    
    # Breed correction specific
    predicted_breed: Optional[str] = Field(None, description="Original breed prediction")
    corrected_breed: Optional[str] = Field(None, description="User's correction")
    confidence_score: Optional[float] = Field(None, description="Original prediction confidence")
    
    # Priority and categorization
    priority: str = Field(default="medium", description="Priority level: low, medium, high, urgent")
    category: Optional[str] = Field(None, description="Internal categorization")
    tags: List[str] = Field(default_factory=list, description="Tags for organization")
    
    # Status tracking
    status: FeedbackStatus = Field(default=FeedbackStatus.PENDING)
    assigned_to: Optional[str] = Field(None, description="Staff member assigned")
    resolution_notes: Optional[str] = Field(None, description="Internal resolution notes")
    
    # User satisfaction
    rating: Optional[int] = Field(None, ge=1, le=5, description="User satisfaction rating 1-5")
    follow_up_requested: bool = Field(default=False, description="User requested follow-up")
    
    # Timestamps
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = Field(None, description="When feedback was resolved")
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_2abc123",
                "feedback_type": "breed_correction",
                "subject": "Incorrect breed identification",
                "message": "The app identified my dog as a Golden Retriever, but it's actually a Labrador Retriever mix.",
                "predicted_breed": "Golden_retriever",
                "corrected_breed": "Labrador_retriever",
                "confidence_score": 0.89,
                "priority": "medium",
                "status": "pending",
                "rating": 4
            }
        }


# ==================== Community Feedback Model ====================
class CommunityFeedback(BaseModel):
    """
    Community feedback and testimonials
    """
    user_id: str = Field(..., description="Reference to user's Clerk ID")
    
    # User information (for display)
    display_name: str = Field(..., description="Name to display publicly")
    user_location: Optional[str] = Field(None, description="General location (city, state)")
    
    # Feedback content
    title: str = Field(..., description="Feedback title")
    content: str = Field(..., description="Feedback content")
    rating: int = Field(..., ge=1, le=5, description="Overall app rating 1-5")
    
    # Experience details
    usage_duration: Optional[str] = Field(None, description="How long they've used the app")
    favorite_features: List[str] = Field(default_factory=list, description="Features they love")
    scan_count: Optional[int] = Field(None, description="Number of scans performed")
    
    # Moderation
    is_approved: bool = Field(default=False, description="Approved for public display")
    is_featured: bool = Field(default=False, description="Featured testimonial")
    moderated_by: Optional[str] = Field(None, description="Staff member who moderated")
    
    # Engagement
    helpful_votes: int = Field(default=0, description="Number of helpful votes")
    total_votes: int = Field(default=0, description="Total votes received")
    
    # Metadata
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    approved_at: Optional[datetime] = Field(None, description="When feedback was approved")
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_2abc123",
                "display_name": "Sarah M.",
                "user_location": "Denver, CO",
                "title": "Amazing accuracy for identifying my rescue dog!",
                "content": "I had no idea what breed my rescue dog was, and this app identified him perfectly as a Border Collie mix. The care guides have been incredibly helpful!",
                "rating": 5,
                "usage_duration": "6 months",
                "favorite_features": ["breed_identification", "care_guides", "vaccination_tracker"],
                "scan_count": 15,
                "is_approved": True,
                "helpful_votes": 12,
                "total_votes": 14
            }
        }

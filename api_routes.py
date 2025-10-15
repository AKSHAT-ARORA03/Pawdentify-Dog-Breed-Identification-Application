"""
Enhanced API endpoints with MongoDB integration
Extends the existing prediction API with database operations
"""
from fastapi import APIRouter, HTTPException, Depends, Header, Query
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

from database.services import (
    UserService,
    ScanHistoryService,
    SearchHistoryService,
    UserPreferencesService
)
from database.models import (
    User,
    ScanHistory,
    SearchHistory,
    UserPreferences,
    BreedPrediction,
    DeviceType
)

# Create API router
router = APIRouter(tags=["database"])


# ==================== Request/Response Models ====================
class UserCreateRequest(BaseModel):
    clerk_user_id: str
    email: str
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class ScanCreateRequest(BaseModel):
    predicted_breed: str
    confidence_score: float
    is_crossbreed: bool = False
    secondary_breed: Optional[str] = None
    top_predictions: List[BreedPrediction]
    image_hash: Optional[str] = None
    device_type: DeviceType = DeviceType.UNKNOWN


class SearchCreateRequest(BaseModel):
    breed_searched: str
    search_query: str
    device_type: DeviceType = DeviceType.UNKNOWN


class UserFeedbackRequest(BaseModel):
    user_id: str
    predicted_breed: str
    feedback_type: str  # 'correct', 'incorrect', 'partially_correct'
    is_crossbreed: bool = False
    crossbreed_analysis: Optional[dict] = None
    timestamp: datetime
    additional_comments: Optional[str] = None


class FeedbackRequest(BaseModel):
    feedback: str  # "correct", "incorrect", "partially_correct"
    confirmed_breed: Optional[str] = None


# ==================== Helper Functions ====================
async def get_current_user_id(
    x_user_id: Optional[str] = Header(None, alias="X-User-ID")
) -> str:
    """Extract user ID from headers"""
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    return x_user_id


# ==================== User Endpoints ====================
@router.post("/users", response_model=dict)
async def create_user(user_data: UserCreateRequest):
    """
    Create new user in database
    Called when user signs up via Clerk
    """
    try:
        # Check if user already exists
        existing_user = await UserService.get_user_by_clerk_id(user_data.clerk_user_id)
        if existing_user:
            return {"message": "User already exists", "user": existing_user}
        
        # Create new user
        user = User(
            clerk_user_id=user_data.clerk_user_id,
            email=user_data.email,
            username=user_data.username,
            first_name=user_data.first_name,
            last_name=user_data.last_name
        )
        
        created_user = await UserService.create_user(user)
        
        # Create default preferences
        default_prefs = UserPreferences(user_id=user_data.clerk_user_id)
        await UserPreferencesService.create_preferences(default_prefs)
        
        return {
            "message": "User created successfully",
            "user": created_user
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users/me", response_model=dict)
async def get_current_user(user_id: str = Depends(get_current_user_id)):
    """Get current user's profile"""
    try:
        user = await UserService.get_user_by_clerk_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/users/me", response_model=dict)
async def update_current_user(
    update_data: dict,
    user_id: str = Depends(get_current_user_id)
):
    """Update current user's profile"""
    try:
        success = await UserService.update_user(user_id, update_data)
        if not success:
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": "User updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/users/favorites/{breed_name}", response_model=dict)
async def add_favorite_breed(
    breed_name: str,
    user_id: str = Depends(get_current_user_id)
):
    """Add breed to user's favorites"""
    try:
        success = await UserService.add_favorite_breed(user_id, breed_name)
        return {
            "message": "Breed added to favorites" if success else "Already in favorites",
            "success": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/users/favorites/{breed_name}", response_model=dict)
async def remove_favorite_breed(
    breed_name: str,
    user_id: str = Depends(get_current_user_id)
):
    """Remove breed from user's favorites"""
    try:
        success = await UserService.remove_favorite_breed(user_id, breed_name)
        return {
            "message": "Breed removed from favorites" if success else "Not in favorites",
            "success": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Scan History Endpoints ====================
@router.post("/scans", response_model=dict)
async def create_scan(
    scan_data: ScanCreateRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Save scan result to database
    Called automatically after prediction
    """
    try:
        scan = ScanHistory(
            user_id=user_id,
            predicted_breed=scan_data.predicted_breed,
            confidence_score=scan_data.confidence_score,
            is_crossbreed=scan_data.is_crossbreed,
            secondary_breed=scan_data.secondary_breed,
            top_predictions=scan_data.top_predictions,
            image_hash=scan_data.image_hash,
            device_type=scan_data.device_type
        )
        
        created_scan = await ScanHistoryService.create_scan(scan)
        
        # Increment user's scan count
        await UserService.increment_scan_count(user_id)
        
        return {
            "message": "Scan saved successfully",
            "scan_id": created_scan["_id"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/scans", response_model=dict)
async def get_user_scans(
    limit: int = 50,
    skip: int = 0,
    user_id: str = Depends(get_current_user_id)
):
    """Get user's scan history with pagination"""
    try:
        scans = await ScanHistoryService.get_user_scans(user_id, limit, skip)
        return {
            "scans": scans,
            "count": len(scans),
            "limit": limit,
            "skip": skip
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/scans/statistics", response_model=dict)
async def get_scan_statistics(user_id: str = Depends(get_current_user_id)):
    """Get user's scan statistics"""
    try:
        stats = await ScanHistoryService.get_scan_statistics(user_id)
        breed_freq = await ScanHistoryService.get_breed_frequency(user_id)
        
        return {
            "total_scans": stats.get("total_scans", 0),
            "average_confidence": round(stats.get("avg_confidence", 0), 2),
            "crossbreed_count": stats.get("crossbreed_count", 0),
            "top_breeds": breed_freq
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/scans/{scan_id}/feedback", response_model=dict)
async def update_scan_feedback(
    scan_id: str,
    feedback_data: FeedbackRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Update user feedback on a scan"""
    try:
        success = await ScanHistoryService.update_scan_feedback(
            scan_id,
            feedback_data.feedback,
            feedback_data.confirmed_breed
        )
        if not success:
            raise HTTPException(status_code=404, detail="Scan not found")
        return {"message": "Feedback updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Search History Endpoints ====================
@router.post("/search-history", response_model=dict)
async def create_search(
    search_data: SearchCreateRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Save breed search to database"""
    try:
        search = SearchHistory(
            user_id=user_id,
            breed_searched=search_data.breed_searched,
            search_query=search_data.search_query,
            device_type=search_data.device_type
        )
        
        created_search = await SearchHistoryService.create_search(search)
        
        return {
            "message": "Search saved successfully",
            "search_id": created_search["_id"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search-history", response_model=dict)
async def get_user_searches(
    limit: int = 20,
    skip: int = 0,
    user_id: str = Depends(get_current_user_id)
):
    """Get user's search history"""
    try:
        searches = await SearchHistoryService.get_user_searches(user_id, limit, skip)
        return {
            "searches": searches,
            "count": len(searches),
            "limit": limit,
            "skip": skip
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search-history/recent", response_model=dict)
async def get_recent_searches(
    limit: int = 10,
    user_id: str = Depends(get_current_user_id)
):
    """Get recent unique breed searches"""
    try:
        recent = await SearchHistoryService.get_recent_searches(user_id, limit)
        return {"recent_searches": recent}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search-history/popular", response_model=dict)
async def get_popular_breeds(limit: int = 10):
    """Get most searched breeds globally"""
    try:
        popular = await SearchHistoryService.get_popular_breeds(limit)
        return {"popular_breeds": popular}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== User Preferences Endpoints ====================
@router.get("/preferences", response_model=dict)
async def get_user_preferences(user_id: str = Depends(get_current_user_id)):
    """Get user preferences"""
    try:
        prefs = await UserPreferencesService.get_preferences(user_id)
        if not prefs:
            # Create default preferences if not exists
            default_prefs = UserPreferences(user_id=user_id)
            prefs = await UserPreferencesService.create_preferences(default_prefs)
        return prefs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/preferences", response_model=dict)
async def update_user_preferences(
    update_data: dict,
    user_id: str = Depends(get_current_user_id)
):
    """Update user preferences"""
    try:
        success = await UserPreferencesService.update_preferences(user_id, update_data)
        return {
            "message": "Preferences updated successfully",
            "success": success
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Analytics Endpoints ====================
@router.get("/analytics/dashboard", response_model=dict)
async def get_analytics_dashboard(
    user_id: str = Depends(get_current_user_id),
    days: int = Query(default=30, description="Number of days to analyze")
):
    """
    Get comprehensive analytics dashboard data
    """
    try:
        from datetime import datetime, timedelta
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get scan statistics
        scan_stats = await ScanHistoryService.get_scan_statistics(user_id)
        scan_history = await ScanHistoryService.get_user_scans_with_dates(
            user_id, 
            limit=1000,
            start_date=start_date,
            end_date=end_date
        )
        
        # Get breed frequency
        breed_frequency = await ScanHistoryService.get_breed_frequency(user_id, limit=20)
        
        # Calculate daily scan data
        daily_scans = {}
        breed_distribution = {}
        confidence_levels = []
        hourly_usage = [0] * 24
        
        for scan in scan_history:
            # Daily aggregation
            scan_date = scan['timestamp'].date()
            daily_scans[scan_date] = daily_scans.get(scan_date, 0) + 1
            
            # Breed distribution
            breed = scan['predicted_breed']
            breed_distribution[breed] = breed_distribution.get(breed, 0) + 1
            
            # Confidence levels
            confidence_levels.append(scan['confidence_score'])
            
            # Hourly usage
            hour = scan['timestamp'].hour
            hourly_usage[hour] += 1
        
        # Calculate accuracy (if feedback available)
        accuracy_rate = scan_stats.get('accuracy_rate', 0.0)
        
        # Calculate streak
        streak_days = await calculate_scan_streak(user_id)
        
        # Monthly comparison
        this_month_scans = await get_monthly_scan_count(user_id, 0)  # Current month
        last_month_scans = await get_monthly_scan_count(user_id, 1)  # Previous month
        
        return {
            "overview": {
                "total_scans": scan_stats.get('total_scans', 0),
                "unique_breeds": len(breed_distribution),
                "accuracy_rate": accuracy_rate,
                "streak_days": streak_days,
                "this_month": this_month_scans,
                "last_month": last_month_scans,
                "growth_rate": calculate_growth_rate(this_month_scans, last_month_scans)
            },
            "charts": {
                "daily_scans": [
                    {"date": date.isoformat(), "scans": count}
                    for date, count in sorted(daily_scans.items())
                ],
                "breed_distribution": [
                    {"breed": breed, "count": count, "percentage": round(count / len(scan_history) * 100, 1)}
                    for breed, count in sorted(breed_distribution.items(), key=lambda x: x[1], reverse=True)[:10]
                ],
                "confidence_histogram": calculate_confidence_histogram(confidence_levels),
                "hourly_usage": [
                    {"hour": hour, "scans": count}
                    for hour, count in enumerate(hourly_usage)
                ]
            },
            "insights": {
                "most_active_hour": hourly_usage.index(max(hourly_usage)) if hourly_usage else 12,
                "favorite_breed": max(breed_distribution.items(), key=lambda x: x[1])[0] if breed_distribution else "None",
                "average_confidence": sum(confidence_levels) / len(confidence_levels) if confidence_levels else 0,
                "scan_frequency": len(scan_history) / days if days > 0 else 0
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/breeds", response_model=dict)
async def get_breed_analytics(
    user_id: str = Depends(get_current_user_id),
    breed_name: Optional[str] = Query(default=None, description="Specific breed to analyze")
):
    """
    Get detailed breed analytics
    """
    try:
        if breed_name:
            # Get analytics for specific breed
            breed_scans = await ScanHistoryService.get_scans_by_breed(user_id, breed_name)
            
            confidence_scores = [scan['confidence_score'] for scan in breed_scans]
            
            return {
                "breed": breed_name,
                "total_scans": len(breed_scans),
                "average_confidence": sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0,
                "highest_confidence": max(confidence_scores) if confidence_scores else 0,
                "lowest_confidence": min(confidence_scores) if confidence_scores else 0,
                "scan_timeline": [
                    {
                        "date": scan['timestamp'].isoformat(),
                        "confidence": scan['confidence_score'],
                        "is_crossbreed": scan.get('is_crossbreed', False)
                    }
                    for scan in breed_scans
                ],
                "crossbreed_percentage": sum(1 for scan in breed_scans if scan.get('is_crossbreed', False)) / len(breed_scans) * 100 if breed_scans else 0
            }
        else:
            # Get overview of all breeds
            breed_frequency = await ScanHistoryService.get_breed_frequency(user_id, limit=50)
            
            breed_analytics = []
            for breed_data in breed_frequency:
                breed = breed_data['breed']
                breed_scans = await ScanHistoryService.get_scans_by_breed(user_id, breed)
                confidence_scores = [scan['confidence_score'] for scan in breed_scans]
                
                breed_analytics.append({
                    "breed": breed,
                    "count": breed_data['count'],
                    "average_confidence": sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0,
                    "latest_scan": max(scan['timestamp'] for scan in breed_scans).isoformat() if breed_scans else None
                })
            
            return {
                "breed_analytics": breed_analytics,
                "total_unique_breeds": len(breed_analytics),
                "most_identified": breed_analytics[0]['breed'] if breed_analytics else "None"
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/trends", response_model=dict)
async def get_analytics_trends(
    user_id: str = Depends(get_current_user_id),
    period: str = Query(default="weekly", description="Trend period: daily, weekly, monthly")
):
    """
    Get trend analysis data
    """
    try:
        from datetime import datetime, timedelta
        
        # Get scan history for trend analysis
        scan_history = await ScanHistoryService.get_user_scans_with_dates(user_id, limit=1000)
        
        if period == "daily":
            # Last 30 days daily trends
            trends = await calculate_daily_trends(scan_history, 30)
        elif period == "weekly":
            # Last 12 weeks weekly trends
            trends = await calculate_weekly_trends(scan_history, 12)
        else:  # monthly
            # Last 12 months monthly trends
            trends = await calculate_monthly_trends(scan_history, 12)
        
        return {
            "period": period,
            "trends": trends,
            "growth_metrics": {
                "current_period": trends[-1]['scans'] if trends else 0,
                "previous_period": trends[-2]['scans'] if len(trends) > 1 else 0,
                "trend_direction": calculate_trend_direction(trends),
                "peak_period": max(trends, key=lambda x: x['scans']) if trends else None
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analytics/export", response_model=dict)
async def export_analytics_data(
    user_id: str = Depends(get_current_user_id),
    format: str = Query(default="csv", description="Export format: csv, json"),
    data_type: str = Query(default="all", description="Data type: all, scans, breeds, trends")
):
    """
    Export analytics data in various formats
    """
    try:
        from io import StringIO
        import csv
        import json
        
        export_data = {}
        
        if data_type in ["all", "scans"]:
            scan_history = await ScanHistoryService.get_user_scans_with_dates(user_id, limit=1000)
            export_data["scans"] = [
                {
                    "timestamp": scan['timestamp'].isoformat(),
                    "breed": scan['predicted_breed'],
                    "confidence": scan['confidence_score'],
                    "is_crossbreed": scan.get('is_crossbreed', False)
                }
                for scan in scan_history
            ]
        
        if data_type in ["all", "breeds"]:
            breed_frequency = await ScanHistoryService.get_breed_frequency(user_id, limit=100)
            export_data["breeds"] = breed_frequency
        
        if data_type in ["all", "trends"]:
            trends = await calculate_weekly_trends(
                await ScanHistoryService.get_user_scans_with_dates(user_id, limit=1000), 
                12
            )
            export_data["trends"] = trends
        
        if format == "csv":
            # Convert to CSV format
            csv_data = {}
            for key, data in export_data.items():
                output = StringIO()
                if data:
                    writer = csv.DictWriter(output, fieldnames=data[0].keys())
                    writer.writeheader()
                    writer.writerows(data)
                csv_data[key] = output.getvalue()
                output.close()
            
            return {
                "format": "csv",
                "data": csv_data,
                "download_url": f"/api/analytics/download/{user_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
            }
        else:
            return {
                "format": "json",
                "data": export_data,
                "download_url": f"/api/analytics/download/{user_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Helper functions for analytics calculations
async def calculate_scan_streak(user_id: str) -> int:
    """Calculate consecutive days with scans"""
    try:
        from datetime import datetime, timedelta
        
        # Get recent scans grouped by date
        recent_scans = await ScanHistoryService.get_user_scans_with_dates(user_id, limit=100)
        
        if not recent_scans:
            return 0
        
        # Group scans by date
        scan_dates = set()
        for scan in recent_scans:
            scan_dates.add(scan['timestamp'].date())
        
        # Calculate streak from today backwards
        streak = 0
        current_date = datetime.utcnow().date()
        
        while current_date in scan_dates:
            streak += 1
            current_date -= timedelta(days=1)
        
        return streak
        
    except Exception:
        return 0


async def get_monthly_scan_count(user_id: str, months_ago: int) -> int:
    """Get scan count for a specific month"""
    try:
        from datetime import datetime, timedelta
        from calendar import monthrange
        
        # Calculate target month
        today = datetime.utcnow()
        target_date = today.replace(day=1) - timedelta(days=30 * months_ago)
        target_month = target_date.month
        target_year = target_date.year
        
        # Get first and last day of target month
        first_day = datetime(target_year, target_month, 1)
        last_day_num = monthrange(target_year, target_month)[1]
        last_day = datetime(target_year, target_month, last_day_num, 23, 59, 59)
        
        # Count scans in that month
        monthly_scans = await ScanHistoryService.get_user_scans_with_dates(
            user_id,
            start_date=first_day,
            end_date=last_day
        )
        
        return len(monthly_scans)
        
    except Exception:
        return 0


def calculate_growth_rate(current: int, previous: int) -> float:
    """Calculate growth rate percentage"""
    if previous == 0:
        return 100.0 if current > 0 else 0.0
    return round(((current - previous) / previous) * 100, 1)


def calculate_confidence_histogram(confidence_levels: list) -> list:
    """Calculate confidence score distribution"""
    if not confidence_levels:
        return []
    
    # Create bins for confidence levels
    bins = [0.0, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    histogram = [0] * (len(bins) - 1)
    
    for confidence in confidence_levels:
        for i in range(len(bins) - 1):
            if bins[i] <= confidence < bins[i + 1] or (i == len(bins) - 2 and confidence == 1.0):
                histogram[i] += 1
                break
    
    return [
        {"range": f"{bins[i]:.1f}-{bins[i+1]:.1f}", "count": histogram[i]}
        for i in range(len(histogram))
    ]


async def calculate_daily_trends(scan_history: list, days: int) -> list:
    """Calculate daily scan trends"""
    from datetime import datetime, timedelta
    
    # Create daily aggregation
    daily_counts = {}
    end_date = datetime.utcnow().date()
    
    # Initialize all days with 0
    for i in range(days):
        date = end_date - timedelta(days=i)
        daily_counts[date] = 0
    
    # Count scans per day
    for scan in scan_history:
        scan_date = scan['timestamp'].date()
        if scan_date in daily_counts:
            daily_counts[scan_date] += 1
    
    return [
        {"date": date.isoformat(), "scans": count}
        for date, count in sorted(daily_counts.items())
    ]


async def calculate_weekly_trends(scan_history: list, weeks: int) -> list:
    """Calculate weekly scan trends"""
    from datetime import datetime, timedelta
    
    weekly_counts = {}
    end_date = datetime.utcnow().date()
    
    # Initialize weeks
    for i in range(weeks):
        week_start = end_date - timedelta(days=end_date.weekday() + (i * 7))
        weekly_counts[week_start] = 0
    
    # Count scans per week
    for scan in scan_history:
        scan_date = scan['timestamp'].date()
        week_start = scan_date - timedelta(days=scan_date.weekday())
        
        if week_start in weekly_counts:
            weekly_counts[week_start] += 1
    
    return [
        {"week_start": date.isoformat(), "scans": count}
        for date, count in sorted(weekly_counts.items())
    ]


async def calculate_monthly_trends(scan_history: list, months: int) -> list:
    """Calculate monthly scan trends"""
    from datetime import datetime
    from calendar import monthrange
    
    monthly_counts = {}
    current_date = datetime.utcnow()
    
    # Initialize months
    for i in range(months):
        if current_date.month - i <= 0:
            target_month = current_date.month - i + 12
            target_year = current_date.year - 1
        else:
            target_month = current_date.month - i
            target_year = current_date.year
        
        month_key = f"{target_year}-{target_month:02d}"
        monthly_counts[month_key] = 0
    
    # Count scans per month
    for scan in scan_history:
        month_key = scan['timestamp'].strftime("%Y-%m")
        if month_key in monthly_counts:
            monthly_counts[month_key] += 1
    
    return [
        {"month": month, "scans": count}
        for month, count in sorted(monthly_counts.items())
    ]


def calculate_trend_direction(trends: list) -> str:
    """Calculate overall trend direction"""
    if len(trends) < 2:
        return "stable"
    
    recent_trends = trends[-3:]  # Last 3 periods
    if len(recent_trends) < 2:
        return "stable"
    
    increases = 0
    decreases = 0
    
    for i in range(1, len(recent_trends)):
        current_scans = recent_trends[i].get('scans', 0)
        previous_scans = recent_trends[i-1].get('scans', 0)
        
        if current_scans > previous_scans:
            increases += 1
        elif current_scans < previous_scans:
            decreases += 1
    
    if increases > decreases:
        return "increasing"
    elif decreases > increases:
        return "decreasing"
    else:
        return "stable"


# ==================== Dashboard Data Endpoint ====================
@router.get("/dashboard", response_model=dict)
async def get_dashboard_data(user_id: str = Depends(get_current_user_id)):
    """
    Get comprehensive dashboard data for user
    Combines scan stats, recent activity, favorites
    """
    try:
        # Get user profile
        user = await UserService.get_user_by_clerk_id(user_id)
        
        # Get scan statistics
        scan_stats = await ScanHistoryService.get_scan_statistics(user_id)
        breed_freq = await ScanHistoryService.get_breed_frequency(user_id, limit=5)
        
        # Get recent scans
        recent_scans = await ScanHistoryService.get_user_scans(user_id, limit=10)
        
        # Get recent searches
        recent_searches = await SearchHistoryService.get_recent_searches(user_id, limit=5)
        
        return {
            "user": {
                "username": user.get("username") if user else "Unknown",
                "email": user.get("email") if user else "",
                "total_scans": user.get("total_scans", 0) if user else 0,
                "favorite_breeds": user.get("favorite_breeds", []) if user else [],
                "subscription_status": user.get("subscription_status", "free") if user else "free"
            },
            "scan_statistics": {
                "total_scans": scan_stats.get("total_scans", 0),
                "average_confidence": round(scan_stats.get("avg_confidence", 0), 2),
                "crossbreed_count": scan_stats.get("crossbreed_count", 0),
                "top_breeds": breed_freq
            },
            "recent_activity": {
                "recent_scans": recent_scans[:5],  # Last 5 scans
                "recent_searches": recent_searches
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== User Feedback Endpoint ====================
@router.post("/scan-feedback", response_model=dict)
async def submit_scan_feedback(feedback: UserFeedbackRequest):
    """
    Submit user feedback for scan predictions
    This data is used to improve the AI model
    """
    try:
        # For now, we'll log the feedback and potentially store it
        # In the future, this could feed into model retraining
        
        feedback_data = {
            "user_id": feedback.user_id,
            "predicted_breed": feedback.predicted_breed,
            "feedback_type": feedback.feedback_type,
            "is_crossbreed": feedback.is_crossbreed,
            "crossbreed_analysis": feedback.crossbreed_analysis,
            "timestamp": feedback.timestamp,
            "additional_comments": feedback.additional_comments
        }
        
        # Log feedback for analysis (could be stored in a feedback collection)
        print(f"📝 User Feedback Received: {feedback_data}")
        
        # TODO: Store in feedback collection for model improvement
        # await FeedbackService.store_feedback(feedback_data)
        
        return {
            "message": "Feedback submitted successfully",
            "feedback_id": f"fb_{int(feedback.timestamp.timestamp())}",
            "status": "received"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

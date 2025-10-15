"""
Database package for Pawdentify
Handles MongoDB connections and operations
"""
from .connection import get_database, close_database_connection
from .models import User, ScanHistory, SearchHistory, UserPreferences

__all__ = [
    "get_database",
    "close_database_connection",
    "User",
    "ScanHistory",
    "SearchHistory",
    "UserPreferences",
]

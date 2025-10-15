"""
MongoDB connection configuration
Handles database connection lifecycle
"""
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.server_api import ServerApi
import os
from typing import Optional

# Global database client
_client: Optional[AsyncIOMotorClient] = None
_database = None


def get_database():
    """
    Get MongoDB database instance
    Creates connection if not exists
    """
    global _client, _database
    
    if _database is not None:
        return _database
    
    # Get MongoDB URI from environment variables
    mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
    database_name = os.getenv("DATABASE_NAME", "pawdentify")
    
    try:
        # Create MongoDB client
        _client = AsyncIOMotorClient(
            mongodb_uri,
            server_api=ServerApi('1'),
            maxPoolSize=10,
            minPoolSize=1,
            maxIdleTimeMS=45000,
        )
        
        # Get database
        _database = _client[database_name]
        
        print(f"✅ Connected to MongoDB database: {database_name}")
        return _database
        
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {str(e)}")
        raise


async def close_database_connection():
    """
    Close MongoDB connection
    """
    global _client, _database
    
    if _client is not None:
        _client.close()
        _client = None
        _database = None
        print("🔌 MongoDB connection closed")


async def ping_database():
    """
    Test database connectivity
    """
    try:
        db = get_database()
        await db.command("ping")
        print("✅ MongoDB connection successful!")
        return True
    except Exception as e:
        print(f"❌ MongoDB ping failed: {str(e)}")
        return False


async def create_indexes():
    """
    Create database indexes for optimized queries
    """
    db = get_database()
    
    # Users collection indexes
    await db.users.create_index("clerk_user_id", unique=True)
    await db.users.create_index("email")
    await db.users.create_index("created_at")
    
    # Scan history indexes
    await db.scan_history.create_index("user_id")
    await db.scan_history.create_index("timestamp")
    await db.scan_history.create_index([("user_id", 1), ("timestamp", -1)])
    await db.scan_history.create_index("predicted_breed")
    
    # Search history indexes
    await db.search_history.create_index("user_id")
    await db.search_history.create_index("search_timestamp")
    await db.search_history.create_index([("user_id", 1), ("search_timestamp", -1)])
    await db.search_history.create_index("breed_searched")
    
    # User preferences indexes
    await db.user_preferences.create_index("user_id", unique=True)
    
    print("✅ Database indexes created successfully")

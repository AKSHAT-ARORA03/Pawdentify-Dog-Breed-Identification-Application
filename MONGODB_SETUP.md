# MongoDB Integration Guide for Pawdentify

## Overview
This document provides comprehensive instructions for setting up and using the MongoDB database integration in Pawdentify.

## Features Added
- ✅ User profile management synchronized with Clerk
- ✅ Scan history tracking with crossbreed detection
- ✅ Search history for care guides
- ✅ User preferences and settings
- ✅ Dashboard statistics and analytics
- ✅ Favorites and bookmarks system

## Installation

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- `motor` - Async MongoDB driver
- `pymongo` - MongoDB Python driver
- `pydantic` - Data validation
- `python-dotenv` - Environment variable management

### 2. MongoDB Setup Options

#### Option A: Local MongoDB (Development)

1. **Download and Install MongoDB**
   - Visit: https://www.mongodb.com/try/download/community
   - Install MongoDB Community Edition
   - Start MongoDB service:
     ```bash
     # Windows
     net start MongoDB
     
     # Mac (with Homebrew)
     brew services start mongodb-community
     
     # Linux
     sudo systemctl start mongod
     ```

2. **Set Environment Variables**
   ```bash
   MONGODB_URI=mongodb://localhost:27017/
   DATABASE_NAME=pawdentify
   ```

#### Option B: MongoDB Atlas (Cloud - Recommended for Production)

1. **Create Free MongoDB Atlas Account**
   - Visit: https://www.mongodb.com/cloud/atlas/register
   - Create a new cluster (Free M0 tier available)

2. **Configure Network Access**
   - Go to Network Access
   - Add your IP address or allow access from anywhere (0.0.0.0/0) for development

3. **Create Database User**
   - Go to Database Access
   - Create a new database user with username and password

4. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

5. **Set Environment Variables**
   ```bash
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   DATABASE_NAME=pawdentify
   ```

### 3. Environment Configuration

Create a `.env` file in the project root (copy from `.env.example`):

```bash
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/
DATABASE_NAME=pawdentify

# Existing Clerk Configuration
CLERK_PUBLISHABLE_KEY=your_clerk_key_here

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
```

## Database Schema

### Collections

1. **users**
   - Stores user profiles synchronized with Clerk
   - Fields: clerk_user_id, email, username, total_scans, favorite_breeds

2. **scan_history**
   - Records every dog breed identification
   - Fields: user_id, predicted_breed, confidence_score, is_crossbreed, top_predictions

3. **search_history**
   - Tracks breed searches in care guides
   - Fields: user_id, breed_searched, search_query, sections_viewed

4. **user_preferences**
   - User settings and preferences
   - Fields: user_id, notifications, privacy, theme, language

## API Endpoints

### User Management
- `POST /api/users` - Create new user
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `POST /api/users/favorites/{breed_name}` - Add favorite breed
- `DELETE /api/users/favorites/{breed_name}` - Remove favorite breed

### Scan History
- `POST /api/scans` - Save scan result
- `GET /api/scans` - Get user's scan history
- `GET /api/scans/statistics` - Get scan statistics
- `PUT /api/scans/{scan_id}/feedback` - Update scan feedback

### Search History
- `POST /api/search-history` - Save breed search
- `GET /api/search-history` - Get user's search history
- `GET /api/search-history/recent` - Get recent searches
- `GET /api/search-history/popular` - Get popular breeds

### Preferences
- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update preferences

### Dashboard
- `GET /api/dashboard` - Get comprehensive dashboard data

## Testing the Database

### 1. Test Connection

```python
from database.connection import ping_database
import asyncio

asyncio.run(ping_database())
```

### 2. Create Indexes

```python
from database.connection import create_indexes
import asyncio

asyncio.run(create_indexes())
```

### 3. Test User Creation

```python
from database.services import UserService
from database.models import User
import asyncio

async def test_user():
    user = User(
        clerk_user_id="test_user_123",
        email="test@example.com",
        username="testuser"
    )
    created = await UserService.create_user(user)
    print(f"Created user: {created}")

asyncio.run(test_user())
```

## Integration with Existing Code

The MongoDB integration is designed to work alongside your existing code without breaking changes:

1. **Automatic Scan Saving**: The `/predict` endpoint will be enhanced to automatically save scan results
2. **Dashboard Data**: Dashboard will fetch real statistics from MongoDB
3. **Search Tracking**: Care guides will track searches automatically
4. **User Sync**: New Clerk users will be automatically created in MongoDB

## Security Considerations

1. **Connection String**: Never commit `.env` file with real credentials
2. **User Authentication**: All endpoints require user authentication via headers
3. **Data Encryption**: Use MongoDB Atlas encryption at rest
4. **Rate Limiting**: Implement rate limiting on API endpoints
5. **Input Validation**: All inputs validated with Pydantic models

## Monitoring and Maintenance

### View Database Contents

Using MongoDB Compass (GUI):
1. Download: https://www.mongodb.com/products/compass
2. Connect using your MONGODB_URI
3. Browse collections and documents

Using MongoDB Shell:
```bash
# Connect
mongosh "your_connection_string"

# List databases
show dbs

# Use pawdentify database
use pawdentify

# Show collections
show collections

# Query users
db.users.find()

# Query scan history
db.scan_history.find().limit(10)
```

### Backup and Restore

```bash
# Backup
mongodump --uri="your_connection_string" --out=./backup

# Restore
mongorestore --uri="your_connection_string" ./backup
```

## Performance Optimization

1. **Indexes**: Automatically created on frequently queried fields
2. **Connection Pooling**: Configured for optimal performance
3. **Pagination**: All list endpoints support limit/skip pagination
4. **Aggregation**: Complex queries use MongoDB aggregation pipeline

## Troubleshooting

### Connection Issues
```
Error: Failed to connect to MongoDB
```
**Solution**: Check MONGODB_URI in .env file, ensure MongoDB is running

### Authentication Failed
```
Error: Authentication failed
```
**Solution**: Verify username/password in connection string

### Database Not Found
```
Error: Database 'pawdentify' not found
```
**Solution**: Database will be created automatically on first write operation

## Next Steps

After MongoDB setup:
1. ✅ Phase 1: Database setup - COMPLETE
2. ⏭️ Phase 2: Integrate with existing endpoints
3. ⏭️ Phase 3: Add crossbreed detection
4. ⏭️ Phase 4: Enhanced care guides with search
5. ⏭️ Phase 5: Testing and optimization

## Support

For issues or questions:
- MongoDB Docs: https://docs.mongodb.com/
- Motor (Async Driver) Docs: https://motor.readthedocs.io/
- Pydantic Docs: https://docs.pydantic.dev/

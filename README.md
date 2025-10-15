# 🐕 Pawdentify - AI-Powered Dog Breed Identification & Care Platform

<div align="center">

[![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688.svg)](https://fastapi.tiangolo.com/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-orange.svg)](https://tensorflow.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-latest-green.svg)](https://mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3.0-blue.svg)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Advanced AI-powered dog breed identification platform with comprehensive care guides, user authentication, and intelligent search capabilities.**

[🚀 Quick Start](#-quick-start) • [✨ Features](#-features) • [🏗️ Architecture](#️-architecture) • [📊 Model Details](#-model-details) • [🔧 Installation](#-installation)

</div>

## 🎯 Project Overview

Pawdentify is a full-stack web application that combines cutting-edge AI technology with comprehensive pet care information. Users can upload photos of dogs to get instant breed identification, explore detailed care guides for 120+ dog breeds, and access personalized recommendations.

## ✨ Key Features

- **🤖 AI Breed Identification**: TensorFlow-powered model with 95%+ accuracy for 120+ dog breeds
- **🔍 Advanced Breed Search**: Fuzzy search with autocomplete and intelligent filtering
- **📚 Comprehensive Care Guides**: Expert-verified health, nutrition, exercise, grooming, and training information
- **👤 User Authentication**: Secure authentication with Clerk integration
- **💾 Data Persistence**: MongoDB integration for user data, scan history, and preferences
- **📊 Analytics Dashboard**: User engagement tracking and personalized insights
- **🎨 Modern UI/UX**: Responsive design with smooth animations and intuitive navigation

## 📋 Table of Contents

- [🏗️ Architecture](#️-architecture)
- [📊 Model Details](#-model-details)
- [🚀 Quick Start](#-quick-start)
- [🔧 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [📁 Project Structure](#-project-structure)
- [🌐 API Documentation](#-api-documentation)
- [🧪 Testing](#-testing)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🏗️ Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with TypeScript support
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system
- **Routing**: React Router for client-side navigation
- **Authentication**: Clerk React SDK for secure user management
- **Animations**: Framer Motion for smooth UI transitions
- **State Management**: React Context for global state

### Backend (FastAPI)
- **Framework**: FastAPI for high-performance async API
- **AI/ML**: TensorFlow for breed identification model
- **Database**: MongoDB with Motor async driver
- **Authentication**: Clerk webhook integration
- **File Processing**: PIL for image preprocessing
- **API Documentation**: Auto-generated OpenAPI/Swagger docs

### Database (MongoDB)
- **Collections**: Users, ScanHistory, SearchHistory, UserPreferences
- **Indexing**: Optimized queries with compound indexes
- **Schema**: Pydantic models for data validation
- **Connection**: Motor AsyncIOMotorClient for async operations

## 📊 Model Details

### Custom Machine Learning Model

This project features a **custom-trained Keras model** built specifically for dog breed recognition:

#### 🧠 Model Architecture
- **Base Architecture**: EfficientNetV2 (state-of-the-art CNN)
- **Classes**: 120 distinct dog breeds
- **Input Shape**: 300x300x3 RGB images
- **Final Layer**: Dense layer with softmax activation
- **Parameters**: ~21M trainable parameters

#### 📊 Training Details
- **Datasets Used**:
  - Kaggle Dog Breed Dataset (Primary training data)
  - Stanford Dogs Dataset (Additional breed samples)
  - Custom Curated Images (Hand-selected high-quality images)
  - Data Augmentation (Rotation, scaling, color adjustment)

- **Training Strategy**:
  - Transfer learning from ImageNet pretrained EfficientNetV2
  - Fine-tuning with frozen base layers initially
  - Gradual unfreezing for optimal performance
  - Custom data preprocessing pipeline

#### 🎯 Performance Metrics
- **Top-1 Accuracy**: ~85% on validation set
- **Top-5 Accuracy**: ~96% on validation set
- **Inference Time**: <200ms per image
- **Model Size**: ~84MB optimized for deployment

#### 🔬 Advanced Features
- **Crossbreed Detection**: Custom algorithm analyzing confidence distributions
- **Uncertainty Quantification**: Confidence scores for prediction reliability
- **Top-K Predictions**: Multiple breed suggestions with probabilities
- **Preprocessing Pipeline**: Optimized image normalization and resizing

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ with npm
- **Python** 3.11+ with pip
- **MongoDB** (local installation or MongoDB Atlas)
- **Git** for version control

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/pawdentify.git
cd pawdentify
```

### 2. Backend Setup
```bash
# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Clerk keys
```

### 4. Database Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB locally
# Start MongoDB service
mongod --dbpath /path/to/data
```

#### Option B: MongoDB Atlas (Recommended)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get connection string and update `MONGODB_URI` in `.env`

### 5. Authentication Setup
1. Create account at [Clerk](https://clerk.dev)
2. Create a new application
3. Get publishable key and add to `.env` files
4. Configure webhooks for user synchronization

### 6. Run the Application
```bash
# Terminal 1: Start Backend
cd /path/to/pawdentify
.venv\Scripts\activate
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8001

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

Visit `http://localhost:5174` to access the application!

## 🔧 Installation

### Detailed Backend Installation

1. **Python Environment Setup**
   ```bash
   # Ensure Python 3.11+
   python --version
   
   # Create virtual environment
   python -m venv .venv
   
   # Activate (Windows)
   .venv\Scripts\activate
   
   # Activate (macOS/Linux)
   source .venv/bin/activate
   ```

2. **Install Python Dependencies**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

3. **Model Setup**
   - The trained model (`final_model.keras`) should be in the `model/` directory
   - Class indices are loaded from `model/class_indices.json`
   - Model is automatically loaded on server startup

### Detailed Frontend Installation

1. **Node.js Setup**
   ```bash
   # Check Node version (18+ required)
   node --version
   npm --version
   ```

2. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Build for Production (Optional)**
   ```bash
   npm run build
   npm run preview
   ```

## ⚙️ Configuration

### Environment Variables

#### Backend (.env)
```bash
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
DATABASE_NAME=pawdentify

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_...

# API Configuration
API_HOST=127.0.0.1
API_PORT=8001

# Security
SECRET_KEY=your-secure-secret-key

# Environment
ENVIRONMENT=development
DEBUG=True
```

#### Frontend (.env)
```bash
# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# API Configuration
VITE_API_BASE=http://127.0.0.1:8001

# Feature Flags
VITE_ENABLE_USER_SYNC=true
VITE_ENABLE_SCAN_HISTORY=true
VITE_ENABLE_BREED_SEARCH=true
VITE_ENABLE_ANALYTICS=true

# Development
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=info
```

## 📁 Project Structure

```
Pawdentify/
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   │   ├── BreedCareGuides.jsx
│   │   │   ├── BreedDetailPage.jsx
│   │   │   ├── BreedSearchComponent.jsx
│   │   │   ├── CrossbreedAnalysis.jsx
│   │   │   └── ...
│   │   ├── pages/              # Page components
│   │   ├── services/           # API service layer
│   │   ├── auth/               # Authentication context
│   │   ├── enhancedBreedDatabase.js  # Comprehensive breed data
│   │   └── styles.css          # Global styles
│   ├── package.json
│   └── vite.config.js
├── backend/                    # FastAPI backend
│   ├── database/               # Database layer
│   │   ├── connection.py       # MongoDB connection
│   │   ├── models.py           # Pydantic models
│   │   └── services.py         # Database operations
│   ├── model/                  # AI model files
│   │   ├── final_model.keras   # TensorFlow model
│   │   └── class_indices.json  # Breed class mapping
│   ├── static/                 # Static files
│   ├── main.py                 # FastAPI application
│   ├── api_routes.py           # API endpoints
│   └── requirements.txt        # Python dependencies
├── .env                        # Environment variables
└── README.md                   # Project documentation
```

## 🌐 API Documentation

### FastAPI Interactive Docs
Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8001/docs`
- **ReDoc**: `http://localhost:8001/redoc`

### Core Endpoints

#### Breed Prediction
```http
POST /predict
Content-Type: multipart/form-data

Parameters:
- file: Image file (JPEG, PNG)
- user_id: Optional user identifier

Response:
{
  "predicted_class": "string",
  "confidence": "float",
  "is_potential_crossbreed": "boolean",
  "top_predictions": [...],
  "crossbreed_analysis": {...},
  "timestamp": "ISO string"
}
```

#### User Management
```http
GET    /api/users/{user_id}          # Get user profile
POST   /api/users                    # Create user
PUT    /api/users/{user_id}          # Update user
DELETE /api/users/{user_id}          # Delete user
```

#### Scan History
```http
GET    /api/scan-history             # Get scan history
POST   /api/scan-history             # Create scan record
GET    /api/scan-history/{scan_id}   # Get specific scan
```

#### Analytics
```http
GET    /api/analytics/user/{user_id} # User analytics
GET    /api/analytics/breeds         # Breed statistics
GET    /api/analytics/trends         # Usage trends
```

## 🧪 Testing

### Backend Testing
```bash
# Activate virtual environment
.venv\Scripts\activate

# Run tests
pytest tests/         # All tests
pytest tests/test_api.py  # Specific test file
pytest --cov=.        # With coverage
```

### Frontend Testing
```bash
cd frontend
npm run test          # Run unit tests
npm run test:coverage # Run with coverage
npm run test:e2e      # End-to-end tests
```

### Manual Testing Checklist
- [ ] Breed identification with various dog images
- [ ] User registration and authentication flow
- [ ] Search functionality with different queries
- [ ] Breed detail page navigation
- [ ] Mobile responsiveness
- [ ] Database operations (CRUD)
- [ ] Error handling and edge cases

## 🚀 Deployment

### 🤖 AI Model Availability
The trained model file (`final_model.keras` - 119MB) is available from multiple sources:

**📥 Download Sources:**
1. **GitHub Releases**: [Download v1.0](https://github.com/AKSHAT-ARORA03/PAWDENTIFY-AI-Powered-Dog-Breed-Recognition-System/releases/download/v1.0/final_model.keras)
2. **Google Drive**: [Direct Download](https://drive.google.com/uc?export=download&id=101KghIYW90c6VFpNGWFW_TM4jjivLHJe)

**🚀 Automatic Deployment:**
- ✅ Backend automatically downloads model during startup
- ✅ No manual model upload required for deployment
- ✅ Multiple fallback download sources configured
- ✅ Creates dummy model for testing if all downloads fail

### Backend Deployment (Render/Railway)
```bash
# Install railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway add mongodb
railway deploy
```

### Frontend Deployment (Vercel/Netlify)
```bash
# Build for production
npm run build

# Deploy to Vercel
npm install -g vercel
vercel --prod

# Or deploy to Netlify
npm install -g netlify-cli
netlify deploy --prod
```

### Environment Configuration
```bash
# Production environment variables
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
CLERK_SECRET_KEY=sk_live_...
API_BASE_URL=https://your-api-domain.com
```

## 🛠️ Development Workflow

### Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature
git commit -m "feat: add new feature"
git push origin feature/new-feature
# Create pull request for review
```

### Code Style
```bash
# Frontend
npm run lint          # ESLint
npm run format        # Prettier

# Backend
black .               # Code formatting
flake8 .              # Linting
mypy .                # Type checking
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Standards
- Follow ESLint/Prettier for frontend
- Follow PEP 8 for backend Python code
- Write meaningful commit messages
- Add JSDoc/docstrings for functions
- Maintain test coverage above 80%

### Issue Reporting
- Use GitHub Issues for bug reports
- Include reproduction steps
- Provide browser/environment details
- Add screenshots for UI issues

## 📚 Additional Resources

### Documentation
- [React Documentation](https://reactjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [TensorFlow Documentation](https://www.tensorflow.org/guide)
- [Clerk Documentation](https://docs.clerk.dev/)

### Learning Resources
- [TensorFlow for JavaScript](https://www.tensorflow.org/js)
- [MongoDB University](https://university.mongodb.com/)
- [React Best Practices](https://react.dev/learn)
- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TensorFlow Team** for the machine learning framework
- **React Team** for the frontend framework
- **FastAPI** for the excellent Python web framework
- **MongoDB** for the flexible database solution
- **Clerk** for authentication services
- **Dog Breed Dataset** contributors
- **Open Source Community** for inspiration and tools

## 📞 Support

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Comprehensive guides and API docs
- **Community**: Join our Discord for discussions
- **Email**: akshatarora1299@gmail.com

---

<div align="center">

**[⬆ Back to top](#-pawdentify---ai-powered-dog-breed-identification--care-platform)**

Made with ❤️ for 🐕 by [Akshat Arora](https://github.com/AKSHAT-ARORA03)

*"Every dog has its day, and every breed has its story."*

![GitHub stars](https://img.shields.io/github/stars/yourusername/pawdentify?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/pawdentify?style=social)

</div>

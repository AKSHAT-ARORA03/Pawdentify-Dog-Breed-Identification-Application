# Pawdentify Startup Script
# 🐕 Location-Aware Dog Care Services Feature Implementation

Write-Host "🐕 Starting Pawdentify - AI-Powered Dog Breed Recognition System" -ForegroundColor Cyan
Write-Host "🌟 Now featuring Location-Aware Dog Care Services!" -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "main_fixed.py")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    Write-Host "Expected location: PAWDENTIFY-AI-Powered-Dog-Breed-Recognition-System\" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Starting Pawdentify Services..." -ForegroundColor Yellow
Write-Host ""

# Function to start backend
function Start-Backend {
    Write-Host "🚀 Starting Backend Server (FastAPI)..." -ForegroundColor Green
    Write-Host "📍 Location: main_fixed.py" -ForegroundColor Gray
    Write-Host "🔧 Features: AI Model + MongoDB + Location Services" -ForegroundColor Gray
    Write-Host ""
    
    # Start backend in a new PowerShell window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; python main_fixed.py"
    
    Write-Host "✅ Backend server starting..." -ForegroundColor Green
    Write-Host "🌐 Backend will be available at: http://localhost:8000" -ForegroundColor Cyan
    Write-Host ""
}

# Function to start frontend
function Start-Frontend {
    Write-Host "🚀 Starting Frontend Server (React + Vite)..." -ForegroundColor Green
    Write-Host "📍 Location: frontend/" -ForegroundColor Gray
    Write-Host "🔧 Features: Location Services + Breed Identification" -ForegroundColor Gray
    Write-Host ""
    
    # Check if node_modules exists
    if (-not (Test-Path "frontend/node_modules")) {
        Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
        cd frontend
        npm install
        cd ..
    }
    
    # Start frontend in a new PowerShell window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD/frontend'; npm run dev"
    
    Write-Host "✅ Frontend server starting..." -ForegroundColor Green
    Write-Host "🌐 Frontend will be available at: http://localhost:5173" -ForegroundColor Cyan
    Write-Host ""
}

# Start services
Start-Backend
Start-Sleep -Seconds 2
Start-Frontend

Write-Host "🎉 Pawdentify is starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Access your application:" -ForegroundColor White
Write-Host "   🖥️  Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "   🔧 Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "   📚 API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""

Write-Host "🌟 NEW FEATURES:" -ForegroundColor Yellow
Write-Host "   📍 Location-Aware Dog Care Services" -ForegroundColor Green
Write-Host "   🗺️  Google Maps Integration" -ForegroundColor Green
Write-Host "   🏥 Find Veterinarians Nearby" -ForegroundColor Green
Write-Host "   🏠 Adoption Centers & Shelters" -ForegroundColor Green
Write-Host "   🛍️  Pet Stores & Supplies" -ForegroundColor Green
Write-Host ""

Write-Host "💡 Tips:" -ForegroundColor White
Write-Host "   • Allow location access when prompted for best results" -ForegroundColor Gray
Write-Host "   • Services work without location (nationwide search)" -ForegroundColor Gray
Write-Host "   • All external links open in new tabs" -ForegroundColor Gray
Write-Host ""

Write-Host "🔍 To test the location feature:" -ForegroundColor White
Write-Host "   1. Visit the Dashboard or Landing Page" -ForegroundColor Gray
Write-Host "   2. Look for 'Dog Care Services Near You' section" -ForegroundColor Gray
Write-Host "   3. Allow location access when prompted" -ForegroundColor Gray
Write-Host "   4. Click any service to open Google Maps" -ForegroundColor Gray
Write-Host ""

Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
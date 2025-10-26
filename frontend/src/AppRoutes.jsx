import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthContext } from './auth/AuthContext'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import ScanPage from './pages/ScanPage'
import ProfilePage from './pages/ProfilePage'
import BreedCareGuides from './pages/BreedCareGuides'
import VaccinationTracker from './pages/VaccinationTracker'
import HelpSupport from './pages/HelpSupport'
import FeedbackCenter from './pages/FeedbackCenter'
import UserPreferences from './components/UserPreferences'
import EnhancedAnalytics from './components/EnhancedAnalytics'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LoadingSpinner from './components/LoadingSpinner'
import FloatingQuickActionsMenu from './components/FloatingQuickActionsMenu'

function AppRoutes() {
  const { isSignedIn, isLoaded } = useAuthContext()

  if (!isLoaded) {
    return <LoadingSpinner />
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/dashboard" 
              element={isSignedIn ? <Dashboard /> : <Navigate to="/" />} 
            />
            <Route 
              path="/scan" 
              element={isSignedIn ? <ScanPage /> : <Navigate to="/" />} 
            />
            <Route 
              path="/profile" 
              element={isSignedIn ? <ProfilePage /> : <Navigate to="/" />} 
            />
            <Route 
              path="/preferences" 
              element={isSignedIn ? <UserPreferences /> : <Navigate to="/" />} 
            />
            <Route 
              path="/analytics" 
              element={isSignedIn ? <EnhancedAnalytics /> : <Navigate to="/" />} 
            />
            <Route 
              path="/care-guides" 
              element={isSignedIn ? <BreedCareGuides /> : <Navigate to="/" />} 
            />
            <Route 
              path="/vaccination" 
              element={isSignedIn ? <VaccinationTracker /> : <Navigate to="/" />} 
            />
            <Route 
              path="/help" 
              element={isSignedIn ? <HelpSupport /> : <Navigate to="/" />} 
            />
            <Route 
              path="/feedback" 
              element={isSignedIn ? <FeedbackCenter /> : <Navigate to="/" />} 
            />
          </Routes>
        </main>
        <Footer />
        
        {/* Floating Quick Actions Menu - Available on all pages */}
        <FloatingQuickActionsMenu />
      </div>
    </Router>
  )
}

export default AppRoutes
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Camera, 
  History, 
  Bookmark, 
  BarChart3, 
  Clock, 
  Trophy,
  TrendingUp,
  Heart,
  Zap,
  Calendar,
  Settings,
  Book
} from 'lucide-react'
import { useAuthContext } from '../auth/AuthContext'
import simpleBreedImageService from '../services/simpleBreedImageService'

export default function Dashboard() {
  const { user, userHistory, savedBreeds, dashboardStats, isLoadingData } = useAuthContext()

  // Component to handle scan image with fallback
  const ScanImage = ({ scan }) => {
    const [imageSrc, setImageSrc] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
      const loadImage = async () => {
        setIsLoading(true)
        setError(false)
        
        // Always try to get a breed image first since original blob URLs are usually expired
        try {
          // Convert AI model breed name to clean format for the breed image service
          let cleanBreedName = scan.breed
          if (cleanBreedName) {
            // Convert from AI model format to display format
            cleanBreedName = cleanBreedName
              .replace(/_/g, ' ')  // Replace underscores with spaces
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ')
            
            // Handle specific breed name mappings from AI model to correct names
            const breedNameMapping = {
              'Bernese Mountain Dog': 'Saint Bernard',  // Close enough breed for images
              'German Shepherd': 'German Shepherd',
              'Golden Retriever': 'Golden Retriever', 
              'Standard Poodle': 'Standard Poodle',
              'Labrador Retriever': 'Labrador Retriever',
              'Yorkshire Terrier': 'Yorkshire Terrier',
              'French Bulldog': 'French Bulldog',
              // Add more mappings as needed
            }
            
            const mappedBreedName = breedNameMapping[cleanBreedName] || cleanBreedName
            
            console.log(`🐕 Loading image for breed: ${scan.breed} -> ${mappedBreedName}`)
            const breedImage = await simpleBreedImageService.getBreedImage(mappedBreedName)
            setImageSrc(breedImage)
            setIsLoading(false)
            return
          }
        } catch (error) {
          console.warn(`❌ Failed to load breed image for ${scan.breed}:`, error)
        }
        
        // Final fallback - try original imageUrl if available
        if (scan.imageUrl && scan.imageUrl.startsWith('http')) {
          try {
            const img = new Image()
            img.onload = () => {
              setImageSrc(scan.imageUrl)
              setIsLoading(false)
            }
            img.onerror = () => {
              setImageSrc('https://images.dog.ceo/breeds/retriever-golden/n02099601_100.jpg')
              setIsLoading(false)
            }
            img.src = scan.imageUrl
            return
          } catch (error) {
            console.warn(`❌ Failed to load original image:`, error)
          }
        }
        
        // Ultimate fallback
        setImageSrc('https://images.dog.ceo/breeds/retriever-golden/n02099601_100.jpg')
        setIsLoading(false)
      }

      loadImage()
    }, [scan.imageUrl, scan.breed])

    if (isLoading) {
      return <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    }

    return (
      <img
        src={imageSrc}
        alt={scan.breed}
        className="w-16 h-16 rounded-lg object-cover"
        onError={(e) => {
          if (!error) {
            setError(true)
            e.target.src = 'https://images.dog.ceo/breeds/retriever-golden/n02099601_100.jpg'
          }
        }}
      />
    )
  }

  // Use real MongoDB stats if available, otherwise fallback to calculated stats
  const stats = [
    {
      icon: Camera,
      label: 'Total Scans',
      value: dashboardStats?.totalScans?.toString() || userHistory.length.toString(),
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Bookmark,
      label: 'Saved Breeds',
      value: dashboardStats?.favoriteBreeds?.length?.toString() || savedBreeds.length.toString(),
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Trophy,
      label: 'Accuracy Rate',
      value: dashboardStats?.accuracyRate ? `${Math.round(dashboardStats.accuracyRate * 100)}%` : '95%+',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: TrendingUp,
      label: 'This Month',
      value: dashboardStats?.thisMonth?.toString() || userHistory.filter(item => {
        const itemDate = new Date(item.timestamp)
        const now = new Date()
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
      }).length.toString(),
      color: 'from-orange-500 to-orange-600'
    }
  ]

  // Use recent scans from MongoDB if available
  const recentScans = dashboardStats?.recentScans?.slice(0, 5) || userHistory.slice(0, 5)

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-100'
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold font-display text-gray-900">
                Welcome back, {user?.firstName || 'User'}!
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Here's your activity overview
              </p>
            </div>
            <Link
              to="/scan"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
            >
              <Camera className="mr-2 h-5 w-5" />
              Scan New Dog
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Scans */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <History className="mr-2 h-5 w-5" />
                  Recent Scans
                </h2>
                {userHistory.length > 5 && (
                  <button className="text-primary-600 hover:text-primary-700 font-medium">
                    View All
                  </button>
                )}
              </div>

              {recentScans.length > 0 ? (
                <div className="space-y-4">
                  {isLoadingData ? (
                    // Loading skeleton
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={`skeleton-${index}`} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg animate-pulse">
                        <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    recentScans.map((scan, index) => (
                      <motion.div
                        key={scan.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-center space-x-4 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg"
                      >
                        <ScanImage scan={scan} />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{scan.breed}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(scan.confidence)}`}>
                              {(scan.confidence * 100).toFixed(1)}% confidence
                            </span>
                            {scan.isCorssbreed && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">
                                Mixed Breed
                              </span>
                            )}
                            <span className="text-sm text-gray-500 flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {formatDate(scan.timestamp)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No scans yet</h3>
                  <p className="text-gray-600 mb-4">Start by scanning your first dog photo!</p>
                  <Link
                    to="/scan"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg transition-shadow"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Start Scanning
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Saved Breeds */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Bookmark className="mr-2 h-5 w-5" />
                Saved Breeds
              </h2>
              
              {savedBreeds.length > 0 ? (
                <div className="space-y-3">
                  {savedBreeds.slice(0, 5).map((saved, index) => (
                    <motion.div
                      key={saved.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-900">{saved.breed}</span>
                      <Heart className="h-4 w-4 text-red-500" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">
                  No saved breeds yet. Save breeds from your scan results!
                </p>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="mr-2 h-5 w-5" />
                Quick Actions
              </h2>
              
              <div className="space-y-3">
                <Link
                  to="/scan"
                  className="block w-full p-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg transition-shadow text-center font-medium"
                >
                  Scan New Dog
                </Link>
                <Link
                  to="/analytics"
                  className="flex items-center justify-center w-full p-3 border border-gray-300 text-gray-700 rounded-lg hover:border-primary-300 hover:text-primary-600 transition-colors font-medium"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Analytics
                </Link>
                <Link
                  to="/care-guides"
                  className="flex items-center justify-center w-full p-3 border border-gray-300 text-gray-700 rounded-lg hover:border-primary-300 hover:text-primary-600 transition-colors font-medium"
                >
                  <Book className="mr-2 h-4 w-4" />
                  Care Guides
                </Link>
                <Link
                  to="/preferences"
                  className="flex items-center justify-center w-full p-3 border border-gray-300 text-gray-700 rounded-lg hover:border-primary-300 hover:text-primary-600 transition-colors font-medium"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Preferences
                </Link>
              </div>
            </motion.div>

            {/* Monthly Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                This Month
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Scans</span>
                  <span className="font-semibold text-gray-900">
                    {stats[3].value}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Accuracy</span>
                  <span className="font-semibold text-green-600">
                    {dashboardStats?.accuracyRate ? `${Math.round(dashboardStats.accuracyRate * 100)}%` : '95%+'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">New Breeds</span>
                  <span className="font-semibold text-gray-900">
                    {dashboardStats?.uniqueBreeds || new Set(userHistory.map(h => h.breed)).size}
                  </span>
                </div>
                {dashboardStats?.favoriteBreeds?.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Favorites</span>
                    <span className="font-semibold text-purple-600">
                      {dashboardStats.favoriteBreeds.length}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

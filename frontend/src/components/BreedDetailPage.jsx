import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft,
  Heart,
  Share2,
  Bookmark,
  BookmarkCheck,
  Star,
  Clock,
  Users,
  Activity,
  Brain,
  Utensils,
  Scissors,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink,
  Download,   
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  Camera
} from 'lucide-react'
import { useAuthContext } from '../auth/AuthContext'
import BreedImageGallery from './BreedImageGallery'
import ImageLightbox from './ImageLightbox'
import { getBreedImages, getBreedSectionImages } from '../services/imageService'

const SECTION_ICONS = {
  overview: Users,
  health: Shield,
  nutrition: Utensils,
  exercise: Activity,
  grooming: Scissors,
  training: Brain
}

export default function BreedDetailPage({ 
  breed, 
  onBack, 
  onSaveBreed,
  onBreedFeedback 
}) {
  const { user, isSignedIn, savedBreeds } = useAuthContext()
  const [activeSection, setActiveSection] = useState('overview')
  const [expandedSections, setExpandedSections] = useState(new Set(['overview']))
  const [timeSpent, setTimeSpent] = useState(0)
  const [viewedSections, setViewedSections] = useState(new Set(['overview']))
  const [userRating, setUserRating] = useState(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [sectionImages, setSectionImages] = useState({})

  // Track time spent on page
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Check if breed is bookmarked
  useEffect(() => {
    if (breed && savedBreeds) {
      setIsBookmarked(savedBreeds.some(saved => saved.breed === breed.name))
    }
  }, [breed, savedBreeds])

  // Load section-specific images
  useEffect(() => {
    const loadSectionImages = async () => {
      if (!breed) return
      
      const sections = ['grooming', 'exercise', 'health', 'training', 'nutrition']
      const imagePromises = sections.map(async (section) => {
        try {
          const images = await getBreedSectionImages(breed.name, section)
          return { section, images }
        } catch (error) {
          console.error(`Error loading ${section} images:`, error)
          return { section, images: [] }
        }
      })
      
      const results = await Promise.all(imagePromises)
      const imageMap = {}
      results.forEach(({ section, images }) => {
        imageMap[section] = images
      })
      setSectionImages(imageMap)
    }
    
    loadSectionImages()
  }, [breed])

  // Handle image lightbox
  const handleImageClick = async (images, index = 0) => {
    setLightboxImages(images)
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  // Track section views for analytics
  const handleSectionView = (sectionName) => {
    setViewedSections(prev => new Set([...prev, sectionName]))
    
    // Save to search history if user is signed in
    if (isSignedIn && user) {
      // This would typically call an API to track user engagement
      console.log(`User ${user.id} viewed ${sectionName} section of ${breed.name}`)
    }
  }

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionName)) {
        newSet.delete(sectionName)
      } else {
        newSet.add(sectionName)
        handleSectionView(sectionName)
      }
      return newSet
    })
  }

  const handleBookmark = () => {
    if (isSignedIn && onSaveBreed) {
      onSaveBreed(breed.name)
      setIsBookmarked(!isBookmarked)
    }
  }

  const handleRating = (rating) => {
    setUserRating(rating)
    if (onBreedFeedback) {
      onBreedFeedback({
        breedName: breed.name,
        rating,
        timeSpent,
        viewedSections: Array.from(viewedSections),
        timestamp: new Date().toISOString()
      })
    }
  }

  const renderOverviewSection = () => (
    <div className="space-y-4">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Size', value: breed.overview.size, icon: '📏' },
          { label: 'Lifespan', value: breed.overview.lifespan, icon: '⏰' },
          { label: 'Energy Level', value: breed.overview.energyLevel, icon: '⚡' },
          { label: 'Training', value: breed.training.difficulty, icon: '🎓' }
        ].map((stat, index) => (
          <div key={index} className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg p-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
            <div className="font-semibold text-gray-900">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Temperament Tags */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-2">Temperament</h4>
        <div className="flex flex-wrap gap-2">
          {breed.overview.temperament.map((trait, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      {/* Family Compatibility */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <Users className="h-4 w-4 mr-1" />
            Family Compatibility
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Good with kids</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                breed.overview.goodWithKids.includes('Yes') 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {breed.overview.goodWithKids.includes('Yes') ? 'Yes' : 'With supervision'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Good with pets</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                breed.overview.goodWithPets.includes('Yes') 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {breed.overview.goodWithPets.includes('Yes') ? 'Yes' : 'With training'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Apartment suitable</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                breed.apartmentSuitable === 'Good' 
                  ? 'bg-green-100 text-green-700' 
                  : breed.apartmentSuitable === 'Possible'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {breed.apartmentSuitable}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <Star className="h-4 w-4 mr-1" />
            Breed Ratings
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Popularity</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < breed.popularity ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Health Rating</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < breed.healthRating ? 'text-green-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>First-time owner</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                breed.firstTimeOwner === 'Good' 
                  ? 'bg-green-100 text-green-700' 
                  : breed.firstTimeOwner === 'Challenging'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {breed.firstTimeOwner}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Origin and Purpose */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Origin & Purpose</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Origin:</span>
            <span className="ml-2 text-gray-600">{breed.origin}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Bred for:</span>
            <span className="ml-2 text-gray-600">{breed.bred_for}</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderHealthSection = () => (
    <div className="space-y-4">
      {/* Health Overview */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900">Health Overview</h4>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Health Rating:</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < breed.healthRating ? 'text-green-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Expected Lifespan:</span>
            <span className="ml-2 text-gray-600">{breed.health.lifespan}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">General Health:</span>
            <span className={`ml-2 font-medium ${
              breed.healthRating >= 4 ? 'text-green-600' : 
              breed.healthRating >= 3 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {breed.healthRating >= 4 ? 'Generally Healthy' : 
               breed.healthRating >= 3 ? 'Moderate Concerns' : 'Higher Risk'}
            </span>
          </div>
        </div>
      </div>

      {/* Common Health Issues */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <AlertTriangle className="h-4 w-4 mr-1 text-orange-500" />
          Common Health Issues
        </h4>
        <div className="grid md:grid-cols-2 gap-3">
          {breed.health.commonIssues.map((issue, index) => (
            <div key={index} className="flex items-center p-3 bg-orange-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-500 mr-2 flex-shrink-0" />
              <span className="text-sm text-gray-700">{issue}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Preventive Care */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
          Preventive Care Recommendations
        </h4>
        <div className="space-y-2">
          {breed.health.preventiveCare.map((care, index) => (
            <div key={index} className="flex items-start p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{care}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Vaccination Schedule */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Shield className="h-4 w-4 mr-1 text-blue-500" />
          Vaccination Schedule
        </h4>
        <div className="space-y-2">
          {breed.health.vaccination.map((vaccine, index) => (
            <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
              <Shield className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{vaccine}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Health Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-yellow-800 mb-1">Important Health Note</p>
            <p className="text-yellow-700">
              This information is for educational purposes only. Always consult with a qualified veterinarian 
              for specific health concerns and to develop an appropriate healthcare plan for your dog.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  // Similar render functions for nutrition, exercise, grooming, and training sections would go here
  // For brevity, I'll create simplified versions

  const renderNutritionSection = () => (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-orange-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Daily Requirements</h4>
          <div className="space-y-2 text-sm">
            <div><strong>Calories:</strong> {breed.nutrition.dailyCalories}</div>
            <div><strong>Feeding Schedule:</strong> {breed.nutrition.feedingSchedule}</div>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Special Considerations</h4>
          <div className="text-sm text-gray-700">
            {breed.nutrition.specialDiet || 'No special dietary requirements'}
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Nutrition Recommendations</h4>
        <div className="space-y-2">
          {breed.nutrition.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start p-2 bg-gray-50 rounded">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3 text-red-600">Foods to Avoid</h4>
        <div className="grid md:grid-cols-2 gap-2">
          {breed.nutrition.avoid.map((food, index) => (
            <div key={index} className="flex items-center p-2 bg-red-50 rounded">
              <AlertTriangle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
              <span className="text-sm text-gray-700">{food}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderExerciseSection = () => (
    <div className="space-y-4">
      {/* Exercise Images */}
      {sectionImages.exercise && sectionImages.exercise.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Camera className="h-4 w-4 mr-2" />
            Exercise Activities
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sectionImages.exercise.slice(0, 3).map((image, index) => (
              <div
                key={image.id}
                className="relative h-32 rounded-lg overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-200"
                onClick={() => handleImageClick(sectionImages.exercise, index)}
              >
                <img
                  src={image.url}
                  alt={`${breed.name} exercise activity ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                  Activity {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Daily Exercise Needs</h4>
        <div className="text-lg font-medium text-blue-600">{breed.exercise.dailyNeeds}</div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Recommended Activities</h4>
        <div className="grid md:grid-cols-2 gap-3">
          {breed.exercise.activities.map((activity, index) => (
            <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
              <Activity className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-sm text-gray-700">{activity}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Mental Stimulation</h4>
        <div className="space-y-2">
          {breed.exercise.mentalStimulation.map((activity, index) => (
            <div key={index} className="flex items-start p-2 bg-purple-50 rounded">
              <Brain className="h-4 w-4 text-purple-500 mr-2 mt-0.5" />
              <span className="text-sm text-gray-700">{activity}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-yellow-50 rounded-lg p-3">
          <h5 className="font-medium text-gray-900 mb-1">Puppy Exercise</h5>
          <p className="text-sm text-gray-600">{breed.exercise.puppyExercise}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <h5 className="font-medium text-gray-900 mb-1">Senior Exercise</h5>
          <p className="text-sm text-gray-600">{breed.exercise.seniorExercise}</p>
        </div>
      </div>
    </div>
  )

  const renderGroomingSection = () => (
    <div className="space-y-4">
      {/* Grooming Images */}
      {sectionImages.grooming && sectionImages.grooming.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Camera className="h-4 w-4 mr-2" />
            Grooming Guide
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sectionImages.grooming.slice(0, 3).map((image, index) => (
              <div
                key={image.id}
                className="relative h-32 rounded-lg overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-200"
                onClick={() => handleImageClick(sectionImages.grooming, index)}
              >
                <img
                  src={image.url}
                  alt={`${breed.name} grooming step ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                  Step {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-pink-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Coat Information</h4>
          <div className="space-y-1 text-sm">
            <div><strong>Coat Type:</strong> {breed.grooming.coatType}</div>
            <div><strong>Shedding:</strong> {breed.grooming.shedding}</div>
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Professional Grooming</h4>
          <div className="text-sm text-gray-700">{breed.grooming.professional}</div>
        </div>
      </div>

      <div className="space-y-3">
        {[
          { label: 'Brushing', value: breed.grooming.brushing, icon: '🪮' },
          { label: 'Bathing', value: breed.grooming.bathing, icon: '🛁' },
          { label: 'Nail Trimming', value: breed.grooming.nails, icon: '✂️' },
          { label: 'Ear Care', value: breed.grooming.ears, icon: '👂' },
          { label: 'Dental Care', value: breed.grooming.teeth, icon: '🦷' }
        ].map((item, index) => (
          <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl mr-3">{item.icon}</span>
            <div>
              <div className="font-medium text-gray-900">{item.label}</div>
              <div className="text-sm text-gray-600">{item.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderTrainingSection = () => (
    <div className="space-y-4">
      <div className="bg-indigo-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Training Overview</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div><strong>Difficulty:</strong> {breed.training.difficulty}</div>
          <div><strong>Start Age:</strong> {breed.training.startAge}</div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Essential Training</h4>
        <div className="grid md:grid-cols-2 gap-2">
          {breed.training.essentials.map((skill, index) => (
            <div key={index} className="flex items-center p-2 bg-green-50 rounded">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm text-gray-700">{skill}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Special Considerations</h4>
        <div className="space-y-2">
          {breed.training.specialConsiderations.map((consideration, index) => (
            <div key={index} className="flex items-start p-2 bg-yellow-50 rounded">
              <Info className="h-4 w-4 text-yellow-500 mr-2 mt-0.5" />
              <span className="text-sm text-gray-700">{consideration}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Socialization Needs</h4>
        <div className="space-y-2">
          {breed.training.socialization.map((need, index) => (
            <div key={index} className="flex items-start p-2 bg-blue-50 rounded">
              <Users className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
              <span className="text-sm text-gray-700">{need}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const sections = [
    { id: 'overview', name: 'Overview', render: renderOverviewSection },
    { id: 'health', name: 'Health & Wellness', render: renderHealthSection },
    { id: 'nutrition', name: 'Nutrition', render: renderNutritionSection },
    { id: 'exercise', name: 'Exercise & Activity', render: renderExerciseSection },
    { id: 'grooming', name: 'Grooming', render: renderGroomingSection },
    { id: 'training', name: 'Training', render: renderTrainingSection }
  ]

  if (!breed) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{breed.name}</h1>
                <p className="text-gray-600">{breed.group} • {breed.overview.size}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isSignedIn && (
                <button
                  onClick={handleBookmark}
                  className={`p-2 rounded-lg transition-colors ${
                    isBookmarked 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isBookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                </button>
              )}
              <button className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {sections.map((section) => {
              const Icon = SECTION_ICONS[section.id]
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id)
                    toggleSection(section.id)
                  }}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeSection === section.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {section.name}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Image Gallery Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  {breed.name} Gallery
                </h2>
                <span className="text-sm text-gray-500">Click any image for full view</span>
              </div>
            </div>
            <div className="p-6">
              <BreedImageGallery
                breedName={breed.name}
                maxImages={8}
                showThumbnails={true}
                onImageClick={handleImageClick}
                layout="grid"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {sections.find(s => s.id === activeSection)?.render()}
        </motion.div>

        {/* User Feedback */}
        {isSignedIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 bg-white rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Was this information helpful?</h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleRating('helpful')}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  userRating === 'helpful'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Helpful
              </button>
              <button
                onClick={() => handleRating('not-helpful')}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  userRating === 'not-helpful'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                Not Helpful
              </button>
            </div>
            {userRating && (
              <p className="text-sm text-gray-600 mt-2">
                Thank you for your feedback! This helps us improve our breed information.
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        breedName={breed.name}
        showThumbnails={true}
        enableSlideshow={true}
      />
    </div>
  )
}
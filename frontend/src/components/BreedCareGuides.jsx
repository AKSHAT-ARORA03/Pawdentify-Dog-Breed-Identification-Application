import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search,
  BookOpen,
  Heart,
  Star,
  Filter,
  Grid3x3,
  List,
  TrendingUp,
  Clock,
  Users,
  Award,
  ChevronRight,
  ExternalLink,
  Download,
  Share2
} from 'lucide-react'
import BreedSearchComponent from './BreedSearchComponent'
import BreedDetailPage from './BreedDetailPage'
import BreedImageCard from './BreedImageCard'
import ImageLightbox from './ImageLightbox'
import { ENHANCED_BREED_DATABASE } from '../data/enhancedBreedDatabase'
import { useAuthContext } from '../auth/AuthContext'
import enhancedImageService from '../services/enhancedImageService'
import predictionService from '../services/predictionService'

const FEATURE_HIGHLIGHTS = [
  {
    icon: BookOpen,
    title: "Comprehensive Care Guides",
    description: "Detailed information on health, nutrition, exercise, grooming, and training for 120+ dog breeds"
  },
  {
    icon: Search,
    title: "Advanced Search",
    description: "Find breeds by temperament, size, care needs, or any specific characteristic"
  },
  {
    icon: Heart,
    title: "Personalized Recommendations",
    description: "Save your favorite breeds and get personalized care tips based on your preferences"
  },
  {
    icon: Award,
    title: "Expert Verified",
    description: "All information is compiled from veterinary experts and professional dog trainers"
  }
]

const QUICK_CATEGORIES = [
  { 
    id: 'family-friendly',
    name: 'Family Friendly',
    description: 'Great with kids and other pets',
    icon: '👨‍👩‍👧‍👦',
    filters: { goodWithKids: true, goodWithPets: true }
  },
  {
    id: 'apartment-suitable',
    name: 'Apartment Living',
    description: 'Perfect for smaller living spaces',
    icon: '🏠',
    filters: { apartmentSuitable: true }
  },
  {
    id: 'first-time-owner',
    name: 'First-Time Owners',
    description: 'Easy to train and manage',
    icon: '🌟',
    filters: { firstTimeOwner: true }
  },
  {
    id: 'low-maintenance',
    name: 'Low Maintenance',
    description: 'Minimal grooming and care needs',
    icon: '✨',
    filters: { groomingNeeds: 'Low', exerciseLevel: 'Low' }
  },
  {
    id: 'active-lifestyle',
    name: 'Active Lifestyle',
    description: 'High energy breeds for active families',
    icon: '🏃‍♂️',
    filters: { energyLevel: 'High', exerciseLevel: 'High' }
  },
  {
    id: 'guard-dogs',
    name: 'Guard Dogs',
    description: 'Protective and loyal companions',
    icon: '🛡️',
    filters: { temperament: ['Protective', 'Alert', 'Loyal'] }
  }
]

const POPULAR_BREEDS = [
  'Labrador Retriever',
  'Golden Retriever',
  'German Shepherd',
  'Bulldog',
  'Poodle',
  'Beagle',
  'Rottweiler',
  'Yorkshire Terrier'
]

export default function BreedCareGuides() {
  const { user, isSignedIn, savedBreeds } = useAuthContext()
  const [viewMode, setViewMode] = useState('search') // 'search', 'categories', 'detail'
  const [selectedBreed, setSelectedBreed] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [viewLayout, setViewLayout] = useState('grid')
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  
  // AI-driven image system state
  const [breedImages, setBreedImages] = useState({}) // Cache for breed images
  const [loadingImages, setLoadingImages] = useState(new Set()) // Track loading states
  const [imageErrors, setImageErrors] = useState(new Set()) // Track failed loads

  // Load recently viewed breeds from localStorage
  useEffect(() => {
    const recent = localStorage.getItem('recentlyViewedBreeds')
    if (recent) {
      setRecentlyViewed(JSON.parse(recent))
    }
  }, [])

  // Initialize AI-driven image system
  useEffect(() => {
    const initializeImageSystem = async () => {
      try {
        console.log('🖼️ Initializing AI-driven image system for Care Guides...')
        
        // Subscribe to image loading events
        const unsubscribe = enhancedImageService.subscribe((event, data) => {
          switch (event) {
            case 'images_loaded':
              setBreedImages(prev => ({
                ...prev,
                [data.breedName]: data.images
              }))
              setLoadingImages(prev => {
                const newSet = new Set(prev)
                newSet.delete(data.breedName)
                return newSet
              })
              break
            case 'images_error':
              setImageErrors(prev => new Set([...prev, data.breedName]))
              setLoadingImages(prev => {
                const newSet = new Set(prev)
                newSet.delete(data.breedName)
                return newSet
              })
              break
          }
        })

        // Preload images for popular breeds
        await enhancedImageService.preloadPopularBreeds(POPULAR_BREEDS.slice(0, 4))
        
        return unsubscribe
      } catch (error) {
        console.error('Error initializing AI image system:', error)
      }
    }

    initializeImageSystem()
  }, [])

  // Enhanced breed image loading with AI integration
  const loadBreedImages = async (breedName, count = 6, size = 'medium') => {
    if (loadingImages.has(breedName) || breedImages[breedName]) {
      return breedImages[breedName] || []
    }

    try {
      setLoadingImages(prev => new Set([...prev, breedName]))
      setImageErrors(prev => {
        const newSet = new Set(prev)
        newSet.delete(breedName)
        return newSet
      })

      console.log(`🔍 Loading AI-driven images for ${breedName}...`)
      const images = await enhancedImageService.getBreedImages(breedName, size, count)
      
      setBreedImages(prev => ({
        ...prev,
        [breedName]: images
      }))
      
      setLoadingImages(prev => {
        const newSet = new Set(prev)
        newSet.delete(breedName)
        return newSet
      })

      return images
    } catch (error) {
      console.error(`Error loading images for ${breedName}:`, error)
      setImageErrors(prev => new Set([...prev, breedName]))
      setLoadingImages(prev => {
        const newSet = new Set(prev)
        newSet.delete(breedName)
        return newSet
      })
      return []
    }
  }

  // Load images for visible breeds when search results change
  useEffect(() => {
    if (searchResults.length > 0 && searchResults.length <= 20) {
      // Only auto-load for reasonable number of results
      searchResults.slice(0, 12).forEach(breed => {
        if (!breedImages[breed.name] && !loadingImages.has(breed.name)) {
          setTimeout(() => {
            loadBreedImages(breed.name, 1, 'medium')
          }, Math.random() * 1000) // Stagger loading
        }
      })
    }
  }, [searchResults])

  // Handle breed selection and save to recent history
  const handleBreedSelect = (breedName) => {
    const breedData = ENHANCED_BREED_DATABASE[breedName]
    if (breedData) {
      setSelectedBreed(breedData)
      setViewMode('detail')
      
      // Add to recently viewed (avoid duplicates and limit to 10)
      const updated = [breedName, ...recentlyViewed.filter(b => b !== breedName)].slice(0, 10)
      setRecentlyViewed(updated)
      localStorage.setItem('recentlyViewedBreeds', JSON.stringify(updated))
    }
  }

  // Handle image click to open lightbox with AI-driven images
  const handleImageClick = async (breed, imageIndex = 0) => {
    try {
      console.log(`🖼️ Opening lightbox for ${breed.name} with AI-driven images...`)
      
      // Use enhanced image service for high-quality gallery images
      const images = await enhancedImageService.getBreedGallery(breed.name, 8)
      
      if (images.length > 0) {
        setLightboxImages(images)
        setLightboxIndex(imageIndex)
        setLightboxOpen(true)
      } else {
        console.warn(`No images available for ${breed.name}`)
      }
    } catch (error) {
      console.error('Error loading images for lightbox:', error)
      // Show fallback message or placeholder
    }
  }

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    
    // Filter breeds based on category criteria
    const filteredBreeds = Object.entries(ENHANCED_BREED_DATABASE)
      .filter(([name, breed]) => {
        if (category.id === 'family-friendly') {
          return breed.overview.goodWithKids.includes('Yes') && 
                 breed.overview.goodWithPets.includes('Yes')
        }
        if (category.id === 'apartment-suitable') {
          return breed.apartmentSuitable === 'Good'
        }
        if (category.id === 'first-time-owner') {
          return breed.firstTimeOwner === 'Good'
        }
        if (category.id === 'low-maintenance') {
          return breed.grooming.professional.includes('minimal') ||
                 breed.exercise.dailyNeeds.includes('30 minutes')
        }
        if (category.id === 'active-lifestyle') {
          return breed.overview.energyLevel === 'High' ||
                 breed.exercise.dailyNeeds.includes('2+ hours')
        }
        if (category.id === 'guard-dogs') {
          return breed.overview.temperament.some(trait => 
            ['Protective', 'Alert', 'Loyal', 'Confident'].includes(trait)
          )
        }
        return false
      })
      .map(([name, breed]) => ({ name, ...breed }))
    
    setSearchResults(filteredBreeds)
    setViewMode('categories')
  }

  // Enhanced breed card component with AI-driven images
  const renderBreedCard = (breed, index) => {
    console.log(`🎯 Rendering breed card for: ${breed.name}`);
    
    // Trigger image loading if not already loaded/loading
    if (!breedImages[breed.name] && !loadingImages.has(breed.name) && !imageErrors.has(breed.name)) {
      console.log(`🚀 Triggering image load for: ${breed.name}`);
      // Trigger loading in the next tick to avoid state updates during render
      setTimeout(() => {
        loadBreedImages(breed.name, 1, 'medium');
      }, 0);
    } else {
      console.log(`📊 Image state for ${breed.name}:`, {
        hasImages: !!breedImages[breed.name],
        isLoading: loadingImages.has(breed.name),
        hasError: imageErrors.has(breed.name)
      });
    }

    return (
      <BreedImageCard
        key={breed.name}
        breed={breed}
        onClick={() => handleBreedSelect(breed.name)}
        onImageClick={() => handleImageClick(breed)}
        isLiked={savedBreeds && savedBreeds.some(saved => saved.breed === breed.name)}
        showRating={true}
        showStats={true}
        size="medium"
        className="transition-all duration-300"
        
        // AI-driven image enhancement props
        aiDrivenImages={breedImages[breed.name] || []}
        isLoadingImages={loadingImages.has(breed.name)}
        hasImageError={imageErrors.has(breed.name)}
        onRetryImageLoad={() => {
          console.log(`🔄 Retrying image load for: ${breed.name}`);
          setImageErrors(prev => {
            const newSet = new Set(prev)
            newSet.delete(breed.name)
            return newSet
          })
          loadBreedImages(breed.name, 1, 'medium')
        }}
      />
    )
  }

  if (viewMode === 'detail' && selectedBreed) {
    return (
      <BreedDetailPage
        breed={selectedBreed}
        onBack={() => setViewMode('search')}
        onSaveBreed={(breedName) => {
          // This would typically call an API to save the breed
          console.log(`Saving breed: ${breedName}`)
        }}
        onBreedFeedback={(feedback) => {
          // This would typically call an API to record feedback
          console.log('Breed feedback:', feedback)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Comprehensive Dog Breed Care Guides
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto"
            >
              Expert-verified information on health, nutrition, exercise, grooming, and training 
              for over 120 dog breeds. Find the perfect care routine for your furry friend.
            </motion.p>
            
            {/* Search Component */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              <BreedSearchComponent
                onBreedSelect={handleBreedSelect}
                onSearchResults={setSearchResults}
                placeholder="Search by breed name, temperament, size, or care needs..."
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-white/70"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURE_HIGHLIGHTS.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Quick Categories */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Find Breeds by Category
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {QUICK_CATEGORIES.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 cursor-pointer transform hover:-translate-y-1"
                onClick={() => handleCategorySelect(category)}
              >
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">{category.icon}</span>
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                </div>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <div className="flex items-center text-primary-600 font-medium">
                  <span>Explore breeds</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Popular Breeds Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Popular Breeds</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewLayout('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewLayout === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Grid3x3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewLayout('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewLayout === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className={`grid gap-6 ${
              viewLayout === 'grid' 
                ? 'md:grid-cols-2 lg:grid-cols-4' 
                : 'grid-cols-1 md:grid-cols-2'
            }`}>
              {POPULAR_BREEDS.map((breedName, index) => {
                const breed = ENHANCED_BREED_DATABASE[breedName]
                if (!breed) return null
                return renderBreedCard({ name: breedName, ...breed }, index)
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recently Viewed Section */}
      {recentlyViewed.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center mb-8">
              <Clock className="h-6 w-6 text-gray-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Recently Viewed</h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentlyViewed.slice(0, 4).map((breedName, index) => {
                const breed = ENHANCED_BREED_DATABASE[breedName]
                if (!breed) return null
                return renderBreedCard({ name: breedName, ...breed }, index)
              })}
            </div>
          </motion.div>
        </div>
      )}

      {/* Search Results Display */}
      <AnimatePresence>
        {viewMode === 'categories' && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl mx-auto px-4 pb-16"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory?.name} Breeds
                </h2>
                <p className="text-gray-600">{searchResults.length} breeds found</p>
              </div>
              <button
                onClick={() => setViewMode('search')}
                className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                Back to Search
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {searchResults.map((breed, index) => renderBreedCard(breed, index))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-secondary-600 to-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">
              Can't Find Your Breed?
            </h2>
            <p className="text-xl text-secondary-100 mb-8 max-w-2xl mx-auto">
              Use our AI-powered breed identification tool to discover your dog's breed 
              and get personalized care recommendations.
            </p>
            <button className="bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors">
              Try Breed Identification
            </button>
          </motion.div>
        </div>
      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        breedName={lightboxImages[lightboxIndex]?.breedName || 'Dog Breed'}
        showThumbnails={true}
        enableSlideshow={true}
      />
    </div>
  )
}
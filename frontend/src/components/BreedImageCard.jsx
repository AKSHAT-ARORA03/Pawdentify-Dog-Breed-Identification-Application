import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Star, Loader2, Image as ImageIcon } from 'lucide-react'
import simpleBreedImageService from '../services/simpleBreedImageService'

/**
 * BreedImageCard Component
 * Displays breed thumbnail with hover effects, loading states, and fallback handling
 */
const BreedImageCard = ({ 
  breed, 
  onClick, 
  isLiked = false, 
  showRating = true, 
  showStats = true,
  className = '',
  aspectRatio = '4:3',
  size = 'medium',
  
  // AI-driven image enhancement props
  aiDrivenImages = [],
  isLoadingImages = false,
  hasImageError = false,
  onRetryImageLoad = null,
  onImageClick = null
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageUrl, setImageUrl] = useState(null)

  // Image size configurations
  const sizeClasses = {
    small: 'h-32',
    medium: 'h-48',
    large: 'h-64'
  }

  // Use AI-driven images if available, otherwise fetch real dog images
  useEffect(() => {
    const loadBreedImage = async () => {
      // PRIORITY 1: Use AI-driven images if available
      if (aiDrivenImages && aiDrivenImages.length > 0) {
        const primaryImage = aiDrivenImages[0];
        console.log(`🖼️ Using AI-driven image for ${breed.name}:`, primaryImage.url);
        setImageUrl(primaryImage.url);
        return;
      }

      // PRIORITY 2: Fetch real breed image from Dog CEO API
      try {
        console.log(`🐕 Fetching real dog image for: ${breed.name}`);
        const breedImageUrl = await simpleBreedImageService.getBreedImage(breed.name);
        setImageUrl(breedImageUrl);
        console.log(`✅ Loaded real image for ${breed.name}`);
      } catch (error) {
        console.error(`❌ Failed to load real image for ${breed.name}:`, error);
        
        // PRIORITY 3: Fallback to clearly labeled placeholder
        const fallbackUrl = `https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=${encodeURIComponent(breed.name)}`;
        setImageUrl(fallbackUrl);
      }
    };

    setImageError(false);
    setImageLoaded(false);
    loadBreedImage();
  }, [breed.name, aiDrivenImages]);

  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(true)
    
    // Try to retry image loading if callback provided
    if (onRetryImageLoad) {
      console.log(`🔄 Retrying image load for ${breed.name}`);
      onRetryImageLoad();
    }
  }

  const handleCardClick = () => {
    if (onClick) {
      onClick(breed)
    }
  }

  const handleImageClick = (e) => {
    e.stopPropagation(); // Prevent card click
    if (onImageClick) {
      onImageClick(breed);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group ${className}`}
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className={`relative ${sizeClasses[size]} overflow-hidden`}>
        {/* AI-driven Loading State */}
        {(isLoadingImages || !imageLoaded) && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-2" />
              <span className="text-sm text-blue-600 font-medium">
                {isLoadingImages ? 'Loading AI images...' : 'Loading...'}
              </span>
            </div>
          </div>
        )}

        {/* Actual Breed Image */}
        <img
          src={imageUrl}
          alt={`${breed.name} dog breed`}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } ${imageError ? 'hidden' : ''}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          onClick={handleImageClick}
          loading="lazy"
        />

        {/* Error State with Retry */}
        {(imageError || hasImageError) && (
          <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="h-12 w-12 text-orange-500 mx-auto mb-2" />
              <span className="text-sm text-orange-700 font-medium">{breed.name}</span>
              {onRetryImageLoad && (
                <button 
                  className="mt-2 px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRetryImageLoad();
                  }}
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        )}

        {/* AI-driven Image Badge */}
        {aiDrivenImages && aiDrivenImages.length > 0 && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            AI ✨
          </div>
        )}

        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Heart Icon for Liked Breeds */}
        {isLiked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full shadow-lg"
          >
            <Heart className="h-4 w-4 fill-current" />
          </motion.div>
        )}

        {/* Rating Stars */}
        {showRating && breed.popularity && (
          <div className="absolute bottom-3 left-3 flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < breed.popularity 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-white opacity-50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Hover Overlay Content */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white bg-opacity-90 rounded-lg px-3 py-1 backdrop-blur-sm">
            <span className="text-sm font-medium text-gray-900">View Details</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        {/* Breed Name and Size */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 truncate text-lg">
            {breed.name}
          </h3>
          {breed.overview?.size && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {breed.overview.size}
            </span>
          )}
        </div>

        {/* Temperament */}
        {breed.overview?.temperament && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {Array.isArray(breed.overview.temperament) 
              ? breed.overview.temperament.slice(0, 3).join(', ')
              : breed.overview.temperament
            }
          </p>
        )}

        {/* Quick Stats */}
        {showStats && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center text-gray-500">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              <span>
                {breed.overview?.goodWithKids?.includes('Yes') ? 'Kid Friendly' : 'Adult Preferred'}
              </span>
            </div>
            <div className="flex items-center text-gray-500">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
              <span>{breed.overview?.energyLevel || 'Medium'} Energy</span>
            </div>
          </div>
        )}

        {/* Breed Group */}
        {breed.group && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500 font-medium">{breed.group}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default BreedImageCard
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  Grid3x3, 
  Maximize2,
  Download,
  Share2,
  Heart,
  Loader2,
  ImageIcon
} from 'lucide-react'
import simpleBreedImageService from '../services/simpleBreedImageService'

/**
 * BreedImageGallery Component
 * Interactive image gallery with thumbnails, navigation, and lightbox support
 */
const BreedImageGallery = ({ 
  breedName, 
  maxImages = 8, 
  showThumbnails = true,
  onImageClick,
  className = '',
  layout = 'grid' // 'grid', 'masonry', 'carousel'
}) => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [imagesLoaded, setImagesLoaded] = useState({})

  // Load breed images on mount
  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log(`🖼️ Gallery: Loading images for ${breedName}...`)
        
        // Use the simple breed image service to get real dog breed photos
        const breedImages = await simpleBreedImageService.getBreedImages(breedName, maxImages)
        
        console.log(`✅ Gallery: Loaded ${breedImages.length} images for ${breedName}`)
        setImages(breedImages)
      } catch (err) {
        console.error(`❌ Gallery: Failed to load images for ${breedName}:`, err)
        setError('Failed to load breed images')
        
        // Fallback to placeholder images with breed name
        const fallbackImages = Array.from({ length: maxImages }, (_, i) => ({
          id: `fallback-${breedName}-${i}`,
          url: `https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=${encodeURIComponent(breedName)}`,
          alt: `${breedName} placeholder ${i + 1}`,
          source: 'Placeholder'
        }))
        setImages(fallbackImages)
      } finally {
        setLoading(false)
      }
    }

    if (breedName) {
      loadImages()
    }
  }, [breedName, maxImages])

  // Handle image load events
  const handleImageLoad = (imageId) => {
    setImagesLoaded(prev => ({ ...prev, [imageId]: true }))
  }

  const handleImageError = (imageId) => {
    setImagesLoaded(prev => ({ ...prev, [imageId]: 'error' }))
  }

  // Navigation handlers
  const goToPrevious = () => {
    setSelectedImageIndex(prev => 
      prev === 0 ? images.length - 1 : prev - 1
    )
  }

  const goToNext = () => {
    setSelectedImageIndex(prev => 
      prev === images.length - 1 ? 0 : prev + 1
    )
  }

  const selectImage = (index) => {
    setSelectedImageIndex(index)
  }

  // Handle image click
  const handleImageClick = (image, index) => {
    setSelectedImageIndex(index)
    if (onImageClick) {
      onImageClick(image, index)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-xl">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
            <span className="text-sm text-gray-500">Loading gallery...</span>
          </div>
        </div>
        {showThumbnails && (
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Error state
  if (error || images.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Images Available</h3>
        <p className="text-gray-500">
          {error || `No images found for ${breedName}`}
        </p>
      </div>
    )
  }

  const selectedImage = images[selectedImageIndex]

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Image Display */}
      <div className="relative group">
        <motion.div
          key={selectedImageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative h-96 bg-gray-100 rounded-xl overflow-hidden"
        >
          {/* Loading State for Individual Image */}
          {!imagesLoaded[selectedImage.id] && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
            </div>
          )}

          {/* Main Image */}
          <img
            src={selectedImage.url}
            alt={selectedImage.alt}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imagesLoaded[selectedImage.id] === true ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => handleImageLoad(selectedImage.id)}
            onError={() => handleImageError(selectedImage.id)}
          />

          {/* Error State for Individual Image */}
          {imagesLoaded[selectedImage.id] === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <span className="text-sm text-gray-500">Image unavailable</span>
              </div>
            </div>
          )}

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => handleImageClick(selectedImage, selectedImageIndex)}
              className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
              aria-label="View fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            
            <button
              className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
              aria-label="Download image"
            >
              <Download className="h-4 w-4" />
            </button>
            
            <button
              className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
              aria-label="Share image"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {selectedImageIndex + 1} / {images.length}
          </div>

          {/* Image Caption */}
          {selectedImage.caption && (
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm max-w-xs truncate">
              {selectedImage.caption}
            </div>
          )}
        </motion.div>
      </div>

      {/* Thumbnail Navigation */}
      {showThumbnails && images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <motion.button
              key={image.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => selectImage(index)}
              className={`relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === selectedImageIndex
                  ? 'border-primary-500 ring-2 ring-primary-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={image.thumbnail || image.url}
                alt={`${breedName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* Overlay for selected thumbnail */}
              {index === selectedImageIndex && (
                <div className="absolute inset-0 bg-primary-500 bg-opacity-20" />
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Gallery Grid Layout (Alternative View) */}
      {layout === 'grid' && images.length > 1 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {images.slice(1).map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative h-32 rounded-lg overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-200"
              onClick={() => handleImageClick(image, index + 1)}
            >
              <img
                src={image.thumbnail || image.url}
                alt={image.alt}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
              
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Maximize2 className="h-6 w-6 text-white" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Keyboard Navigation Instructions */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Use arrow keys to navigate • Click images for full view
        </p>
      </div>
    </div>
  )
}

export default BreedImageGallery
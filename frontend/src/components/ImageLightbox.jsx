import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Share2,
  Heart,
  Info,
  Grid3x3,
  Play,
  Pause
} from 'lucide-react'

/**
 * ImageLightbox Component
 * Full-screen image viewer with zoom, navigation, and interactive features
 */
const ImageLightbox = ({
  images = [],
  initialIndex = 0,
  isOpen = false,
  onClose,
  onImageChange,
  breedName = '',
  showThumbnails = true,
  enableSlideshow = true,
  slideshowInterval = 3000
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  const [showThumbnailStrip, setShowThumbnailStrip] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  // Reset state when lightbox opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
      setZoom(1)
      setRotation(0)
      setShowInfo(false)
      setIsPlaying(false)
    }
  }, [isOpen, initialIndex])

  // Slideshow functionality
  useEffect(() => {
    let interval
    if (isPlaying && images.length > 1) {
      interval = setInterval(() => {
        goToNext()
      }, slideshowInterval)
    }
    return () => clearInterval(interval)
  }, [isPlaying, images.length, slideshowInterval])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          e.preventDefault()
          goToPrevious()
          break
        case 'ArrowRight':
          e.preventDefault()
          goToNext()
          break
        case '+':
        case '=':
          e.preventDefault()
          zoomIn()
          break
        case '-':
          e.preventDefault()
          zoomOut()
          break
        case '0':
          e.preventDefault()
          resetZoom()
          break
        case 'i':
        case 'I':
          e.preventDefault()
          setShowInfo(!showInfo)
          break
        case ' ':
          e.preventDefault()
          toggleSlideshow()
          break
        default:
          break
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, showInfo, isPlaying])

  // Navigation handlers
  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
    if (onImageChange) {
      onImageChange(newIndex)
    }
  }, [currentIndex, images.length, onImageChange])

  const goToNext = useCallback(() => {
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
    if (onImageChange) {
      onImageChange(newIndex)
    }
  }, [currentIndex, images.length, onImageChange])

  const goToImage = (index) => {
    setCurrentIndex(index)
    if (onImageChange) {
      onImageChange(index)
    }
  }

  // Zoom handlers
  const zoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 5))
  }

  const zoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 0.5))
  }

  const resetZoom = () => {
    setZoom(1)
    setRotation(0)
  }

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  // Slideshow handlers
  const toggleSlideshow = () => {
    setIsPlaying(!isPlaying)
  }

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      goToNext()
    } else if (isRightSwipe) {
      goToPrevious()
    }

    setTouchStart(null)
    setTouchEnd(null)
  }

  // Download handler
  const handleDownload = async () => {
    try {
      const image = images[currentIndex]
      const response = await fetch(image.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${breedName}-${currentIndex + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  // Share handler
  const handleShare = async () => {
    try {
      const image = images[currentIndex]
      if (navigator.share) {
        await navigator.share({
          title: `${breedName} - Image ${currentIndex + 1}`,
          text: `Check out this ${breedName} photo`,
          url: image.url
        })
      } else {
        // Fallback: copy URL to clipboard
        await navigator.clipboard.writeText(image.url)
        // You could show a toast notification here
      }
    } catch (error) {
      console.error('Error sharing image:', error)
    }
  }

  if (!isOpen || images.length === 0) {
    return null
  }

  const currentImage = images[currentIndex]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Main Content */}
        <div
          className="relative w-full h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            {/* Left Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                title="Toggle info (I)"
              >
                <Info className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => setShowThumbnailStrip(!showThumbnailStrip)}
                className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                title="Toggle thumbnails"
              >
                <Grid3x3 className="h-5 w-5" />
              </button>

              {enableSlideshow && images.length > 1 && (
                <button
                  onClick={toggleSlideshow}
                  className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                  title="Toggle slideshow (Space)"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
              )}
            </div>

            {/* Image Counter */}
            <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
              {currentIndex + 1} / {images.length}
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={zoomOut}
                className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                title="Zoom out (-)"
              >
                <ZoomOut className="h-5 w-5" />
              </button>
              
              <button
                onClick={zoomIn}
                className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                title="Zoom in (+)"
              >
                <ZoomIn className="h-5 w-5" />
              </button>
              
              <button
                onClick={rotate}
                className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                title="Rotate"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleDownload}
                className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                title="Download"
              >
                <Download className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleShare}
                className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                title="Share"
              >
                <Share2 className="h-5 w-5" />
              </button>
              
              <button
                onClick={onClose}
                className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                title="Close (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Main Image */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-full max-h-full"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={currentImage.url}
              alt={currentImage.alt}
              className="max-w-full max-h-full object-contain select-none"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease'
              }}
              draggable={false}
            />
          </motion.div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all duration-200"
                title="Previous (←)"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              
              <button
                onClick={goToNext}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all duration-200"
                title="Next (→)"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Image Info Panel */}
          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-20 left-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg"
              >
                <h3 className="text-lg font-semibold mb-2">
                  {breedName} - Image {currentIndex + 1}
                </h3>
                {currentImage.caption && (
                  <p className="text-gray-300 mb-2">{currentImage.caption}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Source: {currentImage.source || 'Unknown'}</span>
                  <span>Zoom: {Math.round(zoom * 100)}%</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Thumbnail Strip */}
          <AnimatePresence>
            {showThumbnailStrip && images.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-80 p-4 rounded-lg"
              >
                <div className="flex space-x-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => goToImage(index)}
                      className={`flex-shrink-0 w-16 h-12 rounded border-2 overflow-hidden transition-all duration-200 ${
                        index === currentIndex
                          ? 'border-white ring-2 ring-white ring-opacity-50'
                          : 'border-gray-400 hover:border-white'
                      }`}
                    >
                      <img
                        src={image.thumbnail || image.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Zoom Reset Button */}
          {zoom !== 1 && (
            <button
              onClick={resetZoom}
              className="absolute bottom-20 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white px-4 py-2 rounded-full transition-all duration-200"
              title="Reset zoom (0)"
            >
              Reset ({Math.round(zoom * 100)}%)
            </button>
          )}

          {/* Keyboard Shortcuts Hint */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black bg-opacity-50 px-3 py-1 rounded-full">
            ← → Navigate • +/- Zoom • Space Play • I Info • Esc Close
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ImageLightbox
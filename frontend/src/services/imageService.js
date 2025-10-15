/**
 * Image Service for Breed Care Guides
 * Handles image loading, fallbacks, and CDN integration
 */

import { BREED_IMAGE_PLACEHOLDERS, DEFAULT_DOG_IMAGE } from '../data/breedImagePlaceholders'

// Unsplash API configuration for breed images
const UNSPLASH_ACCESS_KEY = 'your-unsplash-access-key-here'; // Replace with actual key
const UNSPLASH_BASE_URL = 'https://api.unsplash.com';

// Local fallback images
const FALLBACK_IMAGES = {
  default: '/src/assets/breed-images/default-dog.jpg',
  loading: '/src/assets/breed-images/loading-placeholder.jpg',
  error: '/src/assets/breed-images/error-placeholder.jpg'
};

/**
 * Get breed images from multiple sources
 * @param {string} breedName - Name of the breed
 * @param {string} size - Image size ('thumbnail', 'medium', 'large')
 * @param {number} count - Number of images to fetch
 * @returns {Promise<Array>} Array of image objects
 */
export const getBreedImages = async (breedName, size = 'medium', count = 6) => {
  try {
    // First check for placeholder images
    if (BREED_IMAGE_PLACEHOLDERS[breedName]) {
      return BREED_IMAGE_PLACEHOLDERS[breedName].gallery.slice(0, count)
    }

    // Try to get local images
    const localImages = await getLocalBreedImages(breedName, count);
    if (localImages.length > 0) {
      return localImages;
    }

    // Fallback to external API
    return await getExternalBreedImages(breedName, size, count);
  } catch (error) {
    console.error('Error fetching breed images:', error);
    return getFallbackImages(breedName, count);
  }
};

/**
 * Get local breed images
 * @param {string} breedName - Name of the breed
 * @param {number} count - Number of images to fetch
 * @returns {Promise<Array>} Array of local image objects
 */
const getLocalBreedImages = async (breedName, count = 6) => {
  const images = [];
  const normalizedBreedName = normalizeBreedName(breedName);
  
  try {
    // Check for existing local images
    for (let i = 1; i <= count; i++) {
      const imagePath = `/src/assets/breed-images/${normalizedBreedName}/${normalizedBreedName}-${i}.jpg`;
      
      // Check if image exists (in a real app, you'd validate this server-side)
      images.push({
        id: `${normalizedBreedName}-${i}`,
        url: imagePath,
        thumbnail: `/src/assets/breed-images/${normalizedBreedName}/thumbnails/${normalizedBreedName}-${i}-thumb.jpg`,
        alt: `${breedName} image ${i}`,
        caption: `${breedName}`,
        source: 'local',
        loading: 'lazy'
      });
    }
  } catch (error) {
    console.log('No local images found for:', breedName);
  }
  
  return images;
};

/**
 * Get breed images from external APIs (Unsplash, Pixabay, etc.)
 * @param {string} breedName - Name of the breed
 * @param {string} size - Image size
 * @param {number} count - Number of images to fetch
 * @returns {Promise<Array>} Array of external image objects
 */
const getExternalBreedImages = async (breedName, size = 'medium', count = 6) => {
  try {
    // Use a combination of search terms for better results
    const searchTerms = [
      `${breedName} dog`,
      `${breedName} puppy`,
      `${breedName} breed`
    ];
    
    const images = [];
    
    // For demo purposes, we'll create placeholder URLs
    // In production, you'd make actual API calls
    for (let i = 0; i < count; i++) {
      const imageId = Math.floor(Math.random() * 1000) + 1;
      images.push({
        id: `unsplash-${breedName}-${i}`,
        url: `https://picsum.photos/800/600?random=${imageId}`,
        thumbnail: `https://picsum.photos/300/200?random=${imageId}`,
        alt: `${breedName} dog`,
        caption: `Beautiful ${breedName}`,
        source: 'external',
        loading: 'lazy'
      });
    }
    
    return images;
  } catch (error) {
    console.error('Error fetching external images:', error);
    return getFallbackImages(count);
  }
};

/**
 * Get fallback images when other sources fail
 * @param {string} breedName - Name of the breed for consistent placeholders
 * @param {number} count - Number of fallback images
 * @returns {Array} Array of fallback image objects
 */
const getFallbackImages = (breedName = 'default', count = 6) => {
  const fallbackImages = [];
  
  for (let i = 0; i < count; i++) {
    const imageId = Math.abs(
      (breedName + i).split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0)
        return a & a
      }, 0)
    ) % 1000
    
    fallbackImages.push({
      id: `fallback-${breedName}-${i}`,
      url: `https://picsum.photos/800/600?random=${imageId}`,
      thumbnail: `https://picsum.photos/300/200?random=${imageId}`,
      alt: `${breedName} placeholder image`,
      caption: `Beautiful ${breedName}`,
      source: 'fallback',
      loading: 'lazy'
    });
  }
  
  return fallbackImages;
};

/**
 * Get single hero image for a breed
 * @param {string} breedName - Name of the breed
 * @returns {Promise<Object>} Hero image object
 */
export const getBreedHeroImage = async (breedName) => {
  try {
    // Check for placeholder hero image first
    if (BREED_IMAGE_PLACEHOLDERS[breedName]) {
      return {
        id: `${breedName}-hero`,
        url: BREED_IMAGE_PLACEHOLDERS[breedName].hero,
        thumbnail: BREED_IMAGE_PLACEHOLDERS[breedName].hero,
        alt: `${breedName} hero image`,
        caption: `Beautiful ${breedName}`,
        source: 'placeholder'
      }
    }
    
    const images = await getBreedImages(breedName, 'large', 1);
    return images[0] || getFallbackImages(breedName, 1)[0];
  } catch (error) {
    console.error('Error fetching hero image:', error);
    return getFallbackImages(breedName, 1)[0];
  }
};

/**
 * Get breed thumbnail for cards
 * @param {string} breedName - Name of the breed
 * @returns {Promise<Object>} Thumbnail image object
 */
export const getBreedThumbnail = async (breedName) => {
  try {
    // Check for placeholder thumbnail first
    if (BREED_IMAGE_PLACEHOLDERS[breedName]) {
      const gallery = BREED_IMAGE_PLACEHOLDERS[breedName].gallery
      return gallery[0] || DEFAULT_DOG_IMAGE
    }
    
    const images = await getBreedImages(breedName, 'thumbnail', 1);
    return images[0] || getFallbackImages(breedName, 1)[0];
  } catch (error) {
    console.error('Error fetching thumbnail:', error);
    return getFallbackImages(breedName, 1)[0];
  }
};

/**
 * Preload images for better performance
 * @param {Array} imageUrls - Array of image URLs to preload
 */
export const preloadImages = (imageUrls) => {
  imageUrls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
};

/**
 * Check if image exists and is loadable
 * @param {string} url - Image URL to check
 * @returns {Promise<boolean>} Whether image is loadable
 */
export const checkImageExists = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

/**
 * Optimize image loading with lazy loading and progressive enhancement
 * @param {HTMLImageElement} imgElement - Image element to optimize
 * @param {Object} imageData - Image data object
 */
export const optimizeImageLoading = (imgElement, imageData) => {
  // Set up intersection observer for lazy loading
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = imageData.url;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });
    
    imgElement.classList.add('lazy');
    imageObserver.observe(imgElement);
  } else {
    // Fallback for browsers without IntersectionObserver
    imgElement.src = imageData.url;
  }
};

/**
 * Get breed-specific image collection for care sections
 * @param {string} breedName - Name of the breed
 * @param {string} section - Care section (grooming, exercise, health, etc.)
 * @returns {Promise<Array>} Array of section-specific images
 */
export const getBreedSectionImages = async (breedName, section) => {
  const sectionImageMap = {
    grooming: ['grooming', 'brushing', 'bathing'],
    exercise: ['running', 'playing', 'walking'],
    health: ['veterinary', 'checkup', 'healthy'],
    training: ['training', 'obedience', 'commands'],
    nutrition: ['feeding', 'food', 'eating']
  };
  
  try {
    // Generate section-specific images with different seeds
    const sectionSeed = sectionImageMap[section] ? section : 'general'
    const images = []
    
    for (let i = 0; i < 3; i++) {
      const imageId = Math.abs(
        (breedName + sectionSeed + i).split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0)
          return a & a
        }, 0)
      ) % 1000
      
      images.push({
        id: `${breedName}-${section}-${i}`,
        url: `https://picsum.photos/800/600?random=${imageId}`,
        thumbnail: `https://picsum.photos/300/200?random=${imageId}`,
        alt: `${breedName} ${section} image ${i + 1}`,
        caption: `${breedName} ${section}`,
        source: 'section-placeholder',
        loading: 'lazy'
      })
    }
    
    return images
  } catch (error) {
    console.error(`Error fetching ${section} images:`, error);
    return getFallbackImages(breedName, 3);
  }
};

/**
 * Normalize breed name for file naming
 * @param {string} breedName - Original breed name
 * @returns {string} Normalized breed name
 */
const normalizeBreedName = (breedName) => {
  return breedName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Image size configurations
 */
export const IMAGE_SIZES = {
  thumbnail: { width: 300, height: 200 },
  medium: { width: 800, height: 600 },
  large: { width: 1200, height: 800 },
  hero: { width: 1920, height: 1080 }
};

/**
 * Supported image formats in order of preference
 */
export const SUPPORTED_FORMATS = ['webp', 'jpg', 'jpeg', 'png'];

export default {
  getBreedImages,
  getBreedHeroImage,
  getBreedThumbnail,
  getBreedSectionImages,
  preloadImages,
  checkImageExists,
  optimizeImageLoading,
  IMAGE_SIZES,
  SUPPORTED_FORMATS
};
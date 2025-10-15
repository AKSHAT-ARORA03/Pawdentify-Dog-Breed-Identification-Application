/**
 * Enhanced Image Service for AI-Driven Breed Care Guides
 * Integrates with AI model predictions and external APIs for dynamic breed-specific images
 */

import predictionService from './predictionService.js';
import imageApiService from './imageApiService.js';
import aiModelIntegrationService from './aiModelIntegrationService.js';
import intelligentCacheManager from './intelligentCacheManager.js';

class EnhancedImageService {
  constructor() {
    this.cache = new Map();
    this.loadingPromises = new Map();
    this.subscribers = new Set();
    
    console.log('🖼️ Enhanced Image Service initialized');
  }

  /**
   * Subscribe to image loading updates
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Notify subscribers of image updates
   */
  notifySubscribers(event, data) {
    this.subscribers.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Image service subscriber error:', error);
      }
    });
  }

  /**
   * Get breed images for Care Guides (replaces the old getBreedImages function)
   * This is the main method that replaces static placeholder images with AI-driven ones
   */
  async getBreedImages(breedName, size = 'medium', count = 6) {
    try {
      console.log(`🔍 Enhanced Image Service: Getting AI-driven images for breed: "${breedName}"`);
      console.log(`🔍 Parameters: size=${size}, count=${count}`);

      // Check if we have a loading promise for this breed
      const cacheKey = `${breedName}_${size}_${count}`;
      if (this.loadingPromises.has(cacheKey)) {
        console.log(`⏳ Waiting for existing request for: ${breedName}`);
        return await this.loadingPromises.get(cacheKey);
      }

      // Create loading promise
      const loadingPromise = this.fetchBreedImagesInternal(breedName, size, count);
      this.loadingPromises.set(cacheKey, loadingPromise);

      try {
        const result = await loadingPromise;
        this.loadingPromises.delete(cacheKey);
        console.log(`✅ Successfully loaded ${result.length} images for: ${breedName}`);
        return result;
      } catch (error) {
        this.loadingPromises.delete(cacheKey);
        throw error;
      }

    } catch (error) {
      console.error(`❌ Error in getBreedImages for "${breedName}":`, error);
      return this.getFallbackImages(breedName, count);
    }
  }

  /**
   * Internal method to fetch breed images using AI integration
   */
  async fetchBreedImagesInternal(breedName, size, count) {
    try {
      // First check intelligent cache
      const cachedResult = await intelligentCacheManager.getCachedImages(breedName, { size, count });
      if (cachedResult.success) {
        console.log(`💾 Using cached images for ${breedName}`);
        return cachedResult.images;
      }

      // Use the prediction service to get images for care guides
      const imageResult = await predictionService.getBreedImagesForCareGuides(breedName, {
        imageCount: count,
        prioritizeQuality: true,
        includeFallbacks: true
      });

      if (imageResult.success && imageResult.images.length > 0) {
        // Transform images to the expected format for the UI
        const transformedImages = this.transformImagesForUI(imageResult.images, size);
        
        // Cache the results with intelligent caching
        await intelligentCacheManager.setCacheImages(breedName, transformedImages, { size, count });
        
        // Notify subscribers
        this.notifySubscribers('images_loaded', {
          breedName,
          images: transformedImages,
          source: 'ai_driven'
        });

        return transformedImages;
      } else {
        console.warn(`No AI-driven images found for ${breedName}, using fallbacks`);
        return this.getFallbackImages(breedName, count);
      }

    } catch (error) {
      console.error(`Error fetching AI-driven images for ${breedName}:`, error);
      return this.getFallbackImages(breedName, count);
    }
  }

  /**
   * Transform API images to UI-compatible format
   */
  transformImagesForUI(apiImages, size) {
    return apiImages.map((image, index) => ({
      id: image.id || `img_${index}`,
      url: this.getImageUrlForSize(image.url, size),
      thumbnail: image.thumbnail || this.getImageUrlForSize(image.url, 'thumbnail'),
      alt: image.alt || 'Dog breed image',
      title: image.title || image.alt,
      
      // Enhanced metadata
      source: image.source || 'External API',
      quality: image.quality || 'standard',
      breedAccuracy: image.breedAccuracy || 0.5,
      
      // Credit information (if available)
      credit: image.credit ? {
        photographer: image.credit.photographer,
        source: image.credit.source || image.source
      } : null,
      
      // AI-specific metadata
      confidence: image.confidence || null,
      parentBreed: image.parentBreed || null,
      isAiGenerated: false,
      isFallback: image.isFallback || false
    }));
  }

  /**
   * Get appropriate image URL for different sizes
   */
  getImageUrlForSize(originalUrl, size) {
    // If the URL supports size parameters, modify it
    if (originalUrl.includes('unsplash.com')) {
      const sizeParams = {
        thumbnail: 'w=300&h=200&fit=crop',
        medium: 'w=600&h=400&fit=crop',
        large: 'w=1200&h=800&fit=crop'
      };
      return `${originalUrl}&${sizeParams[size] || sizeParams.medium}`;
    }
    
    // For other sources, return original URL
    return originalUrl;
  }

  /**
   * Get breed hero image (single featured image for breed cards)
   */
  async getBreedHeroImage(breedName) {
    try {
      const images = await this.getBreedImages(breedName, 'medium', 1);
      return images.length > 0 ? images[0] : this.getFallbackHeroImage(breedName);
    } catch (error) {
      console.error(`Error getting hero image for ${breedName}:`, error);
      return this.getFallbackHeroImage(breedName);
    }
  }

  /**
   * Get breed thumbnail image (small image for lists)
   */
  async getBreedThumbnail(breedName) {
    try {
      const images = await this.getBreedImages(breedName, 'thumbnail', 1);
      return images.length > 0 ? images[0] : this.getFallbackThumbnail(breedName);
    } catch (error) {
      console.error(`Error getting thumbnail for ${breedName}:`, error);
      return this.getFallbackThumbnail(breedName);
    }
  }

  /**
   * Get images for breed gallery (multiple images for detailed view)
   */
  async getBreedGallery(breedName, count = 8) {
    try {
      return await this.getBreedImages(breedName, 'large', count);
    } catch (error) {
      console.error(`Error getting gallery for ${breedName}:`, error);
      return this.getFallbackImages(breedName, count);
    }
  }

  /**
   * Get images based on AI prediction result (for scan results)
   */
  async getImagesFromPrediction(predictionResult) {
    try {
      if (!predictionResult || !predictionResult.success) {
        throw new Error('Invalid prediction result');
      }

      // If images are already loaded in the prediction
      if (predictionResult.images && predictionResult.images.images) {
        return this.transformImagesForUI(predictionResult.images.images, 'medium');
      }

      // If prediction is available but images not loaded yet
      if (predictionResult.primaryBreed) {
        const breedName = predictionResult.primaryBreed.normalized;
        return await this.getBreedImages(breedName, 'medium', 6);
      }

      throw new Error('No breed information in prediction result');

    } catch (error) {
      console.error('Error getting images from prediction:', error);
      return [];
    }
  }

  /**
   * Preload images for commonly viewed breeds
   */
  async preloadPopularBreeds(breedNames) {
    console.log('📦 Preloading images for popular breeds with intelligent caching...');
    
    try {
      // Use intelligent cache manager for smart preloading
      await intelligentCacheManager.preloadPopularBreeds(breedNames);
      console.log('📦 Intelligent preloading completed');
    } catch (error) {
      console.error('Error in intelligent preloading:', error);
      
      // Fallback to simple preloading
      const preloadPromises = breedNames.map(async (breedName) => {
        try {
          await this.getBreedImages(breedName, 'medium', 3);
          console.log(`✅ Preloaded images for ${breedName}`);
        } catch (error) {
          console.warn(`❌ Failed to preload images for ${breedName}:`, error);
        }
      });

      await Promise.allSettled(preloadPromises);
      console.log('📦 Fallback preloading completed');
    }
  }

  /**
   * Generate fallback images when AI/API images are unavailable
   */
  getFallbackImages(breedName, count) {
    const fallbacks = [];
    
    for (let i = 0; i < count; i++) {
      fallbacks.push({
        id: `fallback_${breedName}_${i}`,
        url: this.generatePlaceholderUrl(breedName, 'medium'),
        thumbnail: this.generatePlaceholderUrl(breedName, 'thumbnail'),
        alt: `${breedName} placeholder`,
        title: `${breedName} - Image unavailable`,
        source: 'Generated Placeholder',
        quality: 'placeholder',
        breedAccuracy: 0,
        isFallback: true,
        isAiGenerated: false
      });
    }

    return fallbacks;
  }

  /**
   * Get fallback hero image
   */
  getFallbackHeroImage(breedName) {
    return {
      id: `hero_${breedName}`,
      url: this.generatePlaceholderUrl(breedName, 'medium'),
      thumbnail: this.generatePlaceholderUrl(breedName, 'thumbnail'),
      alt: `${breedName} hero image`,
      title: breedName,
      source: 'Generated Placeholder',
      quality: 'placeholder',
      isFallback: true
    };
  }

  /**
   * Get fallback thumbnail image
   */
  getFallbackThumbnail(breedName) {
    return {
      id: `thumb_${breedName}`,
      url: this.generatePlaceholderUrl(breedName, 'thumbnail'),
      thumbnail: this.generatePlaceholderUrl(breedName, 'thumbnail'),
      alt: `${breedName} thumbnail`,
      title: breedName,
      source: 'Generated Placeholder',
      quality: 'placeholder',
      isFallback: true
    };
  }

  /**
   * Generate placeholder URL for fallback images
   */
  generatePlaceholderUrl(breedName, size) {
    const dimensions = {
      thumbnail: '300x200',
      medium: '600x400',
      large: '1200x800'
    };

    const encodedBreedName = encodeURIComponent(breedName);
    const dimension = dimensions[size] || dimensions.medium;
    
    return `https://via.placeholder.com/${dimension}/4A90E2/FFFFFF?text=${encodedBreedName}`;
  }

  /**
   * Search for breed images by query
   */
  async searchBreedImages(query, count = 12) {
    try {
      // Find matching breeds using AI model integration
      const matchingBreeds = aiModelIntegrationService.getAllBreeds()
        .filter(breed => 
          breed.normalized.toLowerCase().includes(query.toLowerCase()) ||
          breed.searchTerms.some(term => term.toLowerCase().includes(query.toLowerCase()))
        );

      // Get images for matching breeds
      const imagePromises = matchingBreeds.slice(0, 10).map(async (breed) => {
        const images = await this.getBreedImages(breed.normalized, 'medium', 1);
        return {
          breed: breed.normalized,
          images: images
        };
      });

      const results = await Promise.allSettled(imagePromises);
      
      // Flatten and return all images
      const allImages = [];
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.images.length > 0) {
          allImages.push(...result.value.images.map(img => ({
            ...img,
            breedName: result.value.breed
          })));
        }
      });

      return allImages.slice(0, count);

    } catch (error) {
      console.error('Error searching breed images:', error);
      return [];
    }
  }

  /**
   * Clear cache for specific breed or all breeds
   */
  clearCache(breedName = null) {
    if (breedName) {
      // Clear cache for specific breed
      for (const key of this.cache.keys()) {
        if (key.startsWith(breedName)) {
          this.cache.delete(key);
        }
      }
      console.log(`🗑️ Cleared cache for ${breedName}`);
    } else {
      // Clear all cache
      this.cache.clear();
      console.log('🗑️ Cleared all image cache');
    }

    // Also clear the intelligent cache manager and underlying API service cache
    intelligentCacheManager.clearAll();
    imageApiService.clearCache(breedName);
  }

  /**
   * Get service statistics including intelligent cache metrics
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      activePromises: this.loadingPromises.size,
      subscribers: this.subscribers.size,
      intelligentCache: intelligentCacheManager.getCacheStatistics(),
      apiServiceStats: imageApiService.getCacheStats()
    };
  }
}

// Create singleton instance
const enhancedImageService = new EnhancedImageService();

// Export both the service and individual functions for backward compatibility
export default enhancedImageService;

// Backward compatible exports
export const getBreedImages = (breedName, size, count) => 
  enhancedImageService.getBreedImages(breedName, size, count);

export const getBreedHeroImage = (breedName) => 
  enhancedImageService.getBreedHeroImage(breedName);

export const getBreedThumbnail = (breedName) => 
  enhancedImageService.getBreedThumbnail(breedName);

export const getBreedGallery = (breedName, count) => 
  enhancedImageService.getBreedGallery(breedName, count);
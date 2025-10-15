// Dynamic Image API Service
// Integrates with external APIs to fetch breed-specific images based on AI predictions
// Supports Dog CEO API, Unsplash API, and intelligent fallback strategies

import aiModelIntegrationService from './aiModelIntegrationService.js';

class ImageApiService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
    this.requestQueue = new Map();
    this.rateLimits = {
      dogCeo: { requests: 0, resetTime: 0, limit: 1000 }, // Dog CEO is generous
      unsplash: { requests: 0, resetTime: 0, limit: 50 } // More restrictive
    };
    
    // API endpoints
    this.dogCeoBaseUrl = 'https://dog.ceo/api';
    this.unsplashBaseUrl = 'https://api.unsplash.com';
    this.unsplashAccessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || 'demo'; // Add to .env
    
    this.initializeApis();
  }

  /**
   * Initialize API configurations and test connectivity
   */
  async initializeApis() {
    console.log('🐕 Initializing Dynamic Image API Service...');
    
    try {
      // Test Dog CEO API connectivity
      const dogCeoTest = await this.testDogCeoApi();
      console.log(`🐕 Dog CEO API: ${dogCeoTest ? '✅ Available' : '❌ Unavailable'}`);
      
      // Test Unsplash API if key is available
      const unsplashTest = this.unsplashAccessKey !== 'demo' ? await this.testUnsplashApi() : false;
      console.log(`📸 Unsplash API: ${unsplashTest ? '✅ Available' : '❌ Unavailable (set VITE_UNSPLASH_ACCESS_KEY)'}`);
      
      this.apiStatus = {
        dogCeo: dogCeoTest,
        unsplash: unsplashTest,
        lastChecked: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('API initialization error:', error);
      this.apiStatus = { dogCeo: false, unsplash: false, error: error.message };
    }
  }

  /**
   * Test Dog CEO API connectivity
   */
  async testDogCeoApi() {
    try {
      const response = await fetch(`${this.dogCeoBaseUrl}/breeds/list/all`);
      const data = await response.json();
      return data.status === 'success';
    } catch (error) {
      console.warn('Dog CEO API test failed:', error);
      return false;
    }
  }

  /**
   * Test Unsplash API connectivity
   */
  async testUnsplashApi() {
    if (this.unsplashAccessKey === 'demo') return false;
    
    try {
      const response = await fetch(`${this.unsplashBaseUrl}/photos/random?client_id=${this.unsplashAccessKey}&count=1&query=dog`);
      return response.ok;
    } catch (error) {
      console.warn('Unsplash API test failed:', error);
      return false;
    }
  }

  /**
   * Main method: Fetch breed-specific images based on AI prediction
   */
  async fetchBreedImages(predictionResult, options = {}) {
    const {
      imageCount = 6,
      includeFallbacks = true,
      prioritizeQuality = true,
      forceRefresh = false
    } = options;

    try {
      console.log('🔍 Fetching images for prediction:', predictionResult);

      if (!predictionResult.success || !predictionResult.primaryBreed) {
        throw new Error('Invalid prediction result');
      }

      const breedInfo = predictionResult.primaryBreed;
      const cacheKey = `${breedInfo.normalized}_${imageCount}`;

      // Check cache first (unless force refresh)
      if (!forceRefresh && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheExpiry) {
          console.log('📦 Using cached images for', breedInfo.normalized);
          return { ...cached.data, source: 'cache' };
        }
      }

      // Generate query parameters
      const queryParams = aiModelIntegrationService.generateImageQueryParams(breedInfo, {
        imageCount,
        priorityLevel: prioritizeQuality ? 'high' : 'standard'
      });

      // Fetch from multiple sources in parallel
      const imagePromises = [];

      // Dog CEO API (primary source)
      if (this.apiStatus.dogCeo) {
        imagePromises.push(this.fetchFromDogCeoApi(queryParams.dogCeoApi, breedInfo));
      }

      // Unsplash API (secondary source for quality)
      if (this.apiStatus.unsplash && prioritizeQuality) {
        imagePromises.push(this.fetchFromUnsplashApi(queryParams.unsplashApi, breedInfo));
      }

      // Execute parallel requests
      const results = await Promise.allSettled(imagePromises);
      
      // Process and combine results
      const combinedImages = this.combineImageResults(results, breedInfo, imageCount);

      // Add fallback images if needed
      if (combinedImages.length < imageCount && includeFallbacks) {
        const fallbacks = await this.generateFallbackImages(breedInfo, imageCount - combinedImages.length);
        combinedImages.push(...fallbacks);
      }

      // Prepare final result
      const finalResult = {
        success: true,
        breedName: breedInfo.normalized,
        images: combinedImages.slice(0, imageCount),
        metadata: {
          totalFetched: combinedImages.length,
          sources: this.getUsedSources(results),
          fetchTime: new Date().toISOString(),
          predictionConfidence: predictionResult.primaryBreed?.confidence || 0
        }
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: finalResult,
        timestamp: Date.now()
      });

      console.log('✅ Successfully fetched images for', breedInfo.normalized);
      return finalResult;

    } catch (error) {
      console.error('Error fetching breed images:', error);
      return {
        success: false,
        error: error.message,
        breedName: predictionResult.primaryBreed?.normalized || 'Unknown',
        images: [],
        fallbackGenerated: true
      };
    }
  }

  /**
   * Fetch images from Dog CEO API
   */
  async fetchFromDogCeoApi(queryParams, breedInfo) {
    try {
      // Check rate limit
      if (!this.checkRateLimit('dogCeo')) {
        throw new Error('Dog CEO API rate limit exceeded');
      }

      const breedName = queryParams.breed;
      let apiUrl = `${this.dogCeoBaseUrl}/breed/${breedName}/images`;
      
      console.log(`🐕 Fetching from Dog CEO API: ${breedName}`);
      
      let response = await fetch(apiUrl);
      let data = await response.json();

      // If breed not found, try fallback approaches
      if (data.status !== 'success') {
        console.log(`🔄 Breed ${breedName} not found, trying fallbacks...`);
        
        // Fallback 1: Try with breed name variations
        for (const searchTerm of breedInfo.searchTerms) {
          const altBreedName = searchTerm.toLowerCase().replace(/\s+/g, '');
          const altUrl = `${this.dogCeoBaseUrl}/breed/${altBreedName}/images`;
          
          try {
            response = await fetch(altUrl);
            data = await response.json();
            
            if (data.status === 'success') {
              console.log(`✅ Found images using alternative name: ${altBreedName}`);
              break;
            }
          } catch (e) {
            console.warn(`Failed to fetch with ${altBreedName}:`, e);
          }
        }
        
        // Fallback 2: Try without sub-breed format (e.g., terrier/yorkshire -> yorkshire)
        if (data.status !== 'success' && breedName.includes('/')) {
          const subBreed = breedName.split('/')[1];
          const fallbackUrl = `${this.dogCeoBaseUrl}/breed/${subBreed}/images`;
          
          try {
            response = await fetch(fallbackUrl);
            data = await response.json();
            
            if (data.status === 'success') {
              console.log(`✅ Found images using sub-breed: ${subBreed}`);
            }
          } catch (e) {
            console.warn(`Failed to fetch with sub-breed ${subBreed}:`, e);
          }
        }
        
        // Fallback 3: Try main breed from sub-breed format (e.g., terrier/yorkshire -> terrier)
        if (data.status !== 'success' && breedName.includes('/')) {
          const mainBreed = breedName.split('/')[0];
          const fallbackUrl = `${this.dogCeoBaseUrl}/breed/${mainBreed}/images`;
          
          try {
            response = await fetch(fallbackUrl);
            data = await response.json();
            
            if (data.status === 'success') {
              console.log(`✅ Found images using main breed: ${mainBreed}`);
            }
          } catch (e) {
            console.warn(`Failed to fetch with main breed ${mainBreed}:`, e);
          }
        }
      }

      // Final fallback: random dog images
      if (data.status !== 'success') {
        console.log('🎲 Using random dog images as fallback');
        response = await fetch(`${this.dogCeoBaseUrl}/breeds/image/random/${queryParams.requestLimit}`);
        data = await response.json();
      }

      this.updateRateLimit('dogCeo');

      if (data.status === 'success') {
        const images = Array.isArray(data.message) ? data.message : [data.message];
        return {
          source: 'dogCeo',
          success: true,
          images: images.slice(0, queryParams.requestLimit).map((url, index) => ({
            id: `dogceo_${breedInfo.normalized}_${index}`,
            url: url,
            thumbnail: url, // Dog CEO doesn't provide thumbnails
            alt: `${breedInfo.normalized} dog`,
            source: 'Dog CEO API',
            breedAccuracy: this.estimateBreedAccuracy(url, breedInfo),
            quality: 'standard'
          }))
        };
      }

      throw new Error('Dog CEO API returned error: ' + data.message);

    } catch (error) {
      console.error('Dog CEO API error:', error);
      return { source: 'dogCeo', success: false, error: error.message, images: [] };
    }
  }

  /**
   * Fetch images from Unsplash API
   */
  async fetchFromUnsplashApi(queryParams, breedInfo) {
    try {
      if (this.unsplashAccessKey === 'demo') {
        throw new Error('Unsplash API key not configured');
      }

      // Check rate limit
      if (!this.checkRateLimit('unsplash')) {
        throw new Error('Unsplash API rate limit exceeded');
      }

      const searchQuery = encodeURIComponent(queryParams.query);
      const apiUrl = `${this.unsplashBaseUrl}/search/photos?client_id=${this.unsplashAccessKey}&query=${searchQuery}&per_page=${queryParams.parameters.per_page}&orientation=${queryParams.parameters.orientation}&content_filter=${queryParams.parameters.content_filter}`;

      console.log(`📸 Fetching from Unsplash API: ${queryParams.query}`);

      const response = await fetch(apiUrl);
      const data = await response.json();

      this.updateRateLimit('unsplash');

      if (response.ok && data.results && data.results.length > 0) {
        return {
          source: 'unsplash',
          success: true,
          images: data.results.map((photo, index) => ({
            id: `unsplash_${breedInfo.normalized}_${index}`,
            url: photo.urls.regular,
            thumbnail: photo.urls.thumb,
            alt: photo.alt_description || `${breedInfo.normalized} dog`,
            source: 'Unsplash',
            credit: {
              photographer: photo.user.name,
              photographerUrl: photo.user.links.html,
              downloadLocation: photo.links.download_location
            },
            breedAccuracy: this.estimateBreedAccuracy(photo.alt_description, breedInfo),
            quality: 'high'
          }))
        };
      }

      throw new Error('No images found on Unsplash for query: ' + queryParams.query);

    } catch (error) {
      console.error('Unsplash API error:', error);
      return { source: 'unsplash', success: false, error: error.message, images: [] };
    }
  }

  /**
   * Combine results from multiple image sources
   */
  combineImageResults(results, breedInfo, targetCount) {
    const allImages = [];
    const sourceQuality = { unsplash: 3, dogCeo: 2, fallback: 1 };

    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value.success) {
        allImages.push(...result.value.images);
      }
    });

    // Sort by quality and breed accuracy
    allImages.sort((a, b) => {
      const qualityDiff = sourceQuality[b.source] - sourceQuality[a.source];
      if (qualityDiff !== 0) return qualityDiff;
      
      return (b.breedAccuracy || 0) - (a.breedAccuracy || 0);
    });

    // Remove duplicates and return top results
    const uniqueImages = this.removeDuplicateImages(allImages);
    return uniqueImages.slice(0, targetCount);
  }

  /**
   * Remove duplicate images based on URL similarity
   */
  removeDuplicateImages(images) {
    const seen = new Set();
    return images.filter(image => {
      const urlHash = image.url.replace(/[?&].*$/, ''); // Remove query parameters
      if (seen.has(urlHash)) return false;
      seen.add(urlHash);
      return true;
    });
  }

  /**
   * Generate fallback images when API results are insufficient
   */
  async generateFallbackImages(breedInfo, count) {
    const fallbacks = [];
    
    for (let i = 0; i < count; i++) {
      fallbacks.push({
        id: `fallback_${breedInfo.normalized}_${i}`,
        url: this.generatePlaceholderImage(breedInfo),
        thumbnail: this.generatePlaceholderImage(breedInfo, true),
        alt: `${breedInfo.normalized} placeholder`,
        source: 'Generated Placeholder',
        breedAccuracy: 0,
        quality: 'placeholder',
        isFallback: true
      });
    }

    return fallbacks;
  }

  /**
   * Generate placeholder image for breed
   */
  generatePlaceholderImage(breedInfo, isThumbnail = false) {
    const size = isThumbnail ? '300x200' : '800x600';
    const encodedBreedName = encodeURIComponent(breedInfo.normalized);
    
    // Use a placeholder service that can display breed name
    return `https://via.placeholder.com/${size}/4A90E2/FFFFFF?text=${encodedBreedName}`;
  }

  /**
   * Estimate breed accuracy based on image metadata
   */
  estimateBreedAccuracy(imageDescription, breedInfo) {
    if (!imageDescription) return 0.5; // Default neutral score

    const validation = aiModelIntegrationService.validateImageBreedMatch(
      { description: imageDescription },
      breedInfo
    );

    return validation.confidence;
  }

  /**
   * Check API rate limits
   */
  checkRateLimit(apiName) {
    const limit = this.rateLimits[apiName];
    const now = Date.now();

    // Reset counter if past reset time
    if (now > limit.resetTime) {
      limit.requests = 0;
      limit.resetTime = now + (60 * 60 * 1000); // Reset every hour
    }

    return limit.requests < limit.limit;
  }

  /**
   * Update rate limit counters
   */
  updateRateLimit(apiName) {
    this.rateLimits[apiName].requests++;
  }

  /**
   * Get list of sources used in the latest request
   */
  getUsedSources(results) {
    return results
      .filter(result => result.status === 'fulfilled' && result.value.success)
      .map(result => result.value.source);
  }

  /**
   * Handle multi-breed predictions (crossbreeds)
   */
  async fetchMultiBreedImages(predictionResult, options = {}) {
    if (!predictionResult.isMultiBreed || predictionResult.predictions.length < 2) {
      return this.fetchBreedImages(predictionResult, options);
    }

    console.log('🐕‍🦺 Fetching images for multi-breed prediction...');

    const breedResults = await Promise.all(
      predictionResult.predictions.slice(0, 3).map(prediction => // Max 3 breeds
        this.fetchBreedImages(
          { success: true, primaryBreed: prediction.breed },
          { ...options, imageCount: Math.ceil(options.imageCount / predictionResult.predictions.length) }
        )
      )
    );

    // Combine results with breed labeling
    const combinedImages = [];
    breedResults.forEach((result, index) => {
      if (result.success) {
        const prediction = predictionResult.predictions[index];
        result.images.forEach(image => {
          combinedImages.push({
            ...image,
            parentBreed: prediction.breed.normalized,
            confidence: prediction.confidence,
            rank: prediction.rank
          });
        });
      }
    });

    return {
      success: true,
      isMultiBreed: true,
      breedName: predictionResult.predictions.map(p => p.breed.normalized).join(' × '),
      images: combinedImages.slice(0, options.imageCount || 6),
      breedBreakdown: predictionResult.predictions.map(p => ({
        breed: p.breed.normalized,
        confidence: p.confidence
      })),
      metadata: {
        totalBreeds: predictionResult.predictions.length,
        fetchTime: new Date().toISOString()
      }
    };
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
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      apiStatus: this.apiStatus,
      rateLimits: this.rateLimits
    };
  }
}

// Create singleton instance
const imageApiService = new ImageApiService();

export default imageApiService;